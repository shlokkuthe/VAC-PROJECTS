import API from "./api";

export const sendMessage = async (message, history = []) => {
    const response = await API.post("/chatbot/ask", { message, history });
    return response.data;
};
