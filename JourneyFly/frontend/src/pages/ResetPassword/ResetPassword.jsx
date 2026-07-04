import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

import { resetPasswordUser } from "../../services/authService";
import styles from "../Login/Login.module.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        if (!token) {
            toast.error("Password reset token is missing or invalid.");
            return;
        }

        try {
            await resetPasswordUser(token, data.newPassword);
            toast.success("Password reset successful! You can now log in. 🔐");
            navigate("/login");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.overlay}>
                    <h1><Link to="/" style={{ color: "inherit", textDecoration: "none" }}>JourneyFly</Link></h1>
                    <p>Secure Your Travel Account.</p>
                </div>
            </div>
            <div className={styles.right}>
                <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
                    <h2>Reset Password</h2>
                    <p>Enter and confirm your new password below.</p>

                    <div className={styles.group}>
                        <label>New Password</label>
                        <div className={styles.password}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter New Password"
                                {...register("newPassword", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <span>{errors.newPassword?.message}</span>
                    </div>

                    <button className={styles.loginBtn} disabled={isSubmitting}>
                        {isSubmitting ? "Resetting Password..." : "Update Password"}
                    </button>

                    <div className={styles.signup}>
                        Back to
                        <Link to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
