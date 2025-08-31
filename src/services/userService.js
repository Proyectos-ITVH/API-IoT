const { db, admin } = require('./firestoreService');
const bcrypt = require('bcrypt');

const usersCollection = db.collection('users');

const userService = {
  // Función para registrar un nuevo usuario
  registerUser: async (email, password, nombre, numeroTelefonico, rolUser) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const docRef = await usersCollection.add({
      email: email,
      password: hashedPassword,
      nombre: nombre || null,
      numeroTelefonico: numeroTelefonico || null,
      rolUser: rolUser || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return docRef;
  },

  // Función para buscar un usuario por su ID
  getUserById: async (userId) => {
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
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

  // Función para actualizar un usuario
  updateUser: async (userId, updateData) => {
    const docRef = usersCollection.doc(userId);
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    if (updateData.email) {
      const existingUser = await userService.findUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('El nuevo email ya está en uso por otro usuario.');
      }
    }
    await docRef.update(updateData);
    return true;
  },

  // Función para eliminar un usuario
  deleteUser: async (userId) => {
    const docRef = usersCollection.doc(userId);
    await docRef.delete();
    return true;
  }
};

module.exports = userService;