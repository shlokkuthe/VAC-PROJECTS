import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

import { verifyEmailUser } from "../../services/authService";
import styles from "../Login/Login.module.css";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setVerifying(false);
                setSuccess(false);
                return;
            }

            try {
                await verifyEmailUser(token);
                setSuccess(true);
                toast.success("Email verified successfully! ✈️");
            } catch (error) {
                setSuccess(false);
                toast.error(error.message || "Verification failed.");
            } finally {
                setVerifying(false);
            }
        };

        verify();
    }, [token]);

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.overlay}>
                    <h1><Link to="/" style={{ color: "inherit", textDecoration: "none" }}>JourneyFly</Link></h1>
                    <p>Verify Your Identity.</p>
                </div>
            </div>
            <div className={styles.right}>
                <div className={styles.card} style={{ textAlign: "center" }}>
                    {verifying ? (
                        <>
                            <h2>Verifying...</h2>
                            <p>Please wait while we confirm your email address.</p>
                            <div className="global-loader" style={{ margin: "20px auto" }}></div>
                        </>
                    ) : success ? (
                        <>
                            <h2>Success! 🎉</h2>
                            <p style={{ margin: "15px 0 30px" }}>
                                Your email has been verified. You can now access all features of JourneyFly.
                            </p>
                            <Link to="/login" className={styles.loginBtn} style={{ display: "block" }}>
                                Proceed to Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <h2>Verification Failed ❌</h2>
                            <p style={{ margin: "15px 0 30px" }}>
                                The verification link is invalid, expired, or broken. Please request a new link or contact support.
                            </p>
                            <Link to="/login" className={styles.loginBtn} style={{ display: "block" }}>
                                Back to Login
                            </Link>
                        </>
                    )
                    }
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
