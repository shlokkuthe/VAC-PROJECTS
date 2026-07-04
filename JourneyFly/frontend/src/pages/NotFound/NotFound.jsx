import { Link } from "react-router-dom";
import { FaPlane } from "react-icons/fa";
import styles from "./NotFound.module.css";

const NotFound = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <FaPlane className={styles.planeIcon} />
                </div>
                <h1 className={styles.code}>404</h1>
                <h2>Lost in the clouds...</h2>
                <p>
                    The page you're looking for took an unexpected detour.
                    Let's get you back on track!
                </p>
                <div className={styles.actions}>
                    <Link to="/" className={styles.btnHome}>
                        Go to Homepage
                    </Link>
                    <Link to="/dashboard" className={styles.btnDash}>
                        Open Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;