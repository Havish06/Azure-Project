import { apiClient } from "./apiClient";
import { CurrentUser } from "@/types";

export const authService = {
  login: async (): Promise<CurrentUser> => {
    const { data } = await apiClient.post<CurrentUser>("/auth/login");
    return data;
  },

  me: async (): Promise<CurrentUser> => {
    const { data } = await apiClient.get<CurrentUser>("/auth/me");
    return data;
  },
};
