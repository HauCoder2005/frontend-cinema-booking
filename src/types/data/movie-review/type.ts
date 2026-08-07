export interface IMovieReview {
    id: number;
    userId: number;
    movieId: number;
    rating: number; 
    comment: string;
    createdAt: Date; 
}

export interface IRatingSummary {
    movieId: number;
    avgRating: number;
    ratingCount: number;
}

export interface ICreateReview {
    userId: number;
    movieId: number;
    rating: number;
    comment: string;
}