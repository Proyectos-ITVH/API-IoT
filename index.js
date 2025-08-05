const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Carga las variables de entorno desde un archivo .env
dotenv.config();
//Credenciales de Firebase
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json');

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtén una referencia a la base de datos Firestore
const db = admin.firestore();

// Inicializa la aplicación Express
const app = express();
const port = process.env.PORT || 3000; // Puerto donde correrá la API

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// --- Rutas de la API ---

/** EndPoint para agregar de manera manual datos de sensores prueba
 * @route POST /api/sensor-data
 * @description Recibe datos de sensores de un Arduino y los guarda en Firestore.
 * @body {
 * "estanqueId": "Estanque1",
 * "temperatura": 25.5,
 * "ph": 7.2,
 * "solidos_disueltos": 320,
 * "oxigeno": 8.1,
 * "turbidez": 15, // Asegúrate de incluir todos los sensores
 * "observaciones": "Nivel de agua bajo, se rellenó." // Opcional
 * }
 */
app.post('/api/sensor-data', async (req, res) => {
  try {
    const { estanqueId, temperatura, ph, solidos_disueltos, oxigeno, turbidez, observaciones } = req.body;

    // Validar que se recibieron los datos mínimos
    if (!estanqueId || !temperatura || !ph || !solidos_disueltos || !oxigeno || !turbidez) {
      return res.status(400).send({ message: 'Faltan parámetros requeridos de los sensores.' });
    }

    // Crear el objeto de datos para Firestore
    const sensorData = {
      estanqueId: estanqueId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Firestore registra la hora del servidor
      valores_sensores: {
        temperatura,
        ph,
        solidos_disueltos,
        oxigeno,
        turbidez
      }
    };

    // Añadir observaciones si existen
    if (observaciones) {
      sensorData.observaciones = observaciones;
    }

    // Guardar los datos en la colección 'lecturas_sensores'
    const docRef = await db.collection('lecturas_sensores').add(sensorData);
    console.log(`Datos de sensor guardados con ID: ${docRef.id}`);

    res.status(201).send({ message: 'Datos de sensor recibidos y guardados exitosamente.', id: docRef.id });

  } catch (error) {
    console.error('Error al guardar datos de sensor:', error);
    res.status(500).send({ message: 'Error interno del servidor al procesar los datos del sensor.', error: error.message });
  }
});

/** EndPoint para agregar datos de sensores desde Arduino
 * @route POST /api/arduino-data
 * @description Recibe datos de sensores de un Arduino y los guarda en Firestore en una colección separada.
 * @body {
 * "sensor": "DHT22",
 * "temperatura": 25.5,
 * "humedad": 60.3
 * }
 */
app.post('/api/arduino-data', async (req, res) => {
  try {
    const { sensor, temperatura, humedad } = req.body;

    // Validar que se recibieron los datos mínimos
    if (!sensor || !temperatura || !humedad) {
      return res.status(400).send({ message: 'Faltan parámetros requeridos del Arduino (sensor, temperatura, humedad).' });
    }

    // Crear el objeto de datos para Firestore
    const arduinoData = {
      sensorType: sensor,
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Firestore registra la hora del servidor
      valores: {
        temperatura,
        humedad
      }
    };

    // Guardar los datos en la colección 'arduino_lecturas'
    const docRef = await db.collection('arduino_lecturas').add(arduinoData);
    console.log(`Datos de Arduino guardados con ID: ${docRef.id}`);

    res.status(201).send({ message: 'Datos de Arduino recibidos y guardados exitosamente.', id: docRef.id });

  } catch (error) {
    console.error('Error al guardar datos de Arduino:', error);
    res.status(500).send({ message: 'Error interno del servidor al procesar los datos del Arduino.', error: error.message });
  }
});

/**
 * Endpoint GET /api/tanks
 * Obtiene la lista de todos los estanques con su configuración.
 */
app.get('/api/tanks', async (req, res) => {
  try {
    const tanksRef = db.collection('estanques');
    const snapshot = await tanksRef.get();

    if (snapshot.empty) {
      return res.status(404).send({ message: 'No se encontraron estanques.' });
    }

    const tanks = [];
    snapshot.forEach(doc => {
      tanks.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(tanks);

  } catch (error) {
    console.error('Error al obtener estanques:', error);
    res.status(500).send({ message: 'Error interno del servidor al obtener la lista de estanques.', error: error.message });
  }
});

/**
 * Endpoint GET /api/sensor-readings/:estanqueId
 * Obtiene las últimas N lecturas de sensores para un estanque específico, ordenadas por timestamp.
 * tiene limit (opcional): Número de lecturas a devolver (por defecto 10).
 */
app.get('/api/sensor-readings/:estanqueId', async (req, res) => {
  try {
    const { estanqueId } = req.params;
    const limit = parseInt(req.query.limit) || 10; // Límite de resultados, por defecto 10

    if (!estanqueId) {
      return res.status(400).send({ message: 'ID del estanque es requerido.' });
    }

    const readingsRef = db.collection('lecturas_sensores');
    const query = readingsRef
      .where('estanqueId', '==', estanqueId) // Filtra por estanque
      .orderBy('timestamp', 'desc')        // Ordena por fecha más reciente primero
      .limit(limit);                       // Limita el número de resultados

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(404).send({ message: `No se encontraron lecturas para el estanque con ID: ${estanqueId}.` });
    }

    const readings = [];
    snapshot.forEach(doc => {
      // Convertir el objeto Timestamp de Firestore a una cadena ISO para fácil manejo en el cliente
      const data = doc.data();
      if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        data.timestamp = data.timestamp.toDate().toISOString();
      }
      readings.push({ id: doc.id, ...data });
    });

    res.status(200).send(readings);

  } catch (error) {
    console.error('Error al obtener lecturas de sensor:', error);
    res.status(500).send({ message: 'Error interno del servidor al obtener las lecturas de los sensores.', error: error.message });
  }
});


// Ruta principal
app.get('/', (req, res) => {
  res.send('API de Monitoreo de Estanques de Peces está funcionando!');
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
  console.log(`Accede a la ruta principal: http://localhost:${port}`);
  console.log(`Para añadir datos de sensores (POST): http://localhost:${port}/api/sensor-data`);
  console.log(`Para obtener estanques (GET): http://localhost:${port}/api/tanks`);
  console.log(`Para obtener lecturas de sensor (GET): http://localhost:${port}/api/sensor-readings/:estanqueId`);
});
