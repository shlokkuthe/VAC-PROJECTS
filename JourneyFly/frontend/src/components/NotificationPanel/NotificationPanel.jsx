import { useState, useEffect, useRef } from "react";
import { FaBell, FaTrash, FaCheck, FaCheckDouble } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import toast from "react-hot-toast";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../../services/notificationService";
import styles from "./NotificationPanel.module.css";

const TYPE_ICON = { trip: "✈️", budget: "💰", review: "⭐", info: "ℹ️" };

const NotificationPanel = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef(null);

    const fetchData = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([getNotifications(), getUnreadCount()]);
            setNotifications(notifRes.notifications);
            setUnreadCount(countRes.count);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch { /* silent */ }
    };

    const handleMarkAll = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch { /* silent */ }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            const removed = notifications.find((n) => n._id === id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
        } catch { /* silent */ }
    };

    return (
        <div className={styles.wrapper} ref={panelRef}>
            <button className={styles.bellBtn} onClick={() => setOpen((o) => !o)} aria-label="Notifications">
                <FaBell />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>

            {open && (
                <div className={styles.panel}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        <div className={styles.headerActions}>
                            {unreadCount > 0 && (
                                <button className={styles.markAllBtn} onClick={handleMarkAll} title="Mark all as read">
                                    <FaCheckDouble /> Mark all read
                                </button>
                            )}
                            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                                <HiX />
                            </button>
                        </div>
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <FaBell size={32} />
                                <p>All caught up! No notifications.</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n._id} className={`${styles.item} ${!n.read ? styles.unread : ""}`}>
                                    <div className={styles.itemIcon}>{TYPE_ICON[n.type] || "ℹ️"}</div>
                                    <div className={styles.itemContent}>
                                        <p className={styles.itemTitle}>{n.title}</p>
                                        <p className={styles.itemMsg}>{n.message}</p>
                                        <span className={styles.itemTime}>
                                            {new Date(n.createdAt).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div className={styles.itemActions}>
                                        {!n.read && (
                                            <button onClick={() => handleMarkRead(n._id)} title="Mark as read" className={styles.actionBtn}>
                                                <FaCheck />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(n._id)} title="Delete" className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
