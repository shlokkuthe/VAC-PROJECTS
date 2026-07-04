import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FaUser, FaLock, FaTrash, FaPlane, FaCalendarCheck,
    FaTimesCircle, FaCheckCircle, FaEdit, FaCamera,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { updateProfile, uploadAvatar, changePassword, deleteAccount } from "../../services/profileService";
import { getTrips } from "../../services/tripService";
import styles from "./Profile.module.css";

const Profile = () => {
    const { user, updateUserState, logout } = useAuth();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [tripStats, setTripStats] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isDirty, isSubmitting },
    } = useForm({ defaultValues: { fullName: "", username: "", email: "", phone: "", country: "", bio: "" } });

    const {
        register: registerPwd,
        handleSubmit: handleSubmitPwd,
        reset: resetPwd,
        formState: { isSubmitting: changingPwd },
    } = useForm();

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName || "",
                username: user.username || "",
                email: user.email || "",
                phone: user.phone || "",
                country: user.country || "",
                bio: user.bio || "",
            });
        }
    }, [user, reset]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getTrips({ limit: 100 });
                const trips = res.trips || [];
                setTripStats({
                    total: trips.length,
                    upcoming: trips.filter((t) => t.status === "Upcoming").length,
                    ongoing: trips.filter((t) => t.status === "Ongoing").length,
                    completed: trips.filter((t) => t.status === "Completed").length,
                    cancelled: trips.filter((t) => t.status === "Cancelled").length,
                    draft: trips.filter((t) => t.status === "Draft").length,
                });
            } catch { /* silent */ }
        };
        fetchStats();
    }, []);

    const onSubmit = async (data) => {
        try {
            const res = await updateProfile({ fullName: data.fullName, phone: data.phone, country: data.country, bio: data.bio });
            updateUserState(res.user);
            toast.success("Profile updated successfully! ✨");
        } catch (error) { toast.error(error.message); }
    };

    const onChangePassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        try {
            await changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword });
            toast.success("Password changed successfully! 🔐");
            resetPwd();
            setShowPasswordSection(false);
        } catch (error) { toast.error(error.message); }
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        setUploading(true);
        try {
            const res = await uploadAvatar(formData);
            updateUserState({ avatar: res.avatar });
            toast.success("Avatar updated! 📷");
        } catch (error) { toast.error(error.message); }
        finally { setUploading(false); }
    };

    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        try {
            await deleteAccount();
            await logout();
            toast.success("Account deleted. Goodbye! 👋");
        } catch (error) {
            toast.error(error.message);
            setDeletingAccount(false);
            setShowDeleteModal(false);
        }
    };

    if (!user) return <div className="global-loader-container"><div className="global-loader" /></div>;

    const STAT_ITEMS = [
        { label: "Total Trips", value: tripStats?.total ?? "—", icon: <FaPlane />, color: "var(--primary)" },
        { label: "Upcoming", value: tripStats?.upcoming ?? "—", icon: <FaCalendarCheck />, color: "var(--warning)" },
        { label: "Completed", value: tripStats?.completed ?? "—", icon: <FaCheckCircle />, color: "var(--success)" },
        { label: "Cancelled", value: tripStats?.cancelled ?? "—", icon: <FaTimesCircle />, color: "var(--danger)" },
    ];

    return (
        <div className={styles.container}>

            {/* Profile Header Card */}
            <div className={styles.headerCard}>
                <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                    <img
                        src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                        alt="Avatar"
                        className={styles.avatar}
                    />
                    <div className={styles.avatarOverlay}>
                        {uploading ? "Uploading..." : <><FaCamera /> Change</>}
                    </div>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />
                </div>
                <div className={styles.headerInfo}>
                    <h1>{user.fullName}</h1>
                    <p>@{user.username} · {user.email}</p>
                    {user.bio && <p className={styles.bio}>{user.bio}</p>}
                    <div className={styles.headerBadges}>
                        <span className={styles.badge}>{user.country || "Traveler"}</span>
                        <span className={`${styles.badge} ${user.isVerified ? styles.verified : styles.unverified}`}>
                            {user.isVerified ? "✓ Verified" : "Unverified"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Trip Statistics */}
            <div className={styles.statsGrid}>
                {STAT_ITEMS.map((s) => (
                    <div className={styles.statCard} key={s.label}>
                        <div className={styles.statIcon} style={{ color: s.color, background: `${s.color}18` }}>{s.icon}</div>
                        <div>
                            <p className={styles.statValue}>{s.value}</p>
                            <p className={styles.statLabel}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Profile */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2><FaEdit /> Edit Profile</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label>Username (Read-Only)</label>
                        <input type="text" {...register("username")} disabled />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email (Read-Only)</label>
                        <input type="email" {...register("email")} disabled />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Full Name *</label>
                        <input type="text" placeholder="Your full name" {...register("fullName", { required: true })} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <input type="text" placeholder="+91 98765 43210" {...register("phone")} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Home Country</label>
                        <input type="text" placeholder="India" {...register("country")} />
                    </div>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Bio</label>
                        <textarea rows={3} placeholder="Tell us about your traveling style..." {...register("bio")} />
                    </div>
                    <div className={styles.fullWidth}>
                        <button type="submit" className={styles.saveBtn} disabled={!isDirty || isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2><FaLock /> Security</h2>
                    <button className={styles.toggleBtn} onClick={() => setShowPasswordSection((p) => !p)}>
                        {showPasswordSection ? "Cancel" : "Change Password"}
                    </button>
                </div>
                {showPasswordSection && (
                    <form onSubmit={handleSubmitPwd(onChangePassword)} className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Current Password</label>
                            <input type="password" placeholder="••••••••" {...registerPwd("oldPassword", { required: true })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>New Password</label>
                            <input type="password" placeholder="••••••••" {...registerPwd("newPassword", { required: true, minLength: 6 })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Confirm New Password</label>
                            <input type="password" placeholder="••••••••" {...registerPwd("confirmPassword", { required: true })} />
                        </div>
                        <div>
                            <button type="submit" className={styles.saveBtn} disabled={changingPwd}>
                                {changingPwd ? "Changing..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Danger Zone */}
            <div className={`${styles.section} ${styles.dangerSection}`}>
                <div className={styles.sectionHeader}>
                    <h2><FaTrash /> Danger Zone</h2>
                </div>
                <p className={styles.dangerText}>
                    Permanently delete your account and all associated trip data. This action cannot be undone.
                </p>
                <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
                    Delete My Account
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>⚠️</div>
                        <h3>Delete Account?</h3>
                        <p>This will permanently delete your account and all trips, expenses, and data. This cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className={styles.modalConfirm} onClick={handleDeleteAccount} disabled={deletingAccount}>
                                {deletingAccount ? "Deleting..." : "Yes, Delete Everything"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;