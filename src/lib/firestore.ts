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
  photoURL?: string;
  createdAt: any;
  updatedAt: any;
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