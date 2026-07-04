// ==============================
// AI Travel Chatbot Controller
// Uses Google Gemini API (falls back to smart pre-written responses if no key)
// ==============================

const TRAVEL_CONTEXT = `You are JourneyBot, an expert AI Travel Assistant for JourneyFly — a premium travel planning platform. 
You help users with travel planning including destination suggestions, hotel recommendations, restaurant tips, activity ideas, 
budget planning, packing checklists, weather advice, and general travel tips.
Keep responses concise, friendly, and helpful. Use emojis occasionally to make it engaging.
Format lists with bullet points when appropriate.`;

const FALLBACK_RESPONSES = [
    "I'd suggest exploring the local markets and street food scene — it's the best way to experience a destination authentically! 🍜",
    "For budget travel, look for hostels, local guesthouses, and use public transport. Cooking some of your own meals also saves a lot! 💰",
    "Always pack: passport, travel adapter, first-aid kit, portable charger, and a light rain jacket. Better prepared than sorry! 🎒",
    "Check the weather forecast for your destination 7-10 days before departure and pack layers if temperatures vary. 🌤️",
    "I recommend booking hotels 2-3 months in advance for peak season destinations to get the best rates! 🏨",
    "For flight deals, try booking on Tuesdays or Wednesdays, and consider flying mid-week for cheaper fares. ✈️",
    "Local SIM cards or an international eSIM are usually cheaper than roaming charges for staying connected abroad. 📱",
    "Always have travel insurance! It covers medical emergencies, trip cancellations, and lost luggage. 🛡️",
];

const askChatbot = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
            try {
                let contents = [];
                
                if (history && history.length > 0) {
                    contents = history.map((h, i) => {
                        let text = h.text;
                        if (i === 0 && h.role === "user") {
                            text = `${TRAVEL_CONTEXT}\n\nUser: ${text}`;
                        }
                        return {
                            role: h.role === "bot" ? "model" : "user",
                            parts: [{ text }]
                        };
                    });
                    contents.push({
                        role: "user",
                        parts: [{ text: message }]
                    });
                } else {
                    contents = [
                        {
                            role: "user",
                            parts: [{ text: `${TRAVEL_CONTEXT}\n\nUser: ${message}` }]
                        }
                    ];
                }

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents,
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 512,
                            },
                        }),
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (reply) {
                        return res.json({ success: true, reply: reply.trim(), source: "gemini" });
                    }
                }
            } catch (apiErr) {
                // Fall through to fallback
            }
        }

        // Smart fallback: keyword matching
        const lowerMsg = message.toLowerCase();
        let reply = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];

        if (lowerMsg.includes("hotel") || lowerMsg.includes("stay") || lowerMsg.includes("accommodation")) {
            reply = "🏨 For hotels, I recommend checking Booking.com and Agoda for the best deals. Look for properties with free cancellation in case plans change. For budget stays, Hostelworld has great options. Always read recent reviews!";
        } else if (lowerMsg.includes("food") || lowerMsg.includes("restaurant") || lowerMsg.includes("eat")) {
            reply = "🍽️ The best food experiences are often off the tourist trail! Try Google Maps reviews filtered by locals, visit morning markets, and ask hotel staff for hidden gems. Food tours are also a great way to explore local cuisine!";
        } else if (lowerMsg.includes("budget") || lowerMsg.includes("cheap") || lowerMsg.includes("cost") || lowerMsg.includes("money")) {
            reply = "💰 Smart budgeting tips: 1) Book flights 6-8 weeks early, 2) Stay in neighborhoods slightly away from tourist centers, 3) Eat where locals eat, 4) Use public transport, 5) Visit free attractions like parks, markets, and museums on free days. Aim to track daily spending in JourneyFly's expense tracker!";
        } else if (lowerMsg.includes("pack") || lowerMsg.includes("luggage") || lowerMsg.includes("bag")) {
            reply = "🎒 Essential packing list:\n• Documents: Passport, visa, insurance, copies\n• Electronics: Adapter, power bank, earphones\n• Clothes: Layers, comfortable walking shoes, rain jacket\n• Health: First aid kit, prescribed medicines, hand sanitizer\n• Misc: Reusable water bottle, small padlock, local currency\n\nPro tip: Roll clothes instead of folding to save space!";
        } else if (lowerMsg.includes("weather") || lowerMsg.includes("climate") || lowerMsg.includes("rain") || lowerMsg.includes("temperature")) {
            reply = "🌤️ Check your trip destination's weather via the Weather widget on your trip details page! For general advice: Southeast Asia is wet Jun-Oct, Europe is best May-Sep, South America's summer is Dec-Feb. Always pack a light layer regardless of season!";
        } else if (lowerMsg.includes("flight") || lowerMsg.includes("airport") || lowerMsg.includes("fly")) {
            reply = "✈️ Flight booking tips:\n• Book 6-8 weeks ahead for best prices\n• Fly on Tuesdays/Wednesdays for cheaper fares\n• Use Google Flights, Skyscanner, or Kayak to compare\n• Consider nearby airports for cheaper options\n• Set price alerts for your destination\n• Always check baggage policies before booking!";
        } else if (lowerMsg.includes("visit") || lowerMsg.includes("place") || lowerMsg.includes("attraction") || lowerMsg.includes("see") || lowerMsg.includes("suggest")) {
            reply = "🗺️ For discovering amazing places:\n• Check TripAdvisor and Google Maps 'Explore' for top attractions\n• Look for UNESCO World Heritage sites nearby\n• Ask locals at your hotel for hidden gems\n• Visit during off-peak hours (early morning) for popular sites\n• Mix famous landmarks with neighborhood exploration\n\nDon't forget to add your daily activities to your JourneyFly Itinerary!";
        } else if (lowerMsg.includes("tips") || lowerMsg.includes("advice") || lowerMsg.includes("help")) {
            reply = "🌟 Top travel tips:\n1. Always have offline maps downloaded (Google Maps)\n2. Keep digital & physical copies of all documents\n3. Notify your bank before traveling abroad\n4. Learn basic phrases in local language\n5. Get travel insurance — always!\n6. Carry small amounts of local cash\n7. Keep emergency contacts saved locally\n8. Use JourneyFly's budget tracker to stay on track! 😊";
        }

        res.json({ success: true, reply, source: "fallback" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { askChatbot };
