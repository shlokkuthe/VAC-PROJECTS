import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import styles from "./Login.module.css";

const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const {

        register,

        handleSubmit,

        formState: { errors, isSubmitting }

    } = useForm();

    const onSubmit = async (data) => {

        try {

            await login(data);

            toast.success("Welcome Back ✈️");

            navigate("/dashboard");

        } catch (error) {

            toast.error(error.message);

        }

    };

    return (

        <div className={styles.container}>

            <div className={styles.left}>

                <div className={styles.overlay}>

                    <h1>
                        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>JourneyFly</Link>
                    </h1>

                    <p>

                        Your Journey Begins Here.

                    </p>

                </div>

            </div>

            <div className={styles.right}>

                <form

                    className={styles.card}

                    onSubmit={handleSubmit(onSubmit)}

                >

                    <h2>

                        Welcome Back

                    </h2>

                    <p>

                        Login to continue planning your trips.

                    </p>

                    <div className={styles.group}>

                        <label>Email</label>

                        <input

                            type="email"

                            placeholder="Enter Email"

                            {...register("email", {

                                required: "Email is required"

                            })}

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

                                    required: "Password is required"

                                })}

                            />

                            <button

                                type="button"

                                onClick={() =>

                                    setShowPassword(!showPassword)

                                }

                            >

                                {

                                    showPassword

                                    ?

                                    <FaEyeSlash/>

                                    :

                                    <FaEye/>

                                }

                            </button>

                        </div>

                        <span>{errors.password?.message}</span>

                    </div>

                    <div className={styles.options}>

                        <label>

                            <input type="checkbox"/>

                            Remember Me

                        </label>

                        <Link to="/forgot-password">
                            Forgot Password?
                        </Link>

                    </div>

                    <button

                        className={styles.loginBtn}

                        disabled={isSubmitting}

                    >

                        {

                            isSubmitting

                            ?

                            "Logging In..."

                            :

                            "Login"

                        }

                    </button>

                    <div className={styles.signup}>

                        Don't have an account?

                        <Link to="/signup">

                            Signup

                        </Link>

                    </div>

                </form>

            </div>

        </div>

    );

};

export default Login;