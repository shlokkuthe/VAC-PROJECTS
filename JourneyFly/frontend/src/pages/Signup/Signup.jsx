import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import styles from "../Login/Login.module.css";

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            await signup(data);
            toast.success("Account created successfully! Check your email to verify. ✈️");
            navigate("/dashboard");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.overlay}>
                    <h1><Link to="/" style={{ color: "inherit", textDecoration: "none" }}>JourneyFly</Link></h1>
                    <p>Track. Plan. Explore.</p>
                </div>
            </div>
            <div className={styles.right}>
                <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
                    <h2>Create Account</h2>
                    <p>Sign up to begin your global travel logs.</p>

                    <div className={styles.group}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            {...register("fullName", { required: "Full name is required" })}
                        />
                        <span>{errors.fullName?.message}</span>
                    </div>

                    <div className={styles.group}>
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="johndoe123"
                            {...register("username", { required: "Username is required" })}
                        />
                        <span>{errors.username?.message}</span>
                    </div>

                    <div className={styles.group}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            {...register("email", { required: "Email is required" })}
                        />
                        <span>{errors.email?.message}</span>
                    </div>

                    <div className={styles.group}>
                        <label>Password</label>
                        <div className={styles.password}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                {...register("password", {
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
                        <span>{errors.password?.message}</span>
                    </div>

                    <div className={styles.group}>
                        <label>Phone (Optional)</label>
                        <input type="text" placeholder="+1 (555) 019-2834" {...register("phone")} />
                    </div>

                    <div className={styles.group}>
                        <label>Country (Optional)</label>
                        <input type="text" placeholder="United States" {...register("country")} />
                    </div>

                    <button className={styles.loginBtn} disabled={isSubmitting}>
                        {isSubmitting ? "Creating Account..." : "Sign Up"}
                    </button>

                    <div className={styles.signup}>
                        Already have an account?
                        <Link to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;