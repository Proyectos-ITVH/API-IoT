const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json';

let serviceAccount;

try {
  const rawServiceAccount = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(rawServiceAccount);
} catch (error) {
  console.error('Error al cargar serviceAccountKey.json:', error.message);
  process.exit(1); 
}

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db, admin };