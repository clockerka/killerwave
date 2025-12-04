import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
});

// Token cache to avoid multiple token requests
let tokenCache: string | null = null;
let tokenExpiry: number = 0;
let authInstance: any = null;


// Initialize auth instance
export const initializeAuthInstance = (auth: any) => {
	authInstance = auth;
};

// Clear auth cache (call when user signs out)
export const clearAuthCache = () => {
	tokenCache = null;
	tokenExpiry = 0;
	authInstance = null;
};

// Function to get fresh token with caching
const getFreshToken = async (): Promise<string | null> => {
	try {
		if (!authInstance) {
			console.warn('Auth instance not initialized');
			return null;
		}

		const now = Date.now();

		// Return cached token if it's still valid (with 5 minute buffer)
		if (tokenCache && tokenExpiry > now + 5 * 60 * 1000) {
			return tokenCache;
		}

		// Get new token
		const token = await authInstance.getToken();

		if (token) {
			tokenCache = token;
			// Set expiry to 50 minutes from now (tokens usually last 60 minutes)
			tokenExpiry = now + 50 * 60 * 1000;
		}

		return token;
	} catch (error) {
		console.error('Error getting token:', error);
		// Clear cache on error
		tokenCache = null;
		tokenExpiry = 0;
		return null;
	}
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
	async (config) => {
		try {
			const token = await getFreshToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			} else {
				console.warn('No auth token available for request');
			}
		} catch (error) {
			console.error('Error adding auth token to request:', error);
		}
		return config;
	},
	(error) => {
		console.error('Request interceptor error:', error);
		return Promise.reject(error);
	}
);

// Response interceptor to handle token refresh on 401
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Log the error for debugging
		console.error('API request failed:', {
			url: originalRequest?.url,
			method: originalRequest?.method,
			status: error.response?.status,
			message: error.message
		});

		// If we get 401 and haven't already tried to refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			// Check if user is actually signed in before trying to refresh
			if (!authInstance || !authInstance.isSignedIn) {
				// User is not signed in, silently fail without showing error messages
				console.log('User not signed in, ignoring 401 error');
				return Promise.reject(error);
			}

			originalRequest._retry = true;

			console.log('401 error detected, attempting token refresh...');

			try {
				// Clear cached token and get fresh one
				tokenCache = null;
				tokenExpiry = 0;
				const newToken = await getFreshToken();

				if (newToken) {
					console.log('Token refreshed successfully, retrying request...');
					// Retry the original request with new token
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return axiosInstance(originalRequest);
				} else {
					console.error('Failed to get new token during refresh');
				}
			} catch (refreshError) {
				console.error('Error during token refresh:', refreshError);
				// Clear cache on refresh error
				tokenCache = null;
				tokenExpiry = 0;
			}
		}

		// If it's a network error, add more context
		if (error.code === 'NETWORK_ERROR' || !error.response) {
			console.error('Network error detected:', error.message);
			error.message = 'network error - please check your connection';
		}

		return Promise.reject(error);
	}
);

