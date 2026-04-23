"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone?: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // ── Load user from localStorage on mount + listen for auth changes ──
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem("ad_user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    syncUser(); // initial load

    // Listen for same-tab auth changes (login/logout)
    window.addEventListener("ad_auth_change", syncUser);
    // Listen for cross-tab changes
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("ad_auth_change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // ── Scroll shadow ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close desktop dropdown on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Sign out ──
  function handleLogout() {
    localStorage.removeItem("ad_user"); // clear session
    setUser(null); // update React state immediately
    setDropdownOpen(false);
    setMenuOpen(false);
    window.dispatchEvent(new Event("ad_auth_change")); // notify other components
    router.push("/");
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/cars", label: "Browse Cars" },
    { href: "/predict", label: "Price Predictor" },
    { href: "/booking", label: "Book a Drive" },
    { href: "/news", label: "News" },
  ];

  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? "U";

  // ── Shared dropdown content ──
  function DropdownContent() {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "1rem",
          minWidth: "220px",
          zIndex: 999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Avatar + name header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--blue), #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "white",
              flexShrink: 0,
            }}
          >
            {avatarLetter}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--text-white)",
                fontSize: "0.95rem",
              }}
            >
              {user?.name}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-light)",
                marginTop: "2px",
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>

        <div
          style={{
            height: "1px",
            background: "var(--border)",
            margin: "0.75rem 0",
          }}
        />

        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-light)",
            marginBottom: "0.75rem",
          }}
        >
          {user?.phone && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.4rem",
              }}
            >
              <span>Phone</span>
              <span style={{ color: "var(--text-white)" }}>{user.phone}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Member</span>
            <span style={{ color: "#10b981" }}>✓ Active</span>
          </div>
        </div>

        <div
          style={{
            height: "1px",
            background: "var(--border)",
            margin: "0.75rem 0",
          }}
        />

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            background: "rgba(239,68,68,0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "0.5rem 0.75rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // ── Desktop user avatar + dropdown ──
  function UserDropdown() {
    return (
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--blue), #6366f1)",
            border: "2px solid rgba(255,255,255,0.15)",
            color: "white",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={user?.name}
        >
          {avatarLetter}
        </button>

        {dropdownOpen && (
          <div style={{ position: "absolute", right: 0, top: "48px" }}>
            <DropdownContent />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">🚗</div>
            <span className="nav-logo-text">
              Auto<span>Drive</span>
            </span>
          </Link>

          <div className="nav-links">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname === l.href ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <Link href="/booking" className="nav-btn-outline">
              Test Drive
            </Link>
            {user ? (
              <UserDropdown />
            ) : (
              <Link href="/login" className="nav-btn-outline">
                Login
              </Link>
            )}
            <Link href="/cars" className="nav-btn-primary">
              Browse Cars
            </Link>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`} id="mobileMenu">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </Link>
        ))}

        <div
          className="nav-actions"
          style={{ flexDirection: "column", gap: ".5rem", paddingTop: "1rem" }}
        >
          <Link
            href="/booking"
            className="btn btn-outline btn-sm"
            style={{ justifyContent: "center" }}
            onClick={() => setMenuOpen(false)}
          >
            Test Drive
          </Link>

          {user ? (
            <div ref={mobileDropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, var(--blue), #6366f1)",
                  border: "none",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  {avatarLetter}
                </span>
                {user.name}
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "48px",
                    zIndex: 999,
                  }}
                >
                  <DropdownContent />
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: "center" }}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}

          <Link
            href="/cars"
            className="btn btn-primary btn-sm"
            style={{ justifyContent: "center" }}
            onClick={() => setMenuOpen(false)}
          >
            Browse Cars
          </Link>
        </div>
      </div>
    </>
  );
}
