import { Model } from "@/types/core/model";
import { ICreateReview, IMovieReview, IRatingSummary } from "./type";
import { IPaginateResponse, IResponse } from "@/types/core/api";
import { ObjectsFactory } from "@/types/core/objectFactory";

const modelConfig = {
  path: "client/reviews",
  modal: "reviews",
};

export class MovieReview extends Model {
  static queryKeys = {
    paginate: "MOVIE_REVIEW_PAGINATE_QUERY",
    all: "MOVIE_COMMENT_ALL_QUERY",
    count_rating: "MOVIE_REVIEW_COUNT_RATING_QUERY",
    create_comment: "MOVIE_REVIEW_CREATE_COMMENT_QUERY",
  };

  static objects = ObjectsFactory.factory<IMovieReview>(modelConfig, this.queryKeys);

  // ✅ support pagination
  static getAllReviewByMovieId(movieId: number, page: number = 1, perPage: number = 20) {
    return {
      queryKey: [this.queryKeys.all, movieId, page, perPage],
      queryFn: () =>
        this.api
          .get<IPaginateResponse<IMovieReview[]>>({
            url: `/client/reviews/${movieId}/comment`,
            params: { page, perPage },
          })
          .then((r) => r.data),
    };
  }

  static getCountRatingByMovieId(movieId: number) {
    return {
      queryKey: [this.queryKeys.count_rating, movieId],
      queryFn: () =>
        this.api
          .get<IResponse<IRatingSummary>>({
            url: `/client/reviews/${movieId}/rating`,
          })
          .then((r) => r.data),
    };
  }

  static createComment(userId: number, movieId: number, rating: number, comment: string) {
    return {
      queryKey: [this.queryKeys.create_comment, userId, movieId, rating, comment],
      queryFn: () =>
        this.api
          .post<IResponse<ICreateReview>>({
            url: `/client/reviews/create-comment`,
            params: { userId, movieId, rating, comment },
          })
          .then((r) => r.data),
    };
  }
}

MovieReview.setup();  