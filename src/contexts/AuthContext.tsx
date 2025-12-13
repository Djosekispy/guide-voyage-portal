import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_GUIDE_DATA } from '@/mock/deafultProvider';
import { Guide } from '@/lib/firestore';

interface UserData {
  uid: string;
  email: string;
  name: string;
  userType: 'tourist' | 'guide' | 'admin';
  phone?: string;
  city?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Omit<UserData, 'uid'>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // In development, log detailed information to help debugging root cause.
    if (import.meta.env.DEV) {
      console.error('useAuth must be used within an AuthProvider — no provider was found for this component. Returning a fallback no-op context to avoid crash.');
      // Add a stacktrace to help locate the caller
      console.trace();
    }

    // Provide a safe fallback in case some component is rendered outside the provider
    // This avoids hard throws which would cause the entire UI to go blank.
    const noop = async () => { throw new Error('AuthProvider not mounted'); };
    return {
      user: null,
      userData: null,
      loading: true,
      login: noop,
      register: noop,
      loginWithGoogle: noop,
      logout: noop,
      refreshUserData: noop,
    } as AuthContextType;
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          // Buscar dados adicionais do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log(JSON.stringify(userDoc.data()))
            setUserData(userDoc.data() as UserData);
          } else {
            // No Firestore doc found for this authenticated user
            console.warn('[AuthContext] No Firestore user doc found for uid:', user.uid);
            setUserData(null);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error in auth state changed handler:', error);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

const register = async (email: string, password: string, additionalData: Omit<UserData, 'uid'>) => {
  try {
    setLoading(true);
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar perfil do usuário com nome básico
    await updateProfile(user, {
      displayName: additionalData.name,
      photoURL: DEFAULT_GUIDE_DATA.photoURL
    });

    // Preparar dados do usuário
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      ...additionalData,
      photoURL: DEFAULT_GUIDE_DATA.photoURL
    };

    // Salvar dados básicos do usuário
    await setDoc(doc(db, 'users', user.uid), userData);

    // Se for guia, criar registro com dados padrão
    if (additionalData.userType === 'guide') {
      const guideData: Guide = {
        ...userData,
        ...DEFAULT_GUIDE_DATA,
        id: user.uid,
        uid: user.uid,
        name: additionalData.name,
        phone: additionalData.phone || '',
         city: additionalData.city || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'guides', user.uid), guideData);
      
      // Criar notificação para admins
      const { notifyNewUser } = await import('@/lib/firestore');
      await notifyNewUser(additionalData.name, 'guide', user.uid);
    } else if (additionalData.userType === 'tourist') {
      // Criar notificação para novos turistas também
      const { notifyNewUser } = await import('@/lib/firestore');
      await notifyNewUser(additionalData.name, 'tourist', user.uid);
    }

    setUserData(userData);
    
    toast({
      title: "Conta criada com sucesso!",
      description: additionalData.userType === 'guide' 
        ? "Seu perfil de guia foi criado com configurações padrão. Complete seu perfil para começar a receber clientes!" 
        : "Bem-vindo à plataforma!",
    });
    
  } catch (error: any) {
    console.error("Registration error:", error);
    
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Este email já está cadastrado.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "A senha deve ter pelo menos 6 caracteres.";
    }

    toast({
      title: "Erro ao criar conta",
      description: errorMessage,
      variant: "destructive",
    });
    throw error;
  } finally {
    setLoading(false);
  }
};

const loginWithGoogle = async () => {

  try {
    setLoading(true);

    const provider = new GoogleAuthProvider();

    // Configurar parâmetros e escopos
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    provider.addScope('email');
    provider.addScope('profile');

    // Abrir pop-up de login
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email) {
      throw new Error('Não foi possível obter o email do usuário');
    }

    // Verificar se o usuário já existe no Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Criar novo usuário
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName ?? user.email.split('@')[0],
        userType: 'tourist', // padrão, alterável
        photoURL: user.photoURL ?? undefined,
      };

      await setDoc(userRef, userData);
      setUserData(userData); // depende da sua lógica de app (Redux, Zustand etc.)
    }

    toast({
      title: 'Login com Google realizado!',
      description: 'Bem-vindo!',
    });
  } catch (error: any) {
    console.error('Erro no login com Google:', error);

    let errorMessage = 'Erro desconhecido';

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Login cancelado pelo usuário';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Pop-up bloqueado pelo navegador';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Solicitação de login cancelada';
        break;
      default:
        if (error.message) errorMessage = error.message;
        break;
    }

    toast({
      title: 'Erro no login com Google',
      description: errorMessage,
      variant: 'destructive',
    });

    throw error;
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        console.warn('[AuthContext] refreshUserData found no document for uid:', auth.currentUser.uid);
        setUserData(null);
      }
    } catch (error) {
      console.error('[AuthContext] refreshUserData error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    login,
    register,
    loginWithGoogle,
    logout
    ,refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};