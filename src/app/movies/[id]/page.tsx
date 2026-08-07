import MovieDetail from "../../component/movies/MovieDetail";
import { Metadata } from "next";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Chi tiết phim #${id} - Cinema Booking`,
    description: "Thông tin chi tiết về phim",
  };
}

export default async function MovieDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <MovieDetail movieId={id} />;
}
