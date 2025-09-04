// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import SevenCards from "./pages/SevenCards.jsx";
import SevenCardsView from "./pages/SevenCardsView.jsx";
import Judgement from "./pages/Judgement.jsx";
import JudgementView from "./pages/JudgementView.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Leaderboard */}
      <Route path="/Leaderboard" element={<Leaderboard />} />

      {/* Seven Cards */}
      <Route path="/sevencards" element={<SevenCards />} />
      <Route path="/sevencards/view/:id" element={<SevenCardsView />} />

      {/* Judgement */}
      <Route path="/judgement" element={<Judgement />} />
      <Route path="/judgement/view/:id" element={<JudgementView />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
