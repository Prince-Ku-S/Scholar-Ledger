import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import VerifyManual from "./pages/VerifyManual";
import PublicVerify from "./pages/PublicVerify";
import PublicProfile from "./pages/PublicProfile";
import QrScanner from "./pages/QrScanner";
import "./App.css";

// Routes:
//   /                         — connected-wallet dashboard (admin + student)
//   /verify                   — manual verification form (no wallet needed)
//   /verify/:address/:index   — public auto-verify (no wallet needed)
//   /profile/:address         — public student profile (no wallet needed)
//   /scan                     — camera-based QR scanner
function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <div className="app-shell">
          <Navbar />
          <div style={{ paddingTop: 8 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/verify" element={<VerifyManual />} />
              <Route path="/verify/:address/:index" element={<PublicVerify />} />
              <Route path="/profile/:address" element={<PublicProfile />} />
              <Route
                path="/profile/student/:studentId"
                element={<PublicProfile />}
              />
              <Route path="/scan" element={<QrScanner />} />
              <Route
                path="*"
                element={
                  <div className="app-card app-empty-state">
                    <p style={{ fontSize: 32, margin: "0 0 12px" }}>🔍</p>
                    <h2>404 — Page Not Found</h2>
                    <p style={{ color: "var(--clr-text-muted)" }}>
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
