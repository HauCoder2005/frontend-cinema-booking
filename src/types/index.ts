// Common types for the cinema booking application

export * from './core/api';
export * from './role';
import { Role } from './role';

export interface Movie {
  id: number | string;
  title: string;
  description?: string;
  fullDescription?: string;
  poster: string;
  trailer?: string;
  rating: number;
  duration: number;
  format?: string;
  isShowing?: boolean;
  comingSoon?: boolean;
  genre: string[];
  director?: string;
  cast?: string[];
  releaseDate: string;
  language?: string;
  ageRating?: string;
  reviews?: Review[];
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Showtime {
  id: number | string;
  time: string;
  date: string;
  cinema: string;
  room: string;
  format: string;
  price: number;
  availableSeats: number;
}

export interface Seat {
  id: string;
  row: string;
  col: number;
  price: number;
  status: 'available' | 'occupied' | 'selected';
  type?: 'standard' | 'vip' | 'couple';
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  items: string[];
  available: boolean;
  quantity?: number;
}

export interface BookingData {
  movieId: string | string[] | undefined;
  showtime: Showtime | null;
  seats: Seat[];
  combos: Combo[];
}

export interface Ticket {
  id: string;
  movie: string;
  date: string;
  time: string;
  cinema: string;
  room: string;
  seats: string[];
  format: string;
  price: number;
  status: 'completed' | 'upcoming' | 'cancelled';
  qrCode: string;
  bookingDate: string;
}

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  role: Role; // 'client' | 'staff' | 'admin'
  status: 'active' | 'banned' | 'pending';
  joinDate: string;
}

export interface PaymentData {
  bookingId: string;
  amount: number;
  method: string;
  status: string;
}
