import * as yup from "yup";
export const createBannerSchema = () => {
    return yup.object().shape({
        title: yup.string().required("Title is required"),
    });
}