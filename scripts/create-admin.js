#!/usr/bin/env node

/**
 * Script para criar um admin padrão no sistema
 * 
 * Uso:
 *   node scripts/create-admin.js
 *   node scripts/create-admin.js --email seu@email.com --password sua_senha --name "Seu Nome"
 */

const admin = require('firebase-admin');
const readline = require('readline');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../firebase-service-account.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.log('⚠️  Arquivo de credenciais do Firebase não encontrado em:', serviceAccountPath);
  console.log('Para usar este script, exporte FIREBASE_SERVICE_ACCOUNT_PATH com o caminho do arquivo json');
  console.log('\nAlternativa: Execute através do Firebase Console ou use o script web-based');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();
const auth = admin.auth();

// Parse command line arguments
const args = process.argv.slice(2);
let email = 'admin@guidevoyage.com';
let password = 'Admin@123456';
let name = 'Administrador';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--email' && args[i + 1]) email = args[i + 1];
  if (args[i] === '--password' && args[i + 1]) password = args[i + 1];
  if (args[i] === '--name' && args[i + 1]) name = args[i + 1];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔐 Criador de Admin - Guide Voyage\n');

  // If arguments provided, skip prompts
  if (process.argv.length > 2) {
    console.log(`Email: ${email}`);
    console.log(`Nome: ${name}`);
    console.log(`Senha: ${'*'.repeat(password.length)}\n`);
  } else {
    // Interactive mode
    const inputEmail = await question('Email do admin: ');
    if (inputEmail) email = inputEmail;

    const inputName = await question('Nome completo: ');
    if (inputName) name = inputName;

    const inputPassword = await question('Senha (deixe em branco para usar padrão): ');
    if (inputPassword) password = inputPassword;
  }

  rl.close();

  try {
    console.log('\n⏳ Criando usuário...\n');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    console.log('✅ Usuário criado no Firebase Auth');

    // Create user document in Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      uid: userRecord.uid,
      email,
      name,
      userType: 'admin',
      phone: '',
      city: '',
      isActive: true,
      photoURL: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Documento criado no Firestore');

    console.log('\n✨ Admin criado com sucesso!\n');
    console.log('Credenciais:');
    console.log(`  Email: ${email}`);
    console.log(`  Senha: ${password}`);
    console.log(`  UID: ${userRecord.uid}\n`);
    console.log('⚠️  IMPORTANTE: Guarde estas credenciais em local seguro!');
    console.log('⚠️  Mude a senha após o primeiro login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
    if (error.code === 'auth/email-already-exists') {
      console.log('Este email já está registrado.');
    }
    process.exit(1);
  }
}

createAdmin();
