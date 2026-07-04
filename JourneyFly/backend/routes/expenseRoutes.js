const express = require("express");
const router = express.Router();
const {
    addExpense,
    getExpensesByTrip,
    updateExpense,
    deleteExpense,
} = require("../controllers/expenseController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, addExpense);
router.get("/trip/:tripId", protect, getExpensesByTrip);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);

module.exports = router;
