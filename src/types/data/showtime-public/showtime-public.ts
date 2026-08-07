import { Model } from "@/types/core/model";
import { IMovieShowtimeGroup } from "./type";
import { ObjectsFactory } from "@/types/core/objectFactory";

const modelConfig = {
  path: "showtimes/public",
  modal: "showtime",
};
console.log("ShowtimePublic modelConfig:", modelConfig);
export class ShowtimePublic extends Model {
  
  static queryKeys = {
    paginate: "SHOWTIME_PUBLIC_PAGINATE_QUERY",
  };

 
  static objects = ObjectsFactory.factory<IMovieShowtimeGroup>(
    modelConfig,
    this.queryKeys,
  );

  static getAllShowtimePublic() {
    return {
      queryKey: this.queryKeys.paginate,
      queryFn: () => {
        return this.api
          .get<{ data: IMovieShowtimeGroup[] }>({
            url: `/showtime/public`,
          })
          .then((r) => r);
      },
    };
  }
}
ShowtimePublic.setup();
