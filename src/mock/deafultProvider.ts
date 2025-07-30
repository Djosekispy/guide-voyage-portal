import { Guide } from "@/lib/firestore";

export const DEFAULT_GUIDE_DATA: Omit<Guide, 'id' | 'uid' | 'name' | 'city' |'email' | 'phone' | 'createdAt' | 'updatedAt'> = {
  description: 'Novo guia na plataforma',
  experience: 0,
  pricePerHour: 0,
  languages: ['Português'],
  specialties: [],
  rating: 0,
  reviewCount: 0,
  isActive: true,
  isProfileComplete: false, 
  photoURL: '/default-guide-avatar.jpg'
};