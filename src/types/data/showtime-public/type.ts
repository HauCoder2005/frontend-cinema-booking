export interface IShowtimePublic {
  id: number;         
  startTime: string; 
  price: number;      
  roomName: string;
}

export interface IMovieShowtimeGroup {
  movieId: number;      
  movieTitle: string;
  coverUrl: string | null;  
  showtimes: IShowtimePublic[];
}
