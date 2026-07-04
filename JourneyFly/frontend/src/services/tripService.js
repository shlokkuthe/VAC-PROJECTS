import API from "./api";

export const createTrip = async (formData) => {
    const response = await API.post("/trips", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const getTrips = async (params = {}) => {
    const response = await API.get("/trips", { params });
    return response.data;
};

export const getTripById = async (id) => {
    const response = await API.get(`/trips/${id}`);
    return response.data;
};

export const updateTrip = async (id, formData) => {
    const response = await API.put(`/trips/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteTrip = async (id) => {
    const response = await API.delete(`/trips/${id}`);
    return response.data;
};

export const cancelTrip = async (id) => {
    const response = await API.patch(`/trips/${id}/cancel`);
    return response.data;
};

export const restoreTrip = async (id) => {
    const response = await API.patch(`/trips/${id}/restore`);
    return response.data;
};

export const duplicateTrip = async (id) => {
    const response = await API.post(`/trips/${id}/duplicate`);
    return response.data;
};

export const toggleWishlist = async (id) => {
    const response = await API.post(`/trips/${id}/wishlist`);
    return response.data;
};

export const getWishlistedTrips = async () => {
    const response = await API.get("/trips/wishlist");
    return response.data;
};

export const getWeatherData = async (city) => {
    const response = await API.get("/weather", { params: { city } });
    return response.data;
};

export const getReviews = async (tripId) => {
    const response = await API.get(`/reviews/${tripId}`);
    return response.data;
};

export const addReview = async (tripId, reviewData) => {
    const response = await API.post(`/reviews/${tripId}`, reviewData);
    return response.data;
};
