import API from "./api";

export const getItinerary = async (tripId) => {
    const response = await API.get(`/itinerary/trip/${tripId}`);
    return response.data;
};

export const addItineraryItem = async (data) => {
    const response = await API.post("/itinerary", data);
    return response.data;
};

export const updateItineraryItem = async (id, data) => {
    const response = await API.put(`/itinerary/${id}`, data);
    return response.data;
};

export const deleteItineraryItem = async (id) => {
    const response = await API.delete(`/itinerary/${id}`);
    return response.data;
};
