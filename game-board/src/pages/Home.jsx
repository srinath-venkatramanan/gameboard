// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/Card";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  const games = [
    { name: "Seven Cards", path: "/sevencards", icon: "7️⃣" },
    { name: "Judgement", path: "/judgement", icon: "🎯" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-10">Welcome to Weekend Scoreboard 🎉</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {games.map((game, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(game.path)}
            className="cursor-pointer"
          >
            <Card className="flex flex-col items-center justify-center p-10 rounded-2xl shadow-lg hover:shadow-xl bg-white">
              <div className="text-6xl mb-4">{game.icon}</div>
              <h2 className="text-xl font-semibold">{game.name}</h2>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

