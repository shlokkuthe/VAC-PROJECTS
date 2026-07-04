import API from "./api";

export const signupUser = async (userData) => {
    const response = await API.post("/auth/signup", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await API.post("/auth/login", credentials);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await API.get("/auth/me");
    return response.data;
};

export const verifyEmailUser = async (token) => {
    const response = await API.post("/auth/verify-email", { token });
    return response.data;
};

export const forgotPasswordUser = async (email) => {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
};

export const resetPasswordUser = async (token, newPassword) => {
    const response = await API.post("/auth/reset-password", { token, newPassword });
    return response.data;
};

export const logoutUser = async () => {
    const response = await API.post("/auth/logout");
    return response.data;
};