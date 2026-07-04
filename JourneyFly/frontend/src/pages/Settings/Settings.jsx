import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { changePassword, deleteAccount, updateProfile } from "../../services/profileService";
import styles from "../Profile/Profile.module.css";

const Settings = () => {
    const { user, logout, updateUserState } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm();

    const handlePasswordSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            await changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            toast.success("Password updated successfully! 🔑");
            reset();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleNotificationToggle = async (e) => {
        const checked = e.target.checked;
        try {
            const res = await updateProfile({ notifications: checked });
            updateUserState({ notifications: res.user.notifications });
            toast.success(`Notifications ${checked ? "enabled" : "disabled"}.`);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            toast.error("⚠️ Press Delete again to PERMANENTLY erase your account.");
            return;
        }

        try {
            await deleteAccount();
            toast.success("Account deleted. Goodbye! 👋");
            logout();
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (!user) {
        return (
            <div className="global-loader-container">
                <div className="global-loader"></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* General Preferences */}
            <div className={styles.card}>
                <h2>Account Settings</h2>
                <p style={{ color: "var(--subText)" }}>Manage your login credentials and preferences.</p>

                <div className={styles.settingsSection}>
                    <h2>Preferences</h2>
                    
                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <h3>Dark Theme</h3>
                            <p>Enable dark mode styling across pages.</p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={theme === "dark"}
                                onChange={toggleTheme}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    <div className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                            <h3>Email Alerts</h3>
                            <p>Receive notifications when trips are created or updated.</p>
                        </div>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={user.notifications !== false}
                                onChange={handleNotificationToggle}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div className={styles.card}>
                <h2>Security Options</h2>
                <p style={{ color: "var(--subText)", marginBottom: "30px" }}>Change your password regularly for better safety.</p>

                <form onSubmit={handleSubmit(handlePasswordSubmit)} className={styles.formGrid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Current Password</label>
                        <input
                            type="password"
                            placeholder="Enter current password"
                            {...register("oldPassword", { required: "Current password is required" })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="Min. 6 characters"
                            {...register("newPassword", {
                                required: "New password is required",
                                minLength: { value: 6, message: "Password must be at least 6 characters" },
                            })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="Retype new password"
                            {...register("confirmPassword", { required: "Confirm password is required" })}
                        />
                    </div>

                    <div className={styles.fullWidth}>
                        <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Change Password"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Account */}
            <div className={styles.dangerZone}>
                <h2>Danger Zone</h2>
                <p>
                    Permanently delete your account. This action is irreversible, and all your mapped trips,
                    expenses, budget reports, and settings will be lost.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className={styles.deleteBtn}
                    style={{
                        background: confirmDelete ? "#ef4444" : "transparent",
                        color: confirmDelete ? "white" : "#ef4444",
                    }}
                >
                    {confirmDelete ? "Confirm Permanent Delete" : "Delete Account"}
                </button>
                {confirmDelete && (
                    <button
                        onClick={() => setConfirmDelete(false)}
                        className={styles.saveBtn}
                        style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)", marginLeft: "10px", marginTop: "0" }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default Settings;
