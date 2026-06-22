// utils/toast.ts
import { toast } from "sonner";

export const success = (title: string, msg: string) => toast.success(msg);
export const error = (title: string, msg: string) => toast.error(msg);
export const warn = (title: string, msg: string) => toast.warning(msg);
