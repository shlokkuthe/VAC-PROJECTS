const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Trip Counts
        const totalTrips = await Trip.countDocuments({ user: userId });
        const upcomingTrips = await Trip.countDocuments({ user: userId, status: "Upcoming" });
        const ongoingTrips = await Trip.countDocuments({ user: userId, status: "Ongoing" });
        const completedTrips = await Trip.countDocuments({ user: userId, status: "Completed" });
        const cancelledTrips = await Trip.countDocuments({ user: userId, status: "Cancelled" });

        // 2. Expenses aggregation
        const userExpenses = await Expense.find({ user: userId });
        const totalExpenses = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // 3. Most Visited Country
        const trips = await Trip.find({ user: userId });
        const countryCounts = {};
        trips.forEach((t) => {
            if (t.country) countryCounts[t.country] = (countryCounts[t.country] || 0) + 1;
        });
        let mostVisitedCountry = "None";
        let maxCount = 0;
        for (const [country, count] of Object.entries(countryCounts)) {
            if (count > maxCount) { maxCount = count; mostVisitedCountry = country; }
        }

        // 4. Current Trip (Ongoing, or nearest Upcoming)
        let currentTrip = await Trip.findOne({ user: userId, status: "Ongoing" }).sort({ startDate: 1 });
        if (!currentTrip) {
            currentTrip = await Trip.findOne({ user: userId, status: "Upcoming" }).sort({ startDate: 1 });
        }

        // 5. Recent Activity
        const recentTrips = await Trip.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
        const recentExpenses = await Expense.find({ user: userId }).populate("trip", "destination tripName").sort({ createdAt: -1 }).limit(3);
        const recentNotifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(4);

        const activities = [];
        recentTrips.forEach((t) => {
            activities.push({
                id: `trip-${t._id}`,
                type: "trip",
                title: "Planned a new trip",
                description: `${t.tripName || t.destination} → ${t.city || t.destination}, ${t.country}`,
                date: t.createdAt,
            });
        });
        recentExpenses.forEach((e) => {
            activities.push({
                id: `exp-${e._id}`,
                type: "expense",
                title: `Added ${e.category} expense`,
                description: `$${e.amount} on trip to ${e.trip ? (e.trip.tripName || e.trip.destination) : "Unknown"}`,
                date: e.createdAt,
            });
        });
        recentNotifications.forEach((n) => {
            activities.push({ id: `notif-${n._id}`, type: "notification", title: n.title, description: n.message, date: n.createdAt });
        });
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivity = activities.slice(0, 6);

        // 6. Expenses by category (all categories)
        const categoryData = {
            Hotel: 0, Food: 0, Flight: 0, Train: 0, Bus: 0,
            Taxi: 0, Fuel: 0, Shopping: 0, Activities: 0, Medical: 0, Other: 0,
        };
        userExpenses.forEach((exp) => {
            if (categoryData[exp.category] !== undefined) categoryData[exp.category] += exp.amount;
        });

        // 7. Trip status breakdown
        const statusData = {
            Draft: await Trip.countDocuments({ user: userId, status: "Draft" }),
            Upcoming: upcomingTrips,
            Ongoing: ongoingTrips,
            Completed: completedTrips,
            Cancelled: cancelledTrips,
        };

        // 8. Monthly Stats (current year)
        const monthlyStats = Array(12).fill(0);
        const currentYear = new Date().getFullYear();
        trips.forEach((t) => {
            const start = new Date(t.startDate);
            if (start.getFullYear() === currentYear) monthlyStats[start.getMonth()] += 1;
        });

        // 9. Recent Notifications
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalTrips,
                upcomingTrips,
                ongoingTrips,
                completedTrips,
                cancelledTrips,
                totalExpenses,
                mostVisitedCountry,
                recentActivity,
                currentTrip,
            },
            charts: {
                expensesByCategory: categoryData,
                tripsByStatus: statusData,
                monthlyTrips: monthlyStats,
            },
            notifications,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDashboardStats };
