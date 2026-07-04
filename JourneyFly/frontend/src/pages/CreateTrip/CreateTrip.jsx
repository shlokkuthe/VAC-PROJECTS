import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlane, FaImage, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaDollarSign } from "react-icons/fa";

import { createTrip } from "../../services/tripService";
import styles from "./CreateTrip.module.css";

const TRIP_TYPES = ["Adventure", "Business", "Leisure", "Honeymoon", "Family", "Solo", "Other"];
const TRANSPORTATIONS = [
    { value: "Flight", label: "✈️ Flight" },
    { value: "Train", label: "🚄 Train" },
    { value: "Bus", label: "🚌 Bus" },
    { value: "Car", label: "🚗 Car" },
    { value: "Other", label: "🎒 Other" },
];

const CreateTrip = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            tripName: "",
            destination: "",
            country: "",
            city: "",
            tripType: "Leisure",
            budget: "",
            startDate: "",
            endDate: "",
            transportation: "Flight",
            description: "",
            travelers: 1,
            status: "Upcoming",
            isPublic: false,
        },
    });

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, val]) => formData.append(key, val));
        const file = fileInputRef.current?.files?.[0];
        if (file) formData.append("tripImage", file);

        try {
            const res = await createTrip(formData);
            toast.success("Adventure planned successfully! ✈️");
            navigate(`/trips/${res.trip._id}`);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderIcon}><FaPlane /></div>
                <div>
                    <h1>Plan New Adventure</h1>
                    <p>Register a new trip log to start tracking your itinerary and expenses.</p>
                </div>
            </div>

            <div className={styles.card}>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>

                    {/* Trip Name */}
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Trip Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Goa Summer 2026"
                            {...register("tripName", { required: "Trip name is required" })}
                        />
                        {errors.tripName && <span className={styles.error}>{errors.tripName.message}</span>}
                    </div>

                    {/* Destination */}
                    <div className={styles.inputGroup}>
                        <label><FaMapMarkerAlt /> Destination *</label>
                        <input
                            type="text"
                            placeholder="e.g. Goa"
                            {...register("destination", { required: "Destination is required" })}
                        />
                        {errors.destination && <span className={styles.error}>{errors.destination.message}</span>}
                    </div>

                    {/* Trip Type */}
                    <div className={styles.inputGroup}>
                        <label>Trip Type</label>
                        <select {...register("tripType")}>
                            {TRIP_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* City */}
                    <div className={styles.inputGroup}>
                        <label>City *</label>
                        <input
                            type="text"
                            placeholder="e.g. Panaji"
                            {...register("city", { required: "City is required" })}
                        />
                        {errors.city && <span className={styles.error}>{errors.city.message}</span>}
                    </div>

                    {/* Country */}
                    <div className={styles.inputGroup}>
                        <label>Country *</label>
                        <input
                            type="text"
                            placeholder="e.g. India"
                            {...register("country", { required: "Country is required" })}
                        />
                        {errors.country && <span className={styles.error}>{errors.country.message}</span>}
                    </div>

                    {/* Budget */}
                    <div className={styles.inputGroup}>
                        <label><FaDollarSign /> Total Budget ($) *</label>
                        <input
                            type="number"
                            placeholder="5000"
                            {...register("budget", {
                                required: "Budget is required",
                                min: { value: 0, message: "Budget must be positive" },
                            })}
                        />
                        {errors.budget && <span className={styles.error}>{errors.budget.message}</span>}
                    </div>

                    {/* Start Date */}
                    <div className={styles.inputGroup}>
                        <label><FaCalendarAlt /> Start Date *</label>
                        <input
                            type="date"
                            {...register("startDate", { required: "Start date is required" })}
                        />
                        {errors.startDate && <span className={styles.error}>{errors.startDate.message}</span>}
                    </div>

                    {/* End Date */}
                    <div className={styles.inputGroup}>
                        <label><FaCalendarAlt /> End Date *</label>
                        <input
                            type="date"
                            {...register("endDate", { required: "End date is required" })}
                        />
                        {errors.endDate && <span className={styles.error}>{errors.endDate.message}</span>}
                    </div>

                    {/* Transportation */}
                    <div className={styles.inputGroup}>
                        <label>Transportation</label>
                        <select {...register("transportation")}>
                            {TRANSPORTATIONS.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Travelers */}
                    <div className={styles.inputGroup}>
                        <label><FaUsers /> Number of Travelers *</label>
                        <input
                            type="number"
                            min="1"
                            {...register("travelers", { required: "Travelers count is required" })}
                        />
                        {errors.travelers && <span className={styles.error}>{errors.travelers.message}</span>}
                    </div>

                    {/* Status */}
                    <div className={styles.inputGroup}>
                        <label>Initial Status</label>
                        <select {...register("status")}>
                            <option value="Draft">📝 Draft</option>
                            <option value="Upcoming">🗓️ Upcoming</option>
                        </select>
                    </div>

                    {/* Cover Image */}
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label><FaImage /> Cover Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <div className={styles.fileRow}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={styles.fileBtn}
                            >
                                Choose File
                            </button>
                            <span className={styles.fileName}>{fileName || "No file chosen"}</span>
                        </div>
                        {previewUrl && (
                            <img src={previewUrl} alt="Preview" className={styles.imagePreview} />
                        )}
                    </div>

                    {/* Description */}
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Trip Description / Notes</label>
                        <textarea
                            rows={4}
                            placeholder="Describe your trip details, flight tickets, hotel links, or personal notes..."
                            {...register("description")}
                        />
                    </div>

                    {/* Public toggle */}
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" {...register("isPublic")} />
                            Make this trip Public (allows others to view, wishlist, and review)
                        </label>
                    </div>

                    <div className={styles.fullWidth}>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? "Creating Trip..." : "✈️ Create Trip Log"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTrip;
