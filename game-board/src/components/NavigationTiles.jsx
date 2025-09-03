// src/components/NavigationTiles.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NavigationTiles({ small = false }) {
  const navigate = useNavigate();
  const sizeClass = small ? "w-20 h-20 p-2 text-sm" : "w-32 h-32 p-4 text-lg";

  const tiles = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Seven Cards", path: "/sevencards", icon: "7️⃣" },
    { name: "Judgement", path: "/judgement", icon: "🃏" },
  ];

  return (
    <div className={`flex justify-between mb-4`}>
      {tiles.map((tile) => (
        <motion.div
          key={tile.name}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(tile.path)}
          className={`cursor-pointer flex flex-col items-center justify-center rounded-2xl shadow-md bg-white hover:shadow-xl ${sizeClass}`}
        >
          <div className="text-2xl">{tile.icon}</div>
          <div className="font-semibold">{tile.name}</div>
        </motion.div>
      ))}
    </div>
  );
}
