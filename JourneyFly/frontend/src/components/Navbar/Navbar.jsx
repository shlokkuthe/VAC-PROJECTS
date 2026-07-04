import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { FaShieldAlt } from "react-icons/fa";
import toast from "react-hot-toast";

import ThemeToggle from "../ThemeToggle/ThemeToggle";
import NotificationPanel from "../NotificationPanel/NotificationPanel";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setProfileOpen(false);
        await logout();
        toast.success("Logged out successfully. Safe travels! 👋");
        navigate("/");
    };

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
            {/* Logo */}
            <Link to="/" className={styles.logo}>
                ✈ JourneyFly
            </Link>

            {/* Nav Links */}
            <ul className={`${styles.links} ${menuOpen ? styles.active : ""}`}>
                <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink></li>
                {isAuthenticated && (
                    <>
                        <li><NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink></li>
                        <li><NavLink to="/trips" onClick={() => setMenuOpen(false)}>My Trips</NavLink></li>
                        <li><NavLink to="/create-trip" onClick={() => setMenuOpen(false)}>Plan Trip</NavLink></li>
                    </>
                )}
                {!isAuthenticated && (
                    <li><NavLink to="/trips" onClick={() => setMenuOpen(false)}>Explore</NavLink></li>
                )}
            </ul>

            {/* Right Actions */}
            <div className={styles.actions}>
                <ThemeToggle />

                {isAuthenticated ? (
                    <>
                        {/* Admin link */}
                        {isAdmin && (
                            <Link to="/admin" className={styles.adminBtn} title="Admin Panel">
                                <FaShieldAlt />
                            </Link>
                        )}

                        {/* Notification Bell */}
                        <NotificationPanel />

                        {/* Profile dropdown */}
                        <div className={styles.profile} ref={dropdownRef}>
                            <img
                                src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                alt="Profile"
                                className={styles.avatar}
                                onClick={() => setProfileOpen((p) => !p)}
                            />
                            {profileOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <strong>{user?.fullName}</strong>
                                        <small>@{user?.username}</small>
                                    </div>
                                    <div className={styles.dropdownDivider} />
                                    <Link to="/profile" onClick={() => setProfileOpen(false)}>My Profile</Link>
                                    <Link to="/settings" onClick={() => setProfileOpen(false)}>Settings</Link>
                                    {isAdmin && (
                                        <Link to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</Link>
                                    )}
                                    <div className={styles.dropdownDivider} />
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.authButtons}>
                        <Link to="/login" className={styles.loginLink}>Login</Link>
                        <Link to="/signup" className={styles.signupLink}>Get Started</Link>
                    </div>
                )}

                {/* Mobile hamburger */}
                <button
                    className={styles.mobile}
                    onClick={() => setMenuOpen((m) => !m)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <HiX size={26} /> : <HiOutlineMenuAlt3 size={26} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;