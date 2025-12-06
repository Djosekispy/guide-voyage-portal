import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config - você precisa adicionar suas credenciais
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAXQwkwQ5M7vgQEcTdHKj_z02IxEjDh4qg",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "guide-voyage-bd.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "guide-voyage-bd",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "guide-voyage-bd.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1017906055502",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1017906055502:web:56a85c4c8b02c5c9c8e7db",
};

interface AdminSetupConfig {
  email: string;
  password: string;
  name: string;
}

const DEFAULT_ADMIN_CONFIG: AdminSetupConfig = {
  email: 'admin@guidevoyage.com',
  password: 'Admin@123456', // IMPORTANTE: Mudar em produção!
  name: 'Administrador',
};

export const initializeAdminSetup = async (config: AdminSetupConfig = DEFAULT_ADMIN_CONFIG): Promise<{ success: boolean; message: string; userId?: string }> => {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('Iniciando setup do admin padrão...');
    console.log(`Email: ${config.email}`);

    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, config.email, config.password);
    const userId = userCredential.user.uid;

    console.log(`Usuário criado com ID: ${userId}`);

    // Criar documento do usuário no Firestore
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      email: config.email,
      name: config.name,
      userType: 'admin',
      phone: '',
      city: '',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Admin padrão criado com sucesso!');
    return {
      success: true,
      message: `Admin criado com sucesso! Email: ${config.email}`,
      userId,
    };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        message: 'Este email já está registrado como admin',
      };
    }
    console.error('Erro ao criar admin padrão:', error);
    return {
      success: false,
      message: `Erro ao criar admin: ${error.message}`,
    };
  }
};

export const createAdminUser = async (email: string, password: string, name: string) => {
  return initializeAdminSetup({ email, password, name });
};

export default DEFAULT_ADMIN_CONFIG;
