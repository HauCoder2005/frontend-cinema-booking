// NOTE: this is file setup types on typescript 
// setup enum movie status
export type MovieStatus = 'COMING_SOON' | 'NOW_SHOWING' | 'ENDED';

// setup types movie dto 
export interface IMoviePublic {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  genre: string;
  language: string;
  format: string;
  director: string;
  cast: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  agerating: string;
  releaseDate: string; 
  endDate: string;     
  status: MovieStatus;
  createdAt: string; 
}

export interface IMovieStatus {
  id: number;
  title: string;
  durationMinutes: number;
  genre: string;
  posterUrl: string;
  agerating: string;
  status: MovieStatus;
}

export interface ICinemaMovie {
  id: number;
  name: string;
}

export interface IShowtimeItem {
  id: number;
  startTime: string;
  type: string;
}

export interface ICinemaMovieShowtimeItem {
  address: string;
  cinemaId: number;
  cinemaName: string;
  cinemaImageUrl?: string | null;
  durationMinutes: number; 
  posterUrl: string | null;
  agerating?: string | null;
  showtime: IShowtimeItem[];
}

export type IMovieShowtimeGroup = Omit<ICinemaMovieShowtimeItem, "showtime"> & {
  showtimes?: IShowtimeItem[];
  showtime?: IShowtimeItem[];
};

export interface IMoviePublicGenre {
  id: number;
  title: string;
  posterUrl: string;
  durationMinutes: number;
  genre: string;
  agerating: string;
  status: MovieStatus;
}