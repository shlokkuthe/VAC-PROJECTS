import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowRight, FaPlane, FaMapMarkerAlt, FaDollarSign,
    FaChartBar, FaBell, FaStar
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import styles from "./Home.module.css";

const FEATURES = [
    {
        icon: <FaPlane />,
        title: "Smart Trip Planner",
        desc: "Create detailed itineraries with destination, dates, transport, budget, and co-traveler info all in one place.",
        color: "#2563EB",
    },
    {
        icon: <FaDollarSign />,
        title: "Expense Tracker",
        desc: "Log expenses by category — Food, Hotel, Fuel, Shopping, Medical — and track remaining budget in real time.",
        color: "#10b981",
    },
    {
        icon: <FaMapMarkerAlt />,
        title: "Interactive Maps",
        desc: "Visualize every destination on an interactive map powered by OpenStreetMap. Pin, zoom, and explore routes.",
        color: "#f97316",
    },
    {
        icon: <FaChartBar />,
        title: "Analytics Dashboard",
        desc: "Beautiful charts showing monthly stats, expense breakdowns, and trip status summaries at a glance.",
        color: "#8b5cf6",
    },
    {
        icon: <FaBell />,
        title: "Smart Notifications",
        desc: "Get alerted when your trip budget is exceeded, when someone reviews your trip, or when new trips are created.",
        color: "#ec4899",
    },
    {
        icon: <FaStar />,
        title: "Reviews & Wishlist",
        desc: "Share public trips for others to wishlist or review. Discover inspiring journeys from fellow globetrotters.",
        color: "#eab308",
    },
];

const STATS = [
    { value: "2", label: "Trips Planned" },
    { value: "150+", label: "Countries Covered" },
    { value: "98%", label: "Traveler Satisfaction" },
    { value: "Free", label: "Always & Forever" },
];

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className={styles.page}>
            {/* === Hero Section === */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <motion.div
                        className={styles.heroBadge}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        ✈️ Your Complete Travel Companion
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                    >
                        Plan Every Journey
                        <br />
                        <span className={styles.heroGradient}>Like a Pro.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Build smart itineraries, track expenses by category, visualize destinations
                        on live maps, and share your adventures with the world.
                    </motion.p>
                    <motion.div
                        className={styles.heroButtons}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.65 }}
                    >
                        <Link to="/signup" className={styles.btnPrimary}>
                            Start Planning Free
                        </Link>
                        <Link to="/trips" className={styles.btnSecondary}>
                            Explore Trips <FaArrowRight />
                        </Link>
                    </motion.div>
                </div>
                <div className={styles.heroScroll}>
                    <span>Scroll to explore</span>
                    <div className={styles.scrollLine}></div>
                </div>
            </section>

            {/* === Stats Row === */}
            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            className={styles.statBox}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <h2>{stat.value}</h2>
                            <p>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* === Features Section === */}
            <section className={styles.featuresSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTag}>Why JourneyFly?</span>
                    <h2>Everything you need for stress-free travel</h2>
                    <p>One platform to plan, track, analyze, and share all your adventures.</p>
                </div>
                <div className={styles.featuresGrid}>
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            className={styles.featureCard}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -6 }}
                        >
                            <div
                                className={styles.featureIcon}
                                style={{ background: `${f.color}18`, color: f.color }}
                            >
                                {f.icon}
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* === CTA Section === */}
            {!isAuthenticated && (
                <section className={styles.ctaSection}>
                    <motion.div
                        className={styles.ctaBox}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Ready to start your next adventure?</h2>
                        <p>
                            Join thousands of smart travelers who use JourneyFly to plan better,
                            spend smarter, and remember every trip.
                        </p>
                        <div className={styles.ctaButtons}>
                            <Link to="/login" className={styles.btnOutline}>
                                Login
                            </Link>
                            <Link to="/signup" className={styles.btnPrimary}>
                                Sign Up
                            </Link>
                            <Link to="/trips" className={styles.btnSecondary}>
                                Explore More
                            </Link>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* === Footer === */}
            <footer className={styles.footer}>
                <p>
                    <strong>JourneyFly</strong> - Travel Made Simple.<br></br>
                    Developer - Shlok Kuthe.<br></br>
                    USN NO.  - CS25D022.
                </p>
            </footer>
        </div>
    );
};

export default Home;