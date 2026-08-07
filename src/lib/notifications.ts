import { toast, ExternalToast } from "sonner";

export const notify = {
  success: (message: string, options?: ExternalToast) => toast.success(message, options),
  error: (message: string, options?: ExternalToast) => toast.error(message, options),
  warning: (message: string, options?: ExternalToast) => toast.warning(message, options),
  info: (message: string, options?: ExternalToast) => toast.info(message, options),
  loading: (message: string, options?: ExternalToast) => toast.loading(message, options),
  dismiss: (id?: string | number) => toast.dismiss(id),
};

export default notify;
