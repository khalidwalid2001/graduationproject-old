// src/App.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import SearchPage from "./pages/SearchPage";
import DetailsPage from "./pages/DetailsPage";
import LoanPage from "./pages/LoanPage";
import "./App.css";

// مكوّن التطبيق الأساسي (جوا الـ Router اللي في index.tsx)
export default function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <AppHeader />

      <main className="app-main">
        {/* هذا الـ div هو الي عليه الأنيميشن */}
        <div className="route-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<SearchPage />} />
            <Route path="/details" element={<DetailsPage />} />
            <Route path="/loan" element={<LoanPage />} />
          </Routes>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
