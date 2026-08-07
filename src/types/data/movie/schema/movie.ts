import * as yup from "yup";

export const createMovieSchema = () => {
  return yup.object().shape({
      title: yup.string().required("Title is required"),
      
  });
};