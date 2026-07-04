const Expense = require("../models/Expense");
const Trip = require("../models/Trip");
const Notification = require("../models/Notification");

// ==============================
// Add Expense to Trip
// ==============================
const addExpense = async (req, res) => {
    try {
        const { tripId, category, amount, description, date } = req.body;

        if (!tripId || !category || !amount) {
            return res.status(400).json({
                success: false,
                message: "Trip ID, category, and amount are required.",
            });
        }

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found.",
            });
        }

        if (String(trip.user) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to add expenses to this trip.",
            });
        }

        const expense = await Expense.create({
            trip: tripId,
            user: req.user.id,
            category,
            amount: Number(amount),
            description: description || "",
            date: date || Date.now(),
        });

        // Recalculate total expenses
        const expenses = await Expense.find({ trip: tripId });
        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const percentage = trip.budget > 0 ? (totalExpense / trip.budget) * 100 : 0;

        // Budget warning notifications
        if (percentage >= 100) {
            const existing = await Notification.findOne({
                user: req.user.id,
                type: "budget",
                message: { $regex: `${trip.destination}.*exceeded` },
            });
            if (!existing) {
                await Notification.create({
                    user: req.user.id,
                    title: "🚨 Budget Exceeded!",
                    message: `Your expenses for ${trip.tripName || trip.destination} have exceeded your budget of $${trip.budget.toLocaleString()}!`,
                    type: "budget",
                });
            }
        } else if (percentage >= 80) {
            const existing = await Notification.findOne({
                user: req.user.id,
                type: "budget",
                message: { $regex: `${trip.destination}.*80%` },
            });
            if (!existing) {
                await Notification.create({
                    user: req.user.id,
                    title: "⚠️ 80% Budget Used",
                    message: `You've used 80% of your budget for ${trip.tripName || trip.destination}. Remaining: $${(trip.budget - totalExpense).toLocaleString()}`,
                    type: "budget",
                });
            }
        } else if (percentage >= 50) {
            const existing = await Notification.findOne({
                user: req.user.id,
                type: "budget",
                message: { $regex: `${trip.destination}.*50%` },
            });
            if (!existing) {
                await Notification.create({
                    user: req.user.id,
                    title: "📊 50% Budget Used",
                    message: `You've used half your budget for ${trip.tripName || trip.destination}. Remaining: $${(trip.budget - totalExpense).toLocaleString()}`,
                    type: "budget",
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Expense added successfully.",
            expense,
            summary: {
                totalBudget: trip.budget,
                totalExpense,
                remainingBudget: trip.budget - totalExpense,
                percentageUsed: Math.round(percentage),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Get Expenses for Trip
// ==============================
const getExpensesByTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        if (String(trip.user) !== req.user.id && !trip.isPublic) {
            return res.status(403).json({ success: false, message: "Unauthorized to view these expenses." });
        }

        const expenses = await Expense.find({ trip: tripId }).sort({ date: -1 });

        res.json({ success: true, expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Update Expense
// ==============================
const updateExpense = async (req, res) => {
    try {
        const { category, amount, description, date } = req.body;

        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found." });
        }

        if (String(expense.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        if (category) expense.category = category;
        if (amount !== undefined) expense.amount = Number(amount);
        if (description !== undefined) expense.description = description;
        if (date) expense.date = date;

        await expense.save();

        res.json({ success: true, message: "Expense updated successfully.", expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// Delete Expense
// ==============================
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found." });
        }

        if (String(expense.user) !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access." });
        }

        await Expense.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Expense deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addExpense,
    getExpensesByTrip,
    updateExpense,
    deleteExpense,
};
