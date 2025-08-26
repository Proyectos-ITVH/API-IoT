const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || '../../serviceAccountKey.json');
const bcrypt = require('bcrypt');

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Funciones que encapsulan la lógica de la base de datos
const firestoreService = {
  // Guarda los datos de un sensor
  addSensorData: async (data) => {
    return await db.collection('lecturas_sensores').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  // Obtiene un usuario por su ID
  getUserById: async (userId) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    // Importante: Verifica si el documento existe
    if (!userDoc.exists) {
        return null; // Devuelve null si no se encuentra el usuario
    }

    // Devuelve los datos del documento y su ID
    return { id: userDoc.id, ...userDoc.data() };
},

  // Guarda los datos de Arduino
  addArduinoData: async (data) => {
    return await db.collection('arduino_lecturas').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  // Obtiene los estanques
  getTanks: async () => {
    const snapshot = await db.collection('estanques').get();
    if (snapshot.empty) {
      return [];
    }
    const tanks = [];
    snapshot.forEach(doc => {
      tanks.push({ id: doc.id, ...doc.data() });
    });
    return tanks;
  },
  
  // Obtiene las lecturas de un estanque
  getSensorReadings: async (estanqueId, limit) => {
    const query = db.collection('lecturas_sensores')
      .where('estanqueId', '==', estanqueId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return null; // O un array vacío, según tu preferencia
    }

    const readings = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        data.timestamp = data.timestamp.toDate().toISOString();
      }
      readings.push({ id: doc.id, ...data });
    });
    return readings;
  },
  // Función para registrar un nuevo usuario
  registerUser: async (email, password, nombre, numeroTelefonico, rolUser) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const docRef = await db.collection('users').add({
      email: email,
      password: hashedPassword,
      nombre: nombre || null, // Guardamos el nombre
      numeroTelefonico: numeroTelefonico || null, // Guardamos el número de teléfono
      rolUser: rolUser || null, // Guardamos el rol del usuario
      createdAt: admin.firestore.FieldValue.serverTimestamp() // Guardamos la fecha de creación del usuario 
    });
    return docRef;
  },

  // Función para buscar un usuario por su email
  findUserByEmail: async (email) => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    // Retorna el primer y único documento encontrado
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },
  // Función para obtener todos los usuarios
  getUsers: async () => {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Función para actualizar un usuario
  updateUser: async (userId, updateData) => {
    const docRef = db.collection('users').doc(userId);

    // Si se intenta actualizar la contraseña, la hasheamos
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Si se intenta actualizar el email, verificamos que no exista
    if (updateData.email) {
        const existingUser = await firestoreService.findUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
            throw new Error('El nuevo email ya está en uso por otro usuario.');
        }
    }

    await docRef.update(updateData);
    return true;
  },

  // Función para eliminar un usuario
  deleteUser: async (userId) => {
    const docRef = db.collection('users').doc(userId);
    await docRef.delete();
    return true;
  }
};

module.exports = firestoreService;