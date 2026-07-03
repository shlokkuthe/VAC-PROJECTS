import "./CategoryButtons.css";

const CATEGORIES = [
  { name: "All",       icon: "🌐" },
  { name: "Hollywood", icon: "🎬" },
  { name: "Bollywood", icon: "🇮🇳" },
  { name: "Tollywood", icon: "🔥" },
  { name: "Kollywood", icon: "🎥" },
  { name: "Mollywood", icon: "🍿" },
  { name: "Series",    icon: "📺" },
];

export default function CategoryButtons({ active, onChange }) {
  return (
    <div className="catWrap">
      {CATEGORIES.map((c) => (
        <button
          key={c.name}
          className={`catBtn ${active === c.name ? "catBtnActive" : ""}`}
          onClick={() => onChange(c.name)}
        >
          <span>{c.icon}</span> {c.name}
        </button>
      ))}
    </div>
  );
}