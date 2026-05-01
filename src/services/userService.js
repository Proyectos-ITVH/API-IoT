const { db, admin } = require('./firestoreService');
const bcrypt = require('bcrypt');

const usersCollection = db.collection('users');

const userService = {
  // Registra un usuario en Firebase Auth y lo guarda en Firestore
  registerUser: async (email, password, nombre, numeroTelefonico, rolUser, createdBy) => {

    // Validación de campos obligatorios
    if (!nombre || !email || !password || !createdBy) {
      throw new Error("Nombre, email, contraseña y createdBy son obligatorios");
    }

    try {
      // Crear usuario en Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      // UID generado por Auth (guardado en firestore para asociarse con auth)
      const uid = userRecord.uid;

      // Encriptar contraseña para Firestore
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear documento en Firestore con ID automático
      const docRef = await usersCollection.add({
        email,
        password: hashedPassword,
        nombre: nombre || null,
        numeroTelefonico: numeroTelefonico || "",
        rolUser: rolUser || "user",
        createdBy,
        createdAt: new Date(),
        uid // se guarda como campo
      });

      // Retorna el ID del documento
      return { id: docRef.id };

    } catch (err) {
      // Manejo de errores de Firebase Auth
      if (err.code === "auth/email-already-exists") {
        throw new Error("El correo ya está registrado");
      }
      if (err.code === "auth/invalid-email") {
        throw new Error("Correo inválido");
      }
      if (err.code === "auth/weak-password") {
        throw new Error("Contraseña muy débil");
      }

      throw err;
    }
  },

  // Función para buscar un usuario por su UID
  getUserByUid: async (uid) => {
    const snapshot = await usersCollection
      .where('uid', '==', uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];

    return { id: doc.id, ...doc.data() };
  },

  // Función para buscar un usuario por su email
  findUserByEmail: async (email) => {
    const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  // Función para obtener todos los usuarios
  getUsers: async () => {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Actualiza un usuario en Auth y Firestore
  updateUser: async (userId, updateData) => {

    const docRef = usersCollection.doc(userId);

    // Verificar existencia
    const doc = await docRef.get();
    if (!doc.exists) {
      return false;
    }

    const userData = doc.data();
    const uid = userData.uid;

    try {
      // Preparar datos para Auth
      let authData = {};

      if (updateData.email) {
        authData.email = updateData.email;
      }

      if (updateData.password) {
        authData.password = updateData.password;
      }

      // Actualizar en Auth si aplica
      if (Object.keys(authData).length > 0) {
        await admin.auth().updateUser(uid, authData);
      }

      // Encriptar contraseña para Firestore
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      // Validar email único
      if (updateData.email) {
        const existingUser = await userService.findUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('El nuevo email ya está en uso por otro usuario.');
        }
      }

      // Limpiar undefined
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      // Actualizar Firestore
      await docRef.update({
        ...updateData,
        lastUpdated: new Date()
      });

      return true;

    } catch (err) {
      throw err;
    }
  },

  // Función para eliminar un usuario
  deleteUser: async (userId) => {
    const docRef = usersCollection.doc(userId);
    await docRef.delete();
    return true;
  }
};

module.exports = userService;