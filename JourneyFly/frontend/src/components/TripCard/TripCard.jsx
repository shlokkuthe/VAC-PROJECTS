import React from "react";
import { Link } from "react-router-dom";
import {
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaDollarSign,
    FaHeart,
    FaRegHeart,
    FaCopy,
    FaBan,
    FaUndo,
    FaEdit,
    FaTrashAlt,
    FaCloudSun
} from "react-icons/fa";
import styles from "./TripCard.module.css";

const STATUS_STYLES = {
    Upcoming: styles.badgeUpcoming,
    Ongoing: styles.badgeOngoing,
    Completed: styles.badgeCompleted,
    Cancelled: styles.badgeCancelled,
    Draft: styles.badgeDraft,
};

const TripCard = ({
    trip,
    isOwner,
    isLiked,
    onWishlistToggle,
    onDuplicate,
    onCancel,
    onRestore,
    onDelete,
    onEdit
}) => {
    // Generate a placeholder weather summary based on destination length (just for demo purposes if real data is missing)
    const weatherSummary = trip.weather || "Sunny, 24°C"; 

    return (
        <div className={styles.tripCard}>
            <div className={styles.cardImage}>
                <img
                    src={trip.tripImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"}
                    alt={trip.destination}
                />
                <span className={`${styles.badge} ${STATUS_STYLES[trip.status] || ""}`}>
                    {trip.status}
                </span>
                
                {trip.tripType && (
                    <span className={styles.typeBadge}>{trip.tripType}</span>
                )}
                
                {!isOwner && onWishlistToggle && (
                    <button
                        onClick={(e) => onWishlistToggle(trip._id, e)}
                        className={styles.wishlistBtn}
                        title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {isLiked ? <FaHeart style={{ color: "#ef4444" }} /> : <FaRegHeart />}
                    </button>
                )}
            </div>

            <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                    <h3>{trip.tripName || trip.destination}</h3>
                    <div className={styles.location}>
                        <FaMapMarkerAlt /> {trip.city}, {trip.country}
                    </div>
                </div>

                <div className={styles.weatherSummary}>
                    <FaCloudSun /> <span>Weather:</span> {weatherSummary}
                </div>

                <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                        <FaDollarSign /> ${trip.budget?.toLocaleString()}
                    </div>
                    <div className={styles.metaItem}>
                        <FaCalendarAlt />{" "}
                        {new Date(trip.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                </div>

                <div className={styles.cardActions}>
                    <Link to={`/trips/${trip._id}`} className={styles.viewBtn}>
                        View Details
                    </Link>
                    
                    {isOwner && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={(e) => onEdit(trip._id, e)}
                                    className={`${styles.iconBtn} ${styles.editBtn}`}
                                    title="Edit"
                                >
                                    <FaEdit />
                                </button>
                            )}
                            
                            {onDuplicate && (
                                <button
                                    onClick={(e) => onDuplicate(trip._id, e)}
                                    className={styles.iconBtn}
                                    title="Duplicate"
                                >
                                    <FaCopy />
                                </button>
                            )}

                            {onDelete && (
                                <button
                                    onClick={(e) => onDelete(trip._id, e)}
                                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                    title="Delete"
                                >
                                    <FaTrashAlt />
                                </button>
                            )}

                            {trip.status === "Cancelled" ? (
                                onRestore && (
                                    <button
                                        onClick={(e) => onRestore(trip._id, e)}
                                        className={`${styles.iconBtn} ${styles.restoreBtn}`}
                                        title="Restore"
                                    >
                                        <FaUndo />
                                    </button>
                                )
                            ) : (
                                onCancel && (
                                    <button
                                        onClick={(e) => onCancel(trip._id, e)}
                                        className={`${styles.iconBtn} ${styles.cancelBtn}`}
                                        title="Cancel"
                                    >
                                        <FaBan />
                                    </button>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripCard;
