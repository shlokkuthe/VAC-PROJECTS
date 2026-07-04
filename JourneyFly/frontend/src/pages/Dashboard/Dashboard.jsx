import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlane, FaDollarSign, FaCalendarAlt, FaGlobe } from "react-icons/fa";
import { HiOutlineLightBulb } from "react-icons/hi";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getDashboardData } from "../../services/dashboardService";
import styles from "./Dashboard.module.css";

// Register ChartJS modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getDashboardData();
                setData(res);
            } catch (error) {
                toast.error(error.message || "Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="global-loader-container">
                <div className="global-loader"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <h3>No statistics available. Please plan some trips first!</h3>
            </div>
        );
    }

    const { stats, charts } = data;

    const textColor = theme === "dark" ? "#F8FAFC" : "#0F172A";
    const borderColor = theme === "dark" ? "#334155" : "#E2E8F0";

    // 1. Doughnut: Expenses by Category
    const doughnutData = {
        labels: Object.keys(charts.expensesByCategory),
        datasets: [
            {
                data: Object.values(charts.expensesByCategory),
                backgroundColor: theme === "dark" ? [
                    "#f87171", // Food
                    "#60a5fa", // Hotel
                    "#fbbf24", // Fuel
                    "#f472b6", // Shopping
                    "#34d399", // Medical
                    "#a78bfa", // Other
                ] : [
                    "#ef4444", 
                    "#3b82f6", 
                    "#eab308", 
                    "#ec4899", 
                    "#10b981", 
                    "#8b5cf6", 
                ],
                borderWidth: 1,
                borderColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    color: textColor,
                    font: { family: "Poppins" },
                },
            },
        },
    };

    // 2. Bar: Trips by Status
    const barData = {
        labels: Object.keys(charts.tripsByStatus),
        datasets: [
            {
                label: "Trips",
                data: Object.values(charts.tripsByStatus),
                backgroundColor: theme === "dark" 
                    ? ["#60a5fa", "#34d399", "#f87171"] 
                    : ["#3b82f6", "#10b981", "#ef4444"],
                borderRadius: 8,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: textColor },
            },
            y: {
                grid: { color: borderColor },
                ticks: { color: textColor, stepSize: 1 },
            },
        },
    };

    // 3. Line: Monthly planned statistics
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const lineData = {
        labels: months,
        datasets: [
            {
                label: "Trips Planned",
                data: charts.monthlyTrips,
                borderColor: theme === "dark" ? "#60a5fa" : "#3b82f6",
                backgroundColor: theme === "dark" ? "rgba(96, 165, 250, 0.15)" : "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: textColor },
            },
            y: {
                grid: { color: borderColor },
                ticks: { color: textColor, stepSize: 1 },
            },
        },
    };

    return (
        <div className={styles.container}>
            {/* Welcome header */}
            <div className={styles.welcomeSection}>
                <h1>Hello, {user?.fullName || "Traveler"}! 👋</h1>
                <p>Welcome back to your travel summary dashboard.</p>
            </div>

            {/* Stats grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.iconTrips}`}>
                        <FaPlane />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Total Trips</h3>
                        <p>{stats.totalTrips}</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.iconExpenses}`}>
                        <FaDollarSign />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Total Expenses</h3>
                        <p>${stats.totalExpenses.toLocaleString()}</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.iconUpcoming}`}>
                        <FaCalendarAlt />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Upcoming Trips</h3>
                        <p>{stats.upcomingTrips}</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.iconCountry}`}>
                        <FaGlobe />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>Most Visited</h3>
                        <p>{stats.mostVisitedCountry}</p>
                    </div>
                </div>
            </div>

            {/* Charts section */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartCard} style={{ height: "380px" }}>
                    <h2>Monthly Trip Registrations</h2>
                    <div className={styles.chartContainer}>
                        <Line key={theme} data={lineData} options={lineOptions} />
                    </div>
                </div>

                <div className={styles.chartCard} style={{ height: "380px" }}>
                    <h2>Expenses by Category</h2>
                    <div className={styles.chartContainer}>
                        <Doughnut key={theme} data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Bottom section (activities and stats) */}
            <div className={styles.bottomSection}>
                <div className={styles.activityCard}>
                    <h2>Trip Status Breakdown</h2>
                    <div className={styles.chartContainer} style={{ height: "230px" }}>
                        <Bar key={theme} data={barData} options={barOptions} />
                    </div>
                </div>

                <div className={styles.activityCard}>
                    <h2>Recent Activity</h2>
                    <div className={styles.activityList}>
                        {stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((act) => (
                                <div className={styles.activityItem} key={act.id}>
                                    <div className={`${styles.activityIcon} ${styles[`iconType_${act.type}`]}`}>
                                        {act.type === "trip" && <FaPlane />}
                                        {act.type === "expense" && <FaDollarSign />}
                                        {act.type === "notification" && <HiOutlineLightBulb />}
                                    </div>
                                    <div className={styles.activityDetails}>
                                        <h4>{act.title}</h4>
                                        <p>{act.description}</p>
                                    </div>
                                    <div className={styles.activityTime}>
                                        {new Date(act.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: "var(--subText)", textAlign: "center", marginTop: "20px" }}>
                                No recent activity to show. Plan your next adventure!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;