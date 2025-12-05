import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Guide {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  description: string;
  experience: number;
  pricePerHour: number;
  languages: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isProfileComplete?: boolean;
  photoURL?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  receiverId: string;
  content: string;
  timestamp: any;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[]; 
  participantNames: string[]; 
  lastMessage: string;
  lastMessageTimestamp: any;
  unreadCount: number;
  guidePhotoURL?: string;
  userPhotoURL?: string;
}
export interface CityGuidesSummary {
  name: string;
  coordinates: { lat: number; lng: number };
  guides: number;
  description: string;
  category: string;
  guideList?: Guide[]; 
}

export interface TourPackage {
  id: string;
  guideId: string;
  guideName: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  maxGroupSize: number;
  location: string;
  includes: string[];
  excludes: string[];
  itinerary: string[];
  images: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface Booking {
  id: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  touristPhone?: string;
  guideId: string;
  guideName: string;
  packageId?: string;
  packageTitle?: string;
  packageName?: string;
  city?: string;
  date: any;
  time?: string;
  duration?: number;
  totalPrice: number;
  groupSize?: number;
  numberOfPeople?: number;
  status: 'Pendente' | 'Confirmado' | 'Finalizado' | 'Cancelado' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Review {
  id: string;
  touristId: string;
  touristName: string;
  guideId: string;
  guideName: string;
  packageId?: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Favorite {
  id: string;
  userId: string;
  guideId: string;
  guideName: string;
  guidePhotoURL?: string;
  guideCity: string;
  guideRating: number;
  createdAt: any;
}

export interface BankAccount {
  id: string;
  guideId: string;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branchCode?: string;
  accountType: 'Conta Corrente' | 'Conta Poupança' | 'Conta Salário';
  taxId?: string; // CPF ou equivalente
  isPrimary: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  type: 'new_user' | 'new_booking' | 'new_review' | 'new_package' | 'booking_cancelled' | 'low_rating';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    userId?: string;
    userName?: string;
    bookingId?: string;
    guideId?: string;
    packageId?: string;
    rating?: number;
  };
  createdAt: any;
}

// Bank Account Functions
export const createBankAccount = async (accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'bankAccounts'), {
    ...accountData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateBankAccount = async (accountId: string, data: Partial<BankAccount>) => {
  const accountRef = doc(db, 'bankAccounts', accountId);
  await updateDoc(accountRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteBankAccount = async (accountId: string) => {
  await deleteDoc(doc(db, 'bankAccounts', accountId));
};

export const getGuideBankAccounts = async (guideId: string): Promise<BankAccount[]> => {
  const q = query(
    collection(db, 'bankAccounts'),
    where('guideId', '==', guideId),
    orderBy('isPrimary', 'desc'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as BankAccount[];
};

export const getPrimaryBankAccount = async (guideId: string): Promise<BankAccount | null> => {
  const q = query(
    collection(db, 'bankAccounts'),
    where('guideId', '==', guideId),
    where('isPrimary', '==', true),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  return {
    id: querySnapshot.docs[0].id,
    ...querySnapshot.docs[0].data()
  } as BankAccount;
};

export const setPrimaryBankAccount = async (accountId: string, guideId: string) => {
  // Primeiro, remover o status de primary de todas as contas
  const batch = writeBatch(db);
  
  const accounts = await getGuideBankAccounts(guideId);
  accounts.forEach(account => {
    const accountRef = doc(db, 'bankAccounts', account.id);
    batch.update(accountRef, { isPrimary: false });
  });
  
  // Depois, definir a nova conta como primary
  const newPrimaryRef = doc(db, 'bankAccounts', accountId);
  batch.update(newPrimaryRef, { isPrimary: true });
  
  await batch.commit();
};

export const getBankAccountById = async (accountId: string): Promise<BankAccount | null> => {
  const docRef = doc(db, 'bankAccounts', accountId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as BankAccount;
  }

  return null;
};

// Listener em tempo real para contas bancárias
export const subscribeToGuideBankAccounts = (
  guideId: string,
  callback: (accounts: BankAccount[]) => void
) => {
  const q = query(
    collection(db, 'bankAccounts'),
    where('guideId', '==', guideId),
    orderBy('isPrimary', 'desc'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const accounts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BankAccount[];
    callback(accounts);
  });
};

// Guide Functions
export const createGuideProfile = async (guideData: Omit<Guide, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'guides'), {
    ...guideData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateGuideProfile = async (guideId: string, data: Partial<Guide>) => {
  const guideRef = doc(db, 'guides', guideId);
  await updateDoc(guideRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const getGuideProfile = async (uid: string): Promise<Guide | null> => {
  const q = query(collection(db, 'guides'), where('uid', '==', uid));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const guideDoc = querySnapshot.docs[0];
  return {
    id: guideDoc.id,
    ...guideDoc.data()
  } as Guide;
};

export const getTourPackage = async (packageId: string): Promise<TourPackage | null> => {
  try {
    const packageRef = doc(db, 'tourPackages', packageId);
    const packageSnap = await getDoc(packageRef);
    
    if (!packageSnap.exists()) {
      return null;
    }
    
    return {
      id: packageSnap.id,
      ...packageSnap.data()
    } as TourPackage;
  } catch (error) {
    console.error("Error getting tour package:", error);
    return null;
  }
};


export const getAllGuides = async (): Promise<Guide[]> => {
  const q = query(
    collection(db, 'guides'), 
    where('isActive', '==', true),
    orderBy('rating', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Guide[];
};

// Tour Package Functions
export const createTourPackage = async (packageData: Omit<TourPackage, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'tourPackages'), {
    ...packageData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateTourPackage = async (packageId: string, data: Partial<TourPackage>) => {
  const packageRef = doc(db, 'tourPackages', packageId);
  await updateDoc(packageRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteTourPackage = async (packageId: string) => {
  await deleteDoc(doc(db, 'tourPackages', packageId));
};

export const getGuidePackages = async (guideId: string): Promise<TourPackage[]> => {
  const q = query(
    collection(db, 'tourPackages'), 
    where('guideId', '==', guideId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TourPackage[];
};

export const getAllTourPackages = async (): Promise<TourPackage[]> => {
  const q = query(
    collection(db, 'tourPackages'), 
    where('isActive', '==', true),
    orderBy('rating', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TourPackage[];
};

// Booking Functions
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export const getGuideBookings = async (guideId: string): Promise<Booking[]> => {
  const q = query(
    collection(db, 'bookings'), 
    where('guideId', '==', guideId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Booking[];
};

export const getGuideBookingById = async (bookingId: string): Promise<Booking | null> => {
  const docRef = doc(db, 'bookings', bookingId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Booking;
  }

  return null;
};

export const getTouristBookings = async (touristId: string): Promise<Booking[]> => {
  const q = query(
    collection(db, 'bookings'), 
    where('touristId', '==', touristId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Booking[];
};

// Review Functions
export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: serverTimestamp()
  });
  
  // Update guide rating
  await updateGuideRating(reviewData.guideId);
  
  return docRef.id;
};

export const getBookingOneReview = async (bookingId: string, touristId: string): Promise<Review | null> => {
  const reviewsQuery = query(
    collection(db, 'reviews'), 
    where('bookingId', '==', bookingId),
    where('touristId', '==', touristId)
  );

  const querySnapshot = await getDocs(reviewsQuery);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]; 
    return {
      id: doc.id,
      ...doc.data()
    } as Review;
  }

  return null;
};

export const updateBookingReview = async (
  bookingId: string,
  touristId: string,
  dataToUpdate: Partial<Review>
): Promise<boolean> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('bookingId', '==', bookingId),
      where('touristId', '==', touristId)
    );

    const querySnapshot = await getDocs(reviewsQuery);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, dataToUpdate);
      return true;
    }

    return false; // Review não encontrado
  } catch (error) {
    console.error("Erro ao atualizar o review:", error);
    return false;
  }
};

export const getGuideReviews = async (guideId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'), 
    where('guideId', '==', guideId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Review[];
};

export const getTuristReviews = async (touristId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'), 
    where('touristId', '==', touristId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Review[];
};

// Helper function to update guide rating
const updateGuideRating = async (guideId: string) => {
  const reviews = await getGuideReviews(guideId);
  
  if (reviews.length === 0) return;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  const guideRef = doc(db, 'guides', guideId);
  await updateDoc(guideRef, {
    rating: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length,
    updatedAt: serverTimestamp()
  });
};

// Real-time listeners
export const subscribeToGuideBookings = (guideId: string, callback: (bookings: Booking[]) => void) => {
  const q = query(
    collection(db, 'bookings'), 
    where('guideId', '==', guideId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    
    callback(bookings);
  });
};

// Get guide count and average rating by city
export const getGuidesCountByCity = async (cityName: string): Promise<{ count: number; avgRating: number }> => {
  try {
    const q = query(
      collection(db, 'guides'),
      where('city', '==', cityName),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const guides = querySnapshot.docs.map(doc => doc.data() as Guide);
    const count = guides.length;
    
    if (count === 0) {
      return { count: 0, avgRating: 0 };
    }
    
    const totalRating = guides.reduce((sum, guide) => sum + (guide.rating || 0), 0);
    const avgRating = count > 0 ? totalRating / count : 0;
    
    return { count, avgRating: Math.round(avgRating * 10) / 10 };
  } catch (error) {
    console.error('Error getting guides count by city:', error);
    return { count: 0, avgRating: 0 };
  }
};

// Get all cities with guide counts
export const getAllCitiesWithGuideCounts = async (): Promise<Map<string, { count: number; avgRating: number }>> => {
  try {
    const q = query(
      collection(db, 'guides'),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const cityStats = new Map<string, { guides: Guide[] }>();
    
    querySnapshot.docs.forEach(doc => {
      const guide = doc.data() as Guide;
      const city = guide.city;
      
      if (!cityStats.has(city)) {
        cityStats.set(city, { guides: [] });
      }
      cityStats.get(city)!.guides.push(guide);
    });
    
    const result = new Map<string, { count: number; avgRating: number }>();
    
    cityStats.forEach((data, city) => {
      const count = data.guides.length;
      const totalRating = data.guides.reduce((sum, g) => sum + (g.rating || 0), 0);
      const avgRating = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 0;
      result.set(city, { count, avgRating });
    });
    
    return result;
  } catch (error) {
    console.error('Error getting all cities with guide counts:', error);
    return new Map();
  }
};

export async function getGuidesByCity(): Promise<CityGuidesSummary[]> {
  // Primeiro, obtenha todos os guias do Firestore
  const guidesSnapshot = await getDocs(collection(db, 'guides'));
  const allGuides: Guide[] = guidesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Guide));

  const citiesBaseData = [
    { 
      name: "Luanda", 
      coordinates: { lat: -8.8383, lng: 13.2343 }, 
      description: "Capital de Angola com Fortaleza de São Miguel e rica história colonial",
      category: "capital"
    },
    { 
      name: "Benguela", 
      coordinates: { lat: -12.5763, lng: 13.4055 }, 
      description: "Porto histórico com praias paradisíacas e arquitetura colonial",
      category: "costa"
    },
    { 
      name: "Huambo", 
      coordinates: { lat: -12.7756, lng: 15.7394 }, 
      description: "Planalto central com clima ameno e paisagens montanhosas",
      category: "interior"
    },
    { 
      name: "Lubango", 
      coordinates: { lat: -14.9177, lng: 13.4925 }, 
      description: "Serra da Leba com curvas espetaculares e Cristo Rei",
      category: "montanha"
    },
    { 
      name: "Namibe", 
      coordinates: { lat: -15.1961, lng: 12.1522 }, 
      description: "Deserto do Namibe com paisagens únicas",
      category: "deserto"
    },
    { 
      name: "Soyo", 
      coordinates: { lat: -6.1349, lng: 12.3689 }, 
      description: "Foz do Rio Congo encontra o Oceano Atlântico",
      category: "costa"
    },
    { 
      name: "Cabinda", 
      coordinates: { lat: -5.5500, lng: 12.2000 }, 
      description: "Enclave rico em petróleo com florestas tropicais",
      category: "enclave"
    },
    { 
      name: "Malanje", 
      coordinates: { lat: -9.5402, lng: 16.3410 }, 
      description: "Portal para as Quedas de Kalandula e Pedras Negras",
      category: "interior"
    }
  ];

  // Agrupar guias por cidade
  const guidesByCity: Record<string, Guide[]> = {};
  allGuides.forEach(guide => {
    if (!guidesByCity[guide.city]) {
      guidesByCity[guide.city] = [];
    }
    guidesByCity[guide.city].push(guide);
  });

  // Criar o resultado final combinando os dados base com os guias
  const result: CityGuidesSummary[] = citiesBaseData.map(city => {
    const cityGuides = guidesByCity[city.name] || [];
    return {
      ...city,
      guides: cityGuides.length,
      guideList: cityGuides // Opcional: inclui a lista completa de guias
    };
  });

  // Ordenar por número de guias (do maior para o menor)
  result.sort((a, b) => b.guides - a.guides);

  return result;
}

// Favorite Functions
export const addFavorite = async (userId: string, guide: Guide): Promise<string> => {
  const docRef = await addDoc(collection(db, 'favorites'), {
    userId,
    guideId: guide.id,
    guideName: guide.name,
    guidePhotoURL: guide.photoURL,
    guideCity: guide.city,
    guideRating: guide.rating,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const removeFavorite = async (favoriteId: string): Promise<void> => {
  await deleteDoc(doc(db, 'favorites', favoriteId));
};

export const getUserFavorites = async (userId: string): Promise<Favorite[]> => {

  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Favorite[];
};

export const isGuideFavorited = async (userId: string, guideId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    where('guideId', '==', guideId)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const toggleFavorite = async (userId: string, guide: Guide): Promise<boolean> => {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    where('guideId', '==', guide.id)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Adicionar aos favoritos
    await addFavorite(userId, guide);
    return true;
  } else {
    // Remover dos favoritos
    const favoriteId = querySnapshot.docs[0].id;
    await removeFavorite(favoriteId);
    return false;
  }
};

export const subscribeToUserFavorites = (
  userId: string, 
  callback: (favorites: Favorite[]) => void
) => {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const favorites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Favorite[];
    callback(favorites);
  });
};





// Funções de Conversa
export const createConversation = async (
  userId: string,
  userName: string,
  userPhotoURL: string | undefined,
  guideId: string,
  guideName: string,
  guidePhotoURL: string | undefined
): Promise<string> => {
  const conversationRef = await addDoc(collection(db, 'conversations'), {
    participantIds: [userId, guideId],
    participantNames: [userName, guideName],
    lastMessage: '',
    lastMessageTimestamp: serverTimestamp(),
    unreadCount: 0,
    guidePhotoURL,
    userPhotoURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return conversationRef.id;
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  senderPhotoURL: string | undefined,
  receiverId: string,
  content: string
): Promise<string> => {
  // Adiciona a mensagem
  const messageRef = await addDoc(collection(db, 'messages'), {
    conversationId,
    senderId,
    senderName,
    senderPhotoURL,
    receiverId,
    content,
    timestamp: serverTimestamp(),
    isRead: false
  });
  
  // Atualiza a conversa com a última mensagem
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: content,
    lastMessageTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Incrementa o contador de mensagens não lidas para o receptor
  const conversationSnap = await getDoc(conversationRef);
  if (conversationSnap.exists()) {
    const conversation = conversationSnap.data() as Conversation;
    const receiverIndex = conversation.participantIds.indexOf(receiverId);
    
    if (receiverIndex !== -1) {
      await updateDoc(conversationRef, {
        unreadCount: conversation.unreadCount + 1
      });
    }
  }
  
  return messageRef.id;
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    where('receiverId', '==', userId),
    where('isRead', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  querySnapshot.forEach((doc) => {
    batch.update(doc.ref, { isRead: true });
  });
  
  await batch.commit();
  
  // Reseta o contador de mensagens não lidas
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    unreadCount: 0
  });
};

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Conversation[];
};

export const getMessagesForConversation = async (conversationId: string): Promise<Message[]> => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Message[];
};

// Listeners em tempo real
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[];
    callback(conversations);
  });
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};


export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      return null;
    }
    
    return {
      id: conversationSnap.id,
      ...conversationSnap.data()
    } as Conversation;
  } catch (error) {
    console.error("Erro ao buscar conversa:", error);
    return null;
  }
};

export const getTouristReviews = async (touristId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('touristId', '==', touristId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Review[];
};

// Listener em tempo real para reservas do turista
export const subscribeToTouristBookings = (
  touristId: string,
  callback: (bookings: Booking[]) => void
) => {
  const q = query(
    collection(db, 'bookings'),
    where('touristId', '==', touristId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    callback(bookings);
  });
};

// Notification Functions
export const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notificationData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const q = query(
    collection(db, 'notifications'),
    where('isRead', '==', false),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Notification[];
};

export const getAllNotifications = async (): Promise<Notification[]> => {
  const q = query(
    collection(db, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    isRead: true
  });
};

export const markAllNotificationsAsRead = async () => {
  const q = query(
    collection(db, 'notifications'),
    where('isRead', '==', false)
  );
  const querySnapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isRead: true });
  });
  
  await batch.commit();
};

export const deleteNotification = async (notificationId: string) => {
  await deleteDoc(doc(db, 'notifications', notificationId));
};

// Listener em tempo real para notificações
export const subscribeToNotifications = (
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    callback(notifications);
  });
};

// Funções auxiliares para criar notificações automáticas
export const notifyNewUser = async (userName: string, userType: 'tourist' | 'guide', userId: string) => {
  await createNotification({
    type: 'new_user',
    title: `Novo ${userType === 'guide' ? 'Guia' : 'Turista'} Cadastrado`,
    message: `${userName} acabou de se cadastrar como ${userType === 'guide' ? 'guia turístico' : 'turista'}.`,
    link: userType === 'guide' ? `/guia/perfil?id=${userId}` : undefined,
    isRead: false,
    priority: 'medium',
    metadata: {
      userId,
      userName
    }
  });
};

export const notifyNewBooking = async (bookingId: string, touristName: string, guideName: string, packageName?: string) => {
  await createNotification({
    type: 'new_booking',
    title: 'Nova Reserva Criada',
    message: `${touristName} fez uma reserva com ${guideName}${packageName ? ` para o pacote "${packageName}"` : ''}.`,
    link: `/admin/reservas`,
    isRead: false,
    priority: 'medium',
    metadata: {
      bookingId,
      userName: touristName
    }
  });
};

export const notifyBookingCancelled = async (bookingId: string, touristName: string, guideName: string) => {
  await createNotification({
    type: 'booking_cancelled',
    title: 'Reserva Cancelada',
    message: `A reserva de ${touristName} com ${guideName} foi cancelada.`,
    link: `/admin/reservas`,
    isRead: false,
    priority: 'high',
    metadata: {
      bookingId,
      userName: touristName
    }
  });
};

export const notifyLowRating = async (guideId: string, guideName: string, rating: number, touristName: string) => {
  await createNotification({
    type: 'low_rating',
    title: 'Avaliação Baixa Recebida',
    message: `${guideName} recebeu uma avaliação de ${rating} estrelas de ${touristName}. Isso pode requerer atenção.`,
    link: `/guia/perfil?id=${guideId}`,
    isRead: false,
    priority: 'high',
    metadata: {
      guideId,
      userName: guideName,
      rating
    }
  });
};

export const notifyNewPackage = async (packageId: string, guideName: string, packageTitle: string) => {
  await createNotification({
    type: 'new_package',
    title: 'Novo Pacote Criado',
    message: `${guideName} criou um novo pacote turístico: "${packageTitle}".`,
    link: `/admin/pacotes`,
    isRead: false,
    priority: 'low',
    metadata: {
      packageId,
      userName: guideName
    }
  });
};

