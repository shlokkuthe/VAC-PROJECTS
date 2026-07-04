import API from "./api";

export const updateProfile = async (profileData) => {
    const response = await API.put("/profile", profileData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await API.put("/profile/password", passwordData);
    return response.data;
};

export const uploadAvatar = async (formData) => {
    const response = await API.post("/profile/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const deleteAccount = async () => {
    const response = await API.delete("/profile");
    return response.data;
};
