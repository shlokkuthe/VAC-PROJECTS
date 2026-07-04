import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { forgotPasswordUser } from "../../services/authService";
import styles from "../Login/Login.module.css";

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();

    const onSubmit = async (data) => {
        try {
            await forgotPasswordUser(data.email);
            toast.success("Password reset link sent to your email! ✉️");
            reset();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.overlay}>
                    <h1><Link to="/" style={{ color: "inherit", textDecoration: "none" }}>JourneyFly</Link></h1>
                    <p>Recover Your Travel Journal.</p>
                </div>
            </div>
            <div className={styles.right}>
                <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
                    <h2>Forgot Password</h2>
                    <p>Enter your registered email address to receive a password reset link.</p>

                    <div className={styles.group}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            {...register("email", { required: "Email is required" })}
                        />
                        <span>{errors.email?.message}</span>
                    </div>

                    <button className={styles.loginBtn} disabled={isSubmitting}>
                        {isSubmitting ? "Sending Link..." : "Send Reset Link"}
                    </button>

                    <div className={styles.signup}>
                        Remember your password?
                        <Link to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
