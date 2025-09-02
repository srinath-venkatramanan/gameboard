import { Routes, Route, Link } from "react-router-dom";
import SevenCards from "./pages/SevenCards";

function Home() {
  return <h2 className="p-4">Welcome Home</h2>;
}

function Dashboard() {
  return <h2 className="p-4">Dashboard</h2>;
}

function Judgement() {
  return <h2 className="p-4">Judgement</h2>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex gap-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/seven-cards" className="hover:underline">Seven Cards</Link>
        <Link to="/judgement" className="hover:underline">Judgement</Link>
      </nav>

      {/* Page Content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seven-cards" element={<SevenCards />} />
        <Route path="/judgement" element={<Judgement />} />
      </Routes>
    </div>
  );
}
