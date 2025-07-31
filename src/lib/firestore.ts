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
  onSnapshot
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
  guideId: string;
  guideName: string;
  packageId?: string;
  packageTitle?: string;
  date: string;
  time: string;
  duration: number;
  totalPrice: number;
  groupSize: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: any;
  updatedAt: any;
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

export const getAllGuides = async (): Promise<Guide[]> => {
  const q = query(
    collection(db, 'guides'), 
    where('isActive', '==', true),
    orderBy('rating', 'desc')
  );
  const querySnapshot = await getDocs(q);
  console.log("Guides fetched:", querySnapshot.docs.length);
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

// Listener em tempo real para favoritos
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