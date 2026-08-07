export interface IUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface IStaff {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
  isActive: boolean;
  avatarUrl?: string;
  cinemaId: string;
  role?: string;
  position: string;
}
