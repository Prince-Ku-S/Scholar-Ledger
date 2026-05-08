import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `nav-link ${location.pathname === path ? "nav-link-active" : ""}`;

  return (
    <nav className="navbar">
      <h2 className="brand">Scholar Ledger</h2>
      <Link to="/" className={linkClass("/")}>
        Home
      </Link>
      <Link to="/verify" className={linkClass("/verify")}>
        Verify
      </Link>
      <Link to="/scan" className={linkClass("/scan")}>
        Scan QR
      </Link>
    </nav>
  );
}

export default Navbar;
