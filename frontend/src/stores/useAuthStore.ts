import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
interface AuthStore {
	isAdmin: boolean;
	isSuperAdmin: boolean;
	isSupportAgent: boolean;
	isLoading: boolean;
	error: string | null;
	dbUser: any | null;
	checkAdminStatus: () => Promise<void>;
	fetchUser: () => Promise<void>;
	reset: () => void;
}
export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isSuperAdmin: false,
	isSupportAgent: false,
	isLoading: false,
	error: null,
	dbUser: null,
	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/check");
			set({
				isAdmin: response.data.admin,
				isSuperAdmin: response.data.superAdmin || false
			});
		} catch (error: any) {
			set({ isAdmin: false, isSuperAdmin: false, error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
	fetchUser: async () => {
		try {
			const response = await axiosInstance.get("/users/me");
			set({
				dbUser: response.data,
				isSupportAgent: response.data?.isSupportAgent || false
			});
		} catch (error: any) {
			console.error("Error fetching user:", error);
			set({ dbUser: null, isSupportAgent: false });
		}
	},
	reset: () => {
		set({ isAdmin: false, isSuperAdmin: false, isSupportAgent: false, isLoading: false, error: null, dbUser: null });
	},
}));