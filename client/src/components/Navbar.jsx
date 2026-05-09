import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `nav-link ${location.pathname === path ? "nav-link-active" : ""}`;

  return (
    <nav className="navbar">
      <h2 className="brand">
        🎓 Scholar<span>Ledger</span>
      </h2>
      <Link to="/" className={linkClass("/")} id="nav-home">
        Home
      </Link>
      <Link to="/verify" className={linkClass("/verify")} id="nav-verify">
        Verify Credential
      </Link>
      <Link to="/scan" className={linkClass("/scan")} id="nav-scan">
        Scan QR
      </Link>
    </nav>
  );
}

export default Navbar;
