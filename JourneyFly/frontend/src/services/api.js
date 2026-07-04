import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5050/api",
    withCredentials: true, // required to send refresh token cookie
});

// Request Interceptor: Attach Access Token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Refresh Token on 401
API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call the refresh endpoint to obtain a new token
                const res = await axios.post(
                    "http://localhost:5050/api/auth/refresh",
                    {},
                    { withCredentials: true }
                );

                if (res.status === 200 && res.data.accessToken) {
                    const newAccessToken = res.data.accessToken;
                    localStorage.setItem("token", newAccessToken);

                    // Re-run original request with new access token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return API(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token is expired or invalid; log user out
                localStorage.removeItem("token");
                // Optional: redirect to login if we are in browser
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        // Return a customized error message if available
        const message =
            error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : error.message || "Something went wrong.";
        
        return Promise.reject(new Error(message));
    }
);

export default API;