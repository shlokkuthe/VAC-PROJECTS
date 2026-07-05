import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaPen, FaTrash, FaCloudSun,
    FaStar, FaBan, FaUndo, FaCopy, FaEdit, FaPlus, FaTimes, FaSearch,
    FaLocationArrow,
} from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import {
    getTripById, updateTrip, deleteTrip, getWeatherData,
    cancelTrip, restoreTrip, duplicateTrip, getReviews, addReview,
} from "../../services/tripService";
import { addExpense, updateExpense, deleteExpense } from "../../services/expenseService";
import { getItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem } from "../../services/itineraryService";
import styles from "./TripDetails.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

// Fix default marker icon for react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// User location icon
const userIcon = new L.DivIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 0 0 3px rgba(37,99,235,0.3)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
// ... (omitting comment line to avoid matches mismatch)
});

const EXPENSE_CATEGORIES = [
    { value: "Hotel", label: "🏨 Hotel" },
    { value: "Food", label: "🍽️ Food" },
    { value: "Flight", label: "✈️ Flight" },
    { value: "Train", label: "🚄 Train" },
    { value: "Bus", label: "🚌 Bus" },
    { value: "Taxi", label: "🚕 Taxi" },
    { value: "Fuel", label: "⛽ Fuel" },
    { value: "Shopping", label: "🛍️ Shopping" },
    { value: "Activities", label: "🎯 Activities" },
    { value: "Medical", label: "🏥 Medical" },
    { value: "Other", label: "📦 Other" },
];

const CATEGORY_ICON = {
    Hotel: "🏨", Food: "🍽️", Flight: "✈️", Train: "🚄", Bus: "🚌",
    Taxi: "🚕", Fuel: "⛽", Shopping: "🛍️", Activities: "🎯", Medical: "🏥", Other: "📦",
};

const CHART_COLORS = [
    "#2563EB","#10b981","#f59e0b","#ef4444","#8b5cf6",
    "#06b6d4","#f97316","#ec4899","#14b8a6","#84cc16","#6b7280",
];

const TIME_OF_DAY = ["Morning", "Afternoon", "Evening", "Night"];
const TIME_ICONS = { Morning: "🌅", Afternoon: "☀️", Evening: "🌆", Night: "🌙" };

const TripDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");
    const [coords, setCoords] = useState(null);
    const [userCoords, setUserCoords] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'cancel'|'delete' }
    const [expenseFilter, setExpenseFilter] = useState("");
    const [editingExpense, setEditingExpense] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [itineraryGrouped, setItineraryGrouped] = useState({});
    const [showAddItem, setShowAddItem] = useState(null); // { day, timeOfDay }
    const [editingItem, setEditingItem] = useState(null);

    // Forms
    const { register: registerExpense, handleSubmit: handleSubmitExpense, reset: resetExpense, formState: { isSubmitting: addingExp } } = useForm();
    const { register: registerEditExp, handleSubmit: handleSubmitEditExp, reset: resetEditExp } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { isSubmitting: savingTrip } } = useForm();
    const { register: registerReview, handleSubmit: handleSubmitReview, reset: resetReview } = useForm();
    const { register: registerItem, handleSubmit: handleSubmitItem, reset: resetItem } = useForm();
    const { register: registerEditItem, handleSubmit: handleSubmitEditItem, reset: resetEditItem } = useForm();

    const loadItinerary = useCallback(async () => {
        try {
            const res = await getItinerary(id);
            setItinerary(res.items);
            setItineraryGrouped(res.grouped);
        } catch { /* silent */ }
    }, [id]);

    const loadAllDetails = useCallback(async () => {
        try {
            const details = await getTripById(id);
            setData(details);
            resetEdit({
                tripName: details.trip.tripName || details.trip.destination,
                destination: details.trip.destination,
                city: details.trip.city,
                country: details.trip.country,
                tripType: details.trip.tripType || "Leisure",
                budget: details.trip.budget,
                startDate: details.trip.startDate.split("T")[0],
                endDate: details.trip.endDate.split("T")[0],
                transportation: details.trip.transportation,
                description: details.trip.description,
                travelers: details.trip.travelers,
                status: details.trip.status,
                isPublic: details.trip.isPublic,
            });

            setWeatherLoading(true);
            try {
                const weatherData = await getWeatherData(details.trip.city);
                setWeather(weatherData.weather);
            } catch { setWeather(null); }
            finally { setWeatherLoading(false); }

            if (details.trip.isPublic) {
                try {
                    const reviewData = await getReviews(id);
                    setReviews(reviewData.reviews);
                } catch { /* silent */ }
            }

            // Geocode destination
            try {
                const q = `${details.trip.city}, ${details.trip.country}`;
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
                    { headers: { "Accept-Language": "en", "User-Agent": "JourneyFly-App/1.0" } }
                );
                const geoData = await geoRes.json();
                if (geoData?.length > 0) {
                    setCoords([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
                } else {
                    setCoords([48.8566, 2.3522]); // Paris fallback
                }
            } catch { setCoords([48.8566, 2.3522]); }
        } catch (error) {
            toast.error(error.message || "Failed to load trip details.");
            navigate("/trips");
        } finally {
            setLoading(false);
        }
    }, [id, navigate, resetEdit]);

    useEffect(() => { loadAllDetails(); }, [loadAllDetails]);
    useEffect(() => { loadItinerary(); }, [loadItinerary]);

    // Get user geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
                () => {} // silent — user denied
            );
        }
    }, []);

    const handleDelete = async () => {
        try {
            await deleteTrip(id);
            toast.success("Trip deleted successfully.");
            navigate("/trips");
        } catch (error) { toast.error(error.message); }
        finally { setConfirmAction(null); }
    };

    const handleCancelTrip = async () => {
        try {
            await cancelTrip(id);
            toast.success("Trip cancelled.");
            loadAllDetails();
        } catch (error) { toast.error(error.message); }
        finally { setConfirmAction(null); }
    };

    const handleRestoreTrip = async () => {
        try {
            await restoreTrip(id);
            toast.success("Trip restored! ✅");
            loadAllDetails();
        } catch (error) { toast.error(error.message); }
    };

    const handleDuplicateTrip = async () => {
        try {
            const res = await duplicateTrip(id);
            toast.success("Trip duplicated! 📋");
            navigate(`/trips/${res.trip._id}`);
        } catch (error) { toast.error(error.message); }
    };

    const handleEditSubmit = async (fields) => {
        const formData = new FormData();
        Object.keys(fields).forEach((key) => formData.append(key, fields[key]));
        const fileInput = document.getElementById("editTripImage");
        if (fileInput?.files?.[0]) formData.append("tripImage", fileInput.files[0]);
        try {
            await updateTrip(id, formData);
            toast.success("Trip updated successfully!");
            setIsEditing(false);
            loadAllDetails();
        } catch (error) { toast.error(error.message); }
    };

    const handleAddExpense = async (expData) => {
        try {
            const res = await addExpense({ tripId: id, ...expData });
            toast.success("Expense logged! 💰");
            resetExpense();
            loadAllDetails();
            const pct = res.summary?.percentageUsed || 0;
            if (pct >= 100) toast.error("🚨 Budget exceeded!");
            else if (pct >= 80) toast("⚠️ 80% of budget used!", { icon: "⚠️" });
            else if (pct >= 50) toast("📊 50% of budget used.", { icon: "📊" });
        } catch (error) { toast.error(error.message); }
    };

    const handleEditExpenseSubmit = async (expData) => {
        try {
            await updateExpense(editingExpense._id, expData);
            toast.success("Expense updated!");
            setEditingExpense(null);
            resetEditExp();
            loadAllDetails();
        } catch (error) { toast.error(error.message); }
    };

    const handleRemoveExpense = async (expenseId) => {
        try {
            await deleteExpense(expenseId);
            toast.success("Expense removed.");
            loadAllDetails();
        } catch (error) { toast.error(error.message); }
    };

    const handleAddReview = async (reviewData) => {
        try {
            await addReview(id, { rating: newRating, comment: reviewData.comment });
            toast.success("Review submitted! ⭐");
            resetReview();
            setNewRating(5);
            loadAllDetails();
        } catch (error) { toast.error(error.message); }
    };

    const handleAddItem = async (itemData) => {
        try {
            await addItineraryItem({ tripId: id, day: showAddItem.day, timeOfDay: showAddItem.timeOfDay, ...itemData });
            toast.success("Activity added!");
            resetItem();
            setShowAddItem(null);
            loadItinerary();
        } catch (error) { toast.error(error.message); }
    };

    const handleUpdateItem = async (itemData) => {
        try {
            await updateItineraryItem(editingItem._id, itemData);
            toast.success("Activity updated!");
            setEditingItem(null);
            resetEditItem();
            loadItinerary();
        } catch (error) { toast.error(error.message); }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await deleteItineraryItem(itemId);
            toast.success("Activity removed.");
            loadItinerary();
        } catch (error) { toast.error(error.message); }
    };

    if (loading) return <div className="global-loader-container"><div className="global-loader" /></div>;

    const { trip, expenses, summary } = data;
    const currentUserId = user?._id || user?.id;
    const isOwner = String(trip.user?._id || trip.user) === String(currentUserId);
    const percentSpent = summary.totalBudget > 0 ? Math.min((summary.totalExpense / summary.totalBudget) * 100, 100) : 0;
    const budgetColor = percentSpent >= 100 ? "var(--danger)" : percentSpent >= 80 ? "var(--warning)" : "var(--success)";

    // Calculate trip duration in days
    const tripDays = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1);

    // Chart data
    const categoryTotals = {};
    expenses.forEach((e) => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
    const chartLabels = Object.keys(categoryTotals);
    const chartData = {
        labels: chartLabels,
        datasets: [{ data: Object.values(categoryTotals), backgroundColor: CHART_COLORS.slice(0, chartLabels.length), borderWidth: 0, hoverOffset: 6 }],
    };

    // Filter expenses
    const filteredExpenses = expenseFilter
        ? expenses.filter((e) => e.category === expenseFilter || (e.description && e.description.toLowerCase().includes(expenseFilter.toLowerCase())))
        : expenses;

    const STATUS_COLOR = { Upcoming: "#2563EB", Ongoing: "#f59e0b", Completed: "#10b981", Cancelled: "#ef4444", Draft: "#94a3b8" };

    return (
        <div className={styles.container}>
            {/* Hero */}
            <div className={styles.hero}>
                <img src={trip.tripImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"} alt={trip.destination} className={styles.heroImage} />
                <div className={styles.heroOverlay}>
                    <span className={styles.heroBadge} style={{ background: STATUS_COLOR[trip.status] || "#2563EB" }}>{trip.status}</span>
                    <h1>{trip.tripName || trip.destination}</h1>
                    <div className={styles.heroLocation}><FaMapMarkerAlt />{trip.city}, {trip.country}</div>
                </div>
                {isOwner && (
                    <div className={styles.actionRow}>
                        <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => setIsEditing(!isEditing)}><FaEdit />{isEditing ? "Close" : "Edit"}</button>
                        <button className={`${styles.actionBtn} ${styles.dupBtn}`} onClick={handleDuplicateTrip}><FaCopy />Duplicate</button>
                        {trip.status === "Cancelled"
                            ? <button className={`${styles.actionBtn} ${styles.restoreBtn}`} onClick={handleRestoreTrip}><FaUndo />Restore</button>
                            : <button className={`${styles.actionBtn} ${styles.cancelTripBtn}`} onClick={() => setConfirmAction({ type: "cancel" })}><FaBan />Cancel</button>
                        }
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => setConfirmAction({ type: "delete" })}><FaTrash />Delete</button>
                    </div>
                )}
            </div>

            {/* Edit Form */}
            {isEditing && (
                <div className={`${styles.card} ${styles.editCard}`}>
                    <h2>✏️ Edit Trip Details</h2>
                    <form onSubmit={handleSubmitEdit(handleEditSubmit)} className={styles.formGrid}>
                        <div className={styles.inputGroup}><label>Trip Name</label><input type="text" {...registerEdit("tripName")} /></div>
                        <div className={styles.inputGroup}><label>Destination</label><input type="text" {...registerEdit("destination", { required: true })} /></div>
                        <div className={styles.inputGroup}><label>City</label><input type="text" {...registerEdit("city", { required: true })} /></div>
                        <div className={styles.inputGroup}><label>Country</label><input type="text" {...registerEdit("country", { required: true })} /></div>
                        <div className={styles.inputGroup}><label>Trip Type</label>
                            <select {...registerEdit("tripType")}>
                                {["Adventure","Business","Leisure","Honeymoon","Family","Solo","Other"].map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}><label>Budget ($)</label><input type="number" {...registerEdit("budget", { required: true })} /></div>
                        <div className={styles.inputGroup}><label>Start Date</label><input type="date" {...registerEdit("startDate", { required: true })} /></div>
                        <div className={styles.inputGroup}><label>End Date</label><input type="date" {...registerEdit("endDate", { required: true })} /></div>
                        <div className={styles.inputGroup}><label>Transportation</label>
                            <select {...registerEdit("transportation")}>
                                <option value="Flight">✈️ Flight</option><option value="Train">🚄 Train</option>
                                <option value="Bus">🚌 Bus</option><option value="Car">🚗 Car</option><option value="Other">🎒 Other</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}><label>Travelers</label><input type="number" min="1" {...registerEdit("travelers")} /></div>
                        <div className={styles.inputGroup}><label>Status</label>
                            <select {...registerEdit("status")}>
                                <option value="Draft">📝 Draft</option><option value="Upcoming">🗓️ Upcoming</option>
                                <option value="Ongoing">🔄 Ongoing</option><option value="Completed">✅ Completed</option>
                                <option value="Cancelled">❌ Cancelled</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}><label>Cover Image</label><input type="file" id="editTripImage" accept="image/*" /></div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}><label>Description</label><textarea rows={3} {...registerEdit("description")} /></div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label className={styles.checkboxLabel}><input type="checkbox" {...registerEdit("isPublic")} /> Make this trip public</label>
                        </div>
                        <div className={styles.fullWidth}><button type="submit" className={styles.submitBtn} disabled={savingTrip}>{savingTrip ? "Saving..." : "Update Trip"}</button></div>
                    </form>
                </div>
            )}

            {/* Main Grid */}
            <div className={styles.detailsGrid}>
                {/* LEFT COLUMN */}
                <div>
                    {/* Trip Overview */}
                    <div className={styles.card}>
                        <h2>ℹ️ Trip Overview</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoBlock}><h4>Transportation</h4><p>{trip.transportation === "Flight" ? "✈️" : trip.transportation === "Train" ? "🚄" : trip.transportation === "Bus" ? "🚌" : trip.transportation === "Car" ? "🚗" : "🎒"} {trip.transportation}</p></div>
                            <div className={styles.infoBlock}><h4>Trip Type</h4><p>{trip.tripType || "Leisure"}</p></div>
                            <div className={styles.infoBlock}><h4>Dates</h4><p><FaCalendarAlt /> {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</p></div>
                            <div className={styles.infoBlock}><h4>Duration</h4><p>🗓️ {tripDays} {tripDays === 1 ? "day" : "days"}</p></div>
                            <div className={styles.infoBlock}><h4>Travelers</h4><p><FaUsers /> {trip.travelers} {trip.travelers > 1 ? "people" : "person"}</p></div>
                            <div className={styles.infoBlock}><h4>Planned By</h4><p><img src={trip.user?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" style={{ width: 18, height: 18, borderRadius: "50%", marginRight: 5 }} />{trip.user?.fullName}</p></div>
                        </div>
                        {trip.description && <div className={styles.descBlock}><h4>Notes</h4><p>{trip.description}</p></div>}
                    </div>

                    {/* Map */}
                    <div className={styles.card}>
                        <h2>📍 Destination Map — {trip.city}</h2>
                        {userCoords && <p className={styles.mapNote}><FaLocationArrow style={{ color: "var(--primary)" }} /> Showing your location + destination</p>}
                        {coords ? (
                            <MapContainer key={`${coords[0]}-${coords[1]}`} center={coords} zoom={9} style={{ height: "340px", width: "100%", borderRadius: "12px" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                                <Marker position={coords}>
                                    <Popup><strong>{trip.city}</strong><br />{trip.country}</Popup>
                                </Marker>
                                {userCoords && (
                                    <>
                                        <Marker position={userCoords} icon={userIcon}>
                                            <Popup>📍 Your Location</Popup>
                                        </Marker>
                                        <Polyline positions={[userCoords, coords]} color="#2563EB" dashArray="8,8" weight={3} />
                                    </>
                                )}
                            </MapContainer>
                        ) : (
                            <div style={{ height: 340, background: "var(--border)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--subText)" }}>Loading map...</div>
                        )}
                    </div>

                    {/* Budget & Expenses */}
                    <div className={styles.card}>
                        <h2>💰 Budget & Expense Tracker</h2>

                        {/* Budget Warning Banner */}
                        {percentSpent >= 100 && <div className={`${styles.budgetAlert} ${styles.alertDanger}`}>🚨 Budget exceeded! You've spent ${(summary.totalExpense - summary.totalBudget).toLocaleString()} over budget.</div>}
                        {percentSpent >= 80 && percentSpent < 100 && <div className={`${styles.budgetAlert} ${styles.alertWarning}`}>⚠️ 80%+ of budget used. Remaining: ${summary.remainingBudget.toLocaleString()}</div>}
                        {percentSpent >= 50 && percentSpent < 80 && <div className={`${styles.budgetAlert} ${styles.alertInfo}`}>📊 50%+ of budget used. Keep tracking your expenses.</div>}

                        {/* Budget bar */}
                        <div className={styles.budgetTracker}>
                            <div className={styles.budgetRow}>
                                <span>Budget Utilization</span>
                                <span style={{ color: budgetColor, fontWeight: 700 }}>{Math.round(percentSpent)}%</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${percentSpent}%`, background: budgetColor }} />
                            </div>
                            <div className={styles.budgetStats}>
                                <div>Budget <span>${summary.totalBudget.toLocaleString()}</span></div>
                                <div>Spent <span>${summary.totalExpense.toLocaleString()}</span></div>
                                <div>Remaining <span style={{ color: summary.remainingBudget < 0 ? "var(--danger)" : "var(--success)" }}>${summary.remainingBudget.toLocaleString()}</span></div>
                            </div>
                        </div>

                        {/* Pie chart */}
                        {chartLabels.length > 0 && (
                            <div className={styles.chartWrapper}>
                                <Doughnut data={chartData} options={{ plugins: { legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } } }, cutout: "65%", maintainAspectRatio: false }} />
                            </div>
                        )}

                        {/* Add Expense */}
                        {isOwner && (
                            <form onSubmit={handleSubmitExpense(handleAddExpense)} className={`${styles.formGrid} ${styles.expenseForm}`}>
                                <div className={styles.inputGroup}>
                                    <label>Category</label>
                                    <select {...registerExpense("category", { required: true })}>
                                        {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className={styles.inputGroup}><label>Amount ($)</label><input type="number" step="any" placeholder="150" {...registerExpense("amount", { required: true })} /></div>
                                <div className={styles.inputGroup}><label>Date</label><input type="date" defaultValue={new Date().toISOString().split("T")[0]} {...registerExpense("date")} /></div>
                                <div className={styles.inputGroup}><label>Note</label><input type="text" placeholder="e.g. Hotel Taj" {...registerExpense("description")} /></div>
                                <div className={styles.fullWidth} style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button type="submit" className={styles.saveBtn} disabled={addingExp}>{addingExp ? "Adding..." : "+ Log Expense"}</button>
                                </div>
                            </form>
                        )}

                        {/* Expense Filter */}
                        <div className={styles.expenseHeader}>
                            <h3>Expense Log ({filteredExpenses.length})</h3>
                            <div className={styles.searchBox}>
                                <FaSearch className={styles.searchIcon} />
                                <input type="text" placeholder="Filter by category or note..." value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)} />
                            </div>
                        </div>

                        <div className={styles.expenseList}>
                            {filteredExpenses.length > 0 ? filteredExpenses.map((exp) => (
                                <div className={styles.expenseItem} key={exp._id}>
                                    <div className={styles.expenseCatIcon}>{CATEGORY_ICON[exp.category] || "📦"}</div>
                                    <div className={styles.expenseDetails}>
                                        <h4>{exp.category}</h4>
                                        <p>{exp.description && `${exp.description} · `}{new Date(exp.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={styles.expenseRight}>
                                        <span className={styles.expenseAmount}>${exp.amount.toLocaleString()}</span>
                                        {isOwner && (
                                            <div className={styles.expenseBtns}>
                                                <button onClick={() => { setEditingExpense(exp); resetEditExp({ category: exp.category, amount: exp.amount, description: exp.description, date: exp.date?.split("T")[0] }); }} className={styles.expEditBtn}><FaEdit /></button>
                                                <button onClick={() => handleRemoveExpense(exp._id)} className={styles.expDelBtn}><FaTrash /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: "var(--subText)", textAlign: "center", padding: "20px 0" }}>No expenses recorded yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Itinerary Planner */}
                    <div className={styles.card}>
                        <h2>📅 Itinerary Planner</h2>
                        <p style={{ color: "var(--subText)", fontSize: 13, marginBottom: 20 }}>Plan your activities day by day for all {tripDays} days.</p>

                        {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                            <div key={day} className={styles.dayBlock}>
                                <div className={styles.dayHeader}>
                                    <strong>Day {day}</strong>
                                    <span style={{ color: "var(--subText)", fontSize: 12 }}>
                                        {new Date(new Date(trip.startDate).getTime() + (day - 1) * 86400000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                    </span>
                                </div>
                                {TIME_OF_DAY.map((time) => {
                                    const items = (itineraryGrouped[day] || {})[time] || [];
                                    return (
                                        <div key={time} className={styles.timeSlot}>
                                            <div className={styles.timeLabel}>{TIME_ICONS[time]} {time}</div>
                                            <div className={styles.timeItems}>
                                                {items.map((item) => (
                                                    <div key={item._id} className={styles.itinItem}>
                                                        <div className={styles.itinContent}>
                                                            <strong>{item.title}</strong>
                                                            {item.location && <span>📍 {item.location}</span>}
                                                            {item.duration && <span>⏱️ {item.duration}</span>}
                                                            {item.description && <p>{item.description}</p>}
                                                        </div>
                                                        {isOwner && (
                                                            <div className={styles.itinActions}>
                                                                <button onClick={() => { setEditingItem(item); resetEditItem({ title: item.title, description: item.description, location: item.location, duration: item.duration }); }} className={styles.itinBtn}><FaEdit /></button>
                                                                <button onClick={() => handleDeleteItem(item._id)} className={`${styles.itinBtn} ${styles.itinDel}`}><FaTrash /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {isOwner && showAddItem?.day === day && showAddItem?.timeOfDay === time ? (
                                                    <form onSubmit={handleSubmitItem(handleAddItem)} className={styles.addItemForm}>
                                                        <input type="text" placeholder="Activity title *" {...registerItem("title", { required: true })} />
                                                        <input type="text" placeholder="Location" {...registerItem("location")} />
                                                        <input type="text" placeholder="Duration (e.g. 2 hours)" {...registerItem("duration")} />
                                                        <input type="text" placeholder="Notes" {...registerItem("description")} />
                                                        <div className={styles.addItemActions}>
                                                            <button type="submit" className={styles.saveBtn}>Add</button>
                                                            <button type="button" className={styles.cancelItemBtn} onClick={() => setShowAddItem(null)}>Cancel</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    isOwner && (
                                                        <button className={styles.addItemTrigger} onClick={() => setShowAddItem({ day, timeOfDay: time })}>
                                                            <FaPlus /> Add activity
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Reviews */}
                    {trip.isPublic && (
                        <div className={styles.card}>
                            <h2>⭐ Reviews & Ratings</h2>
                            <form onSubmit={handleSubmitReview(handleAddReview)} className={styles.reviewForm}>
                                <label>Leave a Review</label>
                                <div className={styles.ratingSelect}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar key={star} className={`${styles.star} ${star <= newRating ? styles.starSelected : ""}`} onClick={() => setNewRating(star)} />
                                    ))}
                                </div>
                                <textarea placeholder="Write your review..." className={styles.reviewTextarea} {...registerReview("comment", { required: true })} />
                                <button type="submit" className={styles.saveBtn} style={{ alignSelf: "flex-end" }}>Submit Review</button>
                            </form>
                            <div style={{ marginTop: 20 }}>
                                {reviews.length > 0 ? reviews.map((rev) => (
                                    <div className={styles.reviewItem} key={rev._id}>
                                        <div className={styles.reviewHeader}>
                                            <div className={styles.reviewerInfo}>
                                                <img src={rev.user?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" className={styles.reviewerAvatar} />
                                                <span className={styles.reviewerName}>{rev.user?.fullName}</span>
                                            </div>
                                            <div className={styles.reviewRating}><FaStar /> {rev.rating}/5</div>
                                        </div>
                                        <p className={styles.reviewComment}>{rev.comment}</p>
                                    </div>
                                )) : <p style={{ color: "var(--subText)", textAlign: "center", padding: "20px 0" }}>No reviews yet. Be the first!</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    {/* Weather */}
                    <div className={styles.card}>
                        <h2><FaCloudSun /> Weather — {trip.city}</h2>
                        {weatherLoading ? <p style={{ color: "var(--subText)", textAlign: "center", padding: 20 }}>Loading weather...</p>
                            : weather ? (
                                <div>
                                    <div className={styles.weatherContainer}>
                                        <div className={styles.weatherMain}><span className={styles.weatherTemp}>{weather.temperature}°C</span><span style={{ color: "var(--subText)", fontSize: 14 }}>{weather.description}</span></div>
                                        <div className={styles.weatherMetrics}>
                                            <div>💧 Humidity<br /><b>{weather.humidity}%</b></div>
                                            <div>💨 Wind<br /><b>{weather.wind} km/h</b></div>
                                        </div>
                                    </div>
                                    <div className={styles.forecastGrid}>
                                        {weather.forecast?.map((fc, idx) => (
                                            <div className={styles.forecastDay} key={idx}>
                                                <h5>{fc.day}</h5>
                                                <p>{fc.temp}°</p>
                                                <span>{fc.condition}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : <p style={{ color: "var(--subText)", textAlign: "center" }}>⚠️ Weather data unavailable for {trip.city}.</p>
                        }
                    </div>
                </div>
            </div>

            {/* Edit Expense Modal */}
            {editingExpense && (
                <div className={styles.modalOverlay} onClick={() => setEditingExpense(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h3>✏️ Edit Expense</h3><button className={styles.modalClose} onClick={() => setEditingExpense(null)}><FaTimes /></button></div>
                        <form onSubmit={handleSubmitEditExp(handleEditExpenseSubmit)} className={styles.formGrid}>
                            <div className={styles.inputGroup}><label>Category</label>
                                <select {...registerEditExp("category")}>{EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
                            </div>
                            <div className={styles.inputGroup}><label>Amount ($)</label><input type="number" step="any" {...registerEditExp("amount")} /></div>
                            <div className={styles.inputGroup}><label>Date</label><input type="date" {...registerEditExp("date")} /></div>
                            <div className={styles.inputGroup}><label>Note</label><input type="text" {...registerEditExp("description")} /></div>
                            <div className={styles.fullWidth}><button type="submit" className={styles.submitBtn}>Update Expense</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Itinerary Item Modal */}
            {editingItem && (
                <div className={styles.modalOverlay} onClick={() => setEditingItem(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h3>✏️ Edit Activity</h3><button className={styles.modalClose} onClick={() => setEditingItem(null)}><FaTimes /></button></div>
                        <form onSubmit={handleSubmitEditItem(handleUpdateItem)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div className={styles.inputGroup}><label>Title *</label><input type="text" {...registerEditItem("title", { required: true })} /></div>
                            <div className={styles.inputGroup}><label>Location</label><input type="text" {...registerEditItem("location")} /></div>
                            <div className={styles.inputGroup}><label>Duration</label><input type="text" {...registerEditItem("duration")} /></div>
                            <div className={styles.inputGroup}><label>Notes</label><input type="text" {...registerEditItem("description")} /></div>
                            <button type="submit" className={styles.submitBtn}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Modal (Cancel / Delete) */}
            {confirmAction && (
                <div className={styles.modalOverlay} onClick={() => setConfirmAction(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>{confirmAction.type === "delete" ? "🗑️" : "🚫"}</div>
                        <h3 style={{ textAlign: "center", marginBottom: 8 }}>
                            {confirmAction.type === "delete" ? "Delete this trip?" : "Cancel this trip?"}
                        </h3>
                        <p style={{ color: "var(--subText)", textAlign: "center", marginBottom: 24 }}>
                            {confirmAction.type === "delete"
                                ? "This will permanently delete the trip and all its expenses. This cannot be undone."
                                : "The trip will be marked as Cancelled. You can restore it later."}
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalCancel} onClick={() => setConfirmAction(null)}>
                                {confirmAction.type === "delete" ? "Keep Trip" : "Keep It"}
                            </button>
                            <button
                                className={styles.modalConfirm}
                                onClick={confirmAction.type === "delete" ? handleDelete : handleCancelTrip}
                            >
                                {confirmAction.type === "delete" ? "Yes, Delete" : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDetails;
