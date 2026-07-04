import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    FaPlane, FaPlus, FaSearch, FaFilter
} from "react-icons/fa";
import toast from "react-hot-toast";

import { getTrips, toggleWishlist, getWishlistedTrips, cancelTrip, duplicateTrip, restoreTrip, deleteTrip } from "../../services/tripService";
import { useAuth } from "../../context/AuthContext";
import styles from "./Trips.module.css";
import TripCard from "../../components/TripCard/TripCard";

const STATUS_STYLES = {
    Upcoming: styles.badgeUpcoming,
    Ongoing: styles.badgeOngoing,
    Completed: styles.badgeCompleted,
    Cancelled: styles.badgeCancelled,
    Draft: styles.badgeDraft,
};

const TRIP_TYPES = ["Adventure", "Business", "Leisure", "Honeymoon", "Family", "Solo", "Other"];

const Trips = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(user ? "my-trips" : "explore");
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [tripType, setTripType] = useState("");
    const [minBudget, setMinBudget] = useState("");
    const [maxBudget, setMaxBudget] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [showFilters, setShowFilters] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchTripsData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === "wishlist") {
                const res = await getWishlistedTrips();
                setTrips(res.trips);
                setPagination({ page: 1, pages: 1 });
            } else {
                const isPublic = activeTab === "explore";
                const params = { search, page, limit: 6, isPublic };
                if (status) params.status = status;
                if (tripType) params.tripType = tripType;
                if (minBudget) params.minBudget = minBudget;
                if (maxBudget) params.maxBudget = maxBudget;

                const res = await getTrips(params);
                setTrips(res.trips);
                setPagination(res.pagination);
            }
        } catch (error) {
            toast.error(error.message || "Failed to fetch trips.");
        } finally {
            setLoading(false);
        }
    }, [activeTab, search, status, tripType, minBudget, maxBudget, page]);

    useEffect(() => { fetchTripsData(); }, [fetchTripsData]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setPage(1);
        setSearch(""); setStatus(""); setTripType(""); setMinBudget(""); setMaxBudget("");
    };

    const handleWishlistToggle = async (tripId, e) => {
        e.preventDefault(); e.stopPropagation();
        try {
            const res = await toggleWishlist(tripId);
            toast.success(res.message);
            fetchTripsData();
        } catch (error) { toast.error(error.message); }
    };

    const handleDuplicate = async (tripId, e) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await duplicateTrip(tripId);
            toast.success("Trip duplicated! 📋");
            fetchTripsData();
        } catch (error) { toast.error(error.message); }
    };

    const handleCancel = async () => {
        if (!confirmCancel) return;
        try {
            await cancelTrip(confirmCancel);
            toast.success("Trip cancelled.");
            setConfirmCancel(null);
            fetchTripsData();
        } catch (error) { toast.error(error.message); }
    };

    const handleRestore = async (tripId, e) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await restoreTrip(tripId);
            toast.success("Trip restored! ✅");
            fetchTripsData();
        } catch (error) { toast.error(error.message); }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await deleteTrip(confirmDelete);
            toast.success("Trip deleted completely.");
            setConfirmDelete(null);
            fetchTripsData();
        } catch (error) { toast.error(error.message); }
    };

    const tabs = user ? ["my-trips", "explore", "wishlist"] : ["explore"];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Travel Registry</h1>
                    <p>
                        {activeTab === "my-trips" && "Track and manage your upcoming and past itineraries."}
                        {activeTab === "explore" && "Discover and get inspired by other travelers' journeys."}
                        {activeTab === "wishlist" && "Keep track of destinations you plan to visit later."}
                    </p>
                </div>
                <Link to="/create-trip" className={styles.planBtn}><FaPlus /> Plan Adventure</Link>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`} onClick={() => handleTabChange(tab)}>
                        {tab === "my-trips" ? "My Trips" : tab === "explore" ? "Explore Public" : "My Wishlist"}
                    </button>
                ))}
            </div>

            {/* Filters */}
            {activeTab !== "wishlist" && (
                <div className={styles.filterSection}>
                    <div className={styles.searchRow}>
                        <div className={styles.searchBox}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search destination, city, country, trip name..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <button className={styles.filterToggleBtn} onClick={() => setShowFilters((f) => !f)}>
                            <FaFilter /> {showFilters ? "Hide" : "Filters"}
                        </button>
                    </div>

                    {showFilters && (
                        <div className={styles.filterGrid}>
                            <div className={styles.filterGroup}>
                                <label>Status</label>
                                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                                    <option value="">All Statuses</option>
                                    <option value="Draft">📝 Draft</option>
                                    <option value="Upcoming">🗓️ Upcoming</option>
                                    <option value="Ongoing">🔄 Ongoing</option>
                                    <option value="Completed">✅ Completed</option>
                                    <option value="Cancelled">❌ Cancelled</option>
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Trip Type</label>
                                <select value={tripType} onChange={(e) => { setTripType(e.target.value); setPage(1); }}>
                                    <option value="">All Types</option>
                                    {TRIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Min Budget ($)</label>
                                <input type="number" placeholder="0" value={minBudget} onChange={(e) => { setMinBudget(e.target.value); setPage(1); }} />
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Max Budget ($)</label>
                                <input type="number" placeholder="Any" value={maxBudget} onChange={(e) => { setMaxBudget(e.target.value); setPage(1); }} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Trip Grid */}
            {loading ? (
                <div className="global-loader-container" style={{ minHeight: "300px" }}><div className="global-loader" /></div>
            ) : trips.length > 0 ? (
                <>
                    <div className={styles.grid}>
                        {trips.map((trip) => {
                            const isOwner = String(trip.user?._id || trip.user) === user?.id;
                            const isLiked = trip.wishlistedBy?.includes(user?.id);

                            return (
                                <TripCard
                                    key={trip._id}
                                    trip={trip}
                                    isOwner={isOwner}
                                    isLiked={isLiked}
                                    onWishlistToggle={user ? handleWishlistToggle : undefined}
                                    onDuplicate={handleDuplicate}
                                    onCancel={(id, e) => { e.preventDefault(); e.stopPropagation(); setConfirmCancel(id); }}
                                    onRestore={handleRestore}
                                    onDelete={(id, e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(id); }}
                                />
                            );
                        })}
                    </div>

                    {pagination.pages > 1 && (
                        <div className={styles.pagination}>
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className={styles.pageBtn}>Previous</button>
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pNum) => (
                                <button key={pNum} className={`${styles.pageBtn} ${page === pNum ? styles.activePage : ""}`} onClick={() => setPage(pNum)}>{pNum}</button>
                            ))}
                            <button disabled={page === pagination.pages} onClick={() => setPage(page + 1)} className={styles.pageBtn}>Next</button>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.emptyState}>
                    <FaPlane size={52} className={styles.emptyIcon} />
                    <h3>No trips found</h3>
                    <p>Try resetting filters or plan your next adventure!</p>
                    <Link to="/create-trip" className={styles.planBtn}><FaPlus /> Plan Adventure</Link>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {confirmCancel && (
                <div className={styles.modalOverlay} onClick={() => setConfirmCancel(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>🚫</div>
                        <h3>Cancel this trip?</h3>
                        <p>The trip will be marked as Cancelled. You can restore it later.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setConfirmCancel(null)}>Keep Trip</button>
                            <button className={styles.modalConfirm} onClick={handleCancel}>Yes, Cancel It</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>🗑️</div>
                        <h3>Delete this trip?</h3>
                        <p>This action is irreversible. The trip will be permanently removed.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className={styles.modalConfirm} onClick={handleDelete}>Yes, Delete It</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trips;
