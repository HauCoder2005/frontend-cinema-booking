import CinemaList from "../component/movie/list";
import MovieList from "../component/movies/MovieList";

export const metadata = {
  title: "Phim - Cinema Booking",
  description: "Danh sách phim đang chiếu và sắp chiếu",
};

export default function MoviesPage() {
  return <CinemaList />;
}
