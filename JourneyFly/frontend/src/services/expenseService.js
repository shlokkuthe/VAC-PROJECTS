import API from "./api";

export const addExpense = async (expenseData) => {
    const response = await API.post("/expenses", expenseData);
    return response.data;
};

export const getExpensesByTrip = async (tripId) => {
    const response = await API.get(`/expenses/trip/${tripId}`);
    return response.data;
};

export const updateExpense = async (id, expenseData) => {
    const response = await API.put(`/expenses/${id}`, expenseData);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await API.delete(`/expenses/${id}`);
    return response.data;
};
