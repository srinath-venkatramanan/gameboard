// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/Card";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  const games = [
    { name: "Seven Cards", path: "/sevencards", icon: "7️⃣" },
    { name: "Judgement", path: "/judgement", icon: "🎯" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏆" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 md:px-6 overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-10 text-center">
        Welcome to Weekend Scoreboard 🎉
      </h1>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl">
        {games.map((game, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(game.path)}
            className="flex-1 min-w-[180px] max-w-[220px] cursor-pointer"
          >
            <Card className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg hover:shadow-xl bg-white">
              <div className="text-6xl mb-4">{game.icon}</div>
              <h2 className="text-xl font-semibold text-center">{game.name}</h2>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
