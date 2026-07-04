import { useEffect, useState } from "react";
import { FaUsers, FaPlane, FaDollarSign, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../services/api";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("stats");
    const [deletingId, setDeletingId] = useState(null);

    const fetchStats = async () => {
        try {
            const res = await API.get("/admin/stats");
            setStats(res.data);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await API.get("/admin/users");
            setUsers(res.data.users);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchStats();
            await fetchUsers();
            setLoading(false);
        };
        load();
    }, []);

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Permanently delete account for "${userName}" and all their data?`)) return;
        setDeletingId(userId);
        try {
            await API.delete(`/admin/users/${userId}`);
            toast.success(`User "${userName}" deleted.`);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="global-loader-container">
                <div className="global-loader"></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Monitor platform-wide activity and manage user accounts.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "stats" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("stats")}
                >
                    Overview & Stats
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    Manage Users ({users.length})
                </button>
            </div>

            {/* Stats Tab */}
            {activeTab === "stats" && stats && (
                <>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={`${styles.iconWrap} ${styles.iconBlue}`}>
                                <FaUsers />
                            </div>
                            <div>
                                <h3>Total Users</h3>
                                <p>{stats.stats.totalUsers}</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.iconWrap} ${styles.iconGreen}`}>
                                <FaPlane />
                            </div>
                            <div>
                                <h3>Total Trips</h3>
                                <p>{stats.stats.totalTrips}</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.iconWrap} ${styles.iconOrange}`}>
                                <FaDollarSign />
                            </div>
                            <div>
                                <h3>Total Expenses</h3>
                                <p>${stats.stats.totalExpenses.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2>Recent System Activity</h2>
                        <div className={styles.activityList}>
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((act, idx) => (
                                    <div className={styles.activityRow} key={idx}>
                                        <span className={`${styles.activityDot} ${act.type === "user" ? styles.dotBlue : styles.dotGreen}`}></span>
                                        <div className={styles.activityInfo}>
                                            <p>{act.message}</p>
                                            <span>{new Date(act.date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.emptyText}>No recent activity.</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className={styles.card}>
                    <h2>Registered Users</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Verified</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <img
                                                    src={u.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                                    alt={u.fullName}
                                                    className={styles.userAvatar}
                                                />
                                                <div>
                                                    <strong>{u.fullName}</strong>
                                                    <small>@{u.username}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${u.role === "admin" ? styles.adminBadge : styles.userBadge}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={u.isVerified ? styles.verified : styles.unverified}>
                                                {u.isVerified ? "✔ Verified" : "✘ Pending"}
                                            </span>
                                        </td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {u.role !== "admin" && (
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteUser(u._id, u.fullName)}
                                                    disabled={deletingId === u._id}
                                                >
                                                    {deletingId === u._id ? "..." : <FaTrash />}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
