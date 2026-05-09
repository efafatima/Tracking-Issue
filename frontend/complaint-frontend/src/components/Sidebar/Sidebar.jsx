import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext, Link, useLocation } from "react-router-dom";

export default function Sidebar({ sidebarLinks = [] }) {

  const username  = localStorage.getItem("username") || "User";
  const full_name = localStorage.getItem("full_name") || username;
  const email     = localStorage.getItem("email") || "";
  const role      = localStorage.getItem("role") || "";
  const initial   = full_name[0]?.toUpperCase() || "U";

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState(location.pathname);

   const MotionLink = motion.create(Link);

  const NAV_ITEMS = sidebarLinks;

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 12px" }}>

      {/* Logo row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: "24px 8px 20px", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              width: 40, height: 40, borderRadius: "50%", overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(61,114,224,0.2), 0 0 0 3px rgba(91,154,245,0.15)",
              border: "2px solid rgba(255,255,255,0.9)",
            }}
          >
            <img src="/bzu-logo.png" alt="BZU" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </motion.div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>BZU Departmental System</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Complaint Portal</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setCollapsed(c => !c)}
          whileHover={{ scale: 1.12, background: "rgba(91,154,245,0.14)" }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            border: "1.5px solid rgba(91,154,245,0.2)",
            background: "rgba(91,154,245,0.07)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#5b9af5", fontSize: 14, fontWeight: 900,
            transition: "background 0.2s",
          }}
        >
          <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>›</motion.span>
        </motion.button>
      </div>

      {/* Top divider */}
      <div style={{
        height: 1, margin: "0 4px 16px",
        background: "linear-gradient(90deg, transparent, rgba(91,154,245,0.18), transparent)",
      }} />

      {/* Section label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: 9.5, fontWeight: 800, color: "#cbd5e1",
              letterSpacing: "0.13em", textTransform: "uppercase",
              padding: "0 10px", marginBottom: 8,
            }}
          >
            Main Menu
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV_ITEMS.map((item) => {

          const isActive = location.pathname === item.path;
          return (


            <motion.div
              key={item.path}
            >
              

              <MotionLink
                to={item.path}
                onClick={() => { setActive(item.path); setMobileOpen(false); }}
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  padding: collapsed ? "11px 0" : "11px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 13,
                  cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(91,154,245,0.14), rgba(61,114,224,0.07))"
                    : "transparent",
                  color: isActive ? "#3d72e0" : "#64748b",
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 13.5,
                  position: "relative",
                  overflow: "hidden",
                  transition: "background 0.2s, color 0.2s",
                }}
              >



              {/* Active left bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  style={{
                    position: "absolute", left: 0, top: "18%",
                    width: 3, height: "64%", borderRadius: "0 3px 3px 0",
                    background: "linear-gradient(180deg, #5b9af5, #3d72e0)",
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}

              {/* Hover shimmer */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                whileHover={{ x: "200%", opacity: 0.4 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: "40%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(91,154,245,0.15), transparent)",
                  pointerEvents: "none",
                }}
              />

              
              {item.icon && <span style={{ flexShrink: 0, zIndex: 1 }}>{item.icon}</span>}

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden", whiteSpace: "nowrap", zIndex: 1 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Collapsed active dot */}
              {isActive && collapsed && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{
                    position: "absolute", top: 7, right: 7,
                    width: 6, height: 6, borderRadius: "50%",
                    background: "linear-gradient(135deg, #5b9af5, #3d72e0)",
                  }}
                />
              )}
            </MotionLink>

            </motion.div>
      );
        })}
    </nav>

      {/* Spacer */ }
  <div style={{ flex: 1 }} />

  {/* Bottom divider */ }
  <div style={{
    height: 1, margin: "10px 4px 12px",
    background: "linear-gradient(90deg, transparent, rgba(91,154,245,0.18), transparent)",
  }} />

  {/* Logout */ }
  <motion.a
    href="/login"
    onClick={() => { localStorage.clear(); setActive("logout"); }}
    whileHover={{ x: collapsed ? 0 : 4, background: "rgba(239,68,68,0.07)" }}
    whileTap={{ scale: 0.97 }}
    style={{
      display: "flex", alignItems: "center", gap: 12,
      textDecoration: "none",
      padding: collapsed ? "11px 0" : "11px 14px",
      justifyContent: collapsed ? "center" : "flex-start",
      borderRadius: 13, cursor: "pointer",
      background: active === "logout" ? "rgba(239,68,68,0.09)" : "transparent",
      color: active === "logout" ? "#ef4444" : "#94a3b8",
      fontWeight: active === "logout" ? 800 : 600,
      fontSize: 13.5,
      transition: "background 0.2s, color 0.2s",
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
    <AnimatePresence>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.22 }}
          style={{ overflow: "hidden", whiteSpace: "nowrap" }}
        >
          Logout
        </motion.span>
      )}
    </AnimatePresence>
  </motion.a>

  {/* User profile card */ }
  <AnimatePresence>
    {!collapsed && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
        style={{
          margin: "10px 0 10px",
          padding: "12px 14px",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(91,154,245,0.08), rgba(61,114,224,0.04))",
          border: "1px solid rgba(91,154,245,0.13)",
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #5b9af5, #3d72e0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 900, color: "white",
          boxShadow: "0 3px 10px rgba(61,114,224,0.25)",
        }}>{initial}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{full_name}</div>
          <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{email || role}</div>
        </div>
        <motion.div
          whileHover={{ rotate: 90, color: "#5b9af5" }}
          transition={{ duration: 0.25 }}
          style={{ color: "#cbd5e1", fontSize: 15, cursor: "pointer", flexShrink: 0 }}
        >⚙️</motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Collapsed avatar only */ }
  {
    collapsed && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{
          margin: "8px auto 10px",
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #5b9af5, #3d72e0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 900, color: "white",
          boxShadow: "0 3px 10px rgba(61,114,224,0.25)",
          cursor: "pointer",
        }}
      >{initial}</motion.div>
    )
  }
    </div >
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        @media(max-width: 768px) { .desktop-sidebar { display: none !important; } }
        @media(min-width: 769px) { .mobile-toggle { display: none !important; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(91,154,245,0.25); border-radius: 4px; }
      `}</style>

      {/* Desktop Sidebar */}
      <motion.aside
        className="desktop-sidebar"
        animate={{ width: collapsed ? 70 : 240 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 40,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(22px)",
          borderRight: "1px solid rgba(91,154,245,0.13)",
          boxShadow: "4px 0 28px rgba(61,114,224,0.08)",
          overflow: "hidden", flexShrink: 0,
        }}
      >
        {/* Subtle inner glow */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "0 0 4px 4px",
          background: "linear-gradient(90deg, #5b9af5, #3d72e0, #7ab5f8, #5b9af5)",
          backgroundSize: "200%",
          animation: "gradShift 4s ease-in-out infinite",
        }} />
        <style>{`@keyframes gradShift{0%,100%{background-position:0%}50%{background-position:100%}}`}</style>

        <SidebarContent />
      </motion.aside>

      {/* Mobile toggle button */}
      <motion.button
        className="mobile-toggle"
        onClick={() => setMobileOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 60,
          width: 44, height: 44, borderRadius: 13,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(91,154,245,0.2)",
          boxShadow: "0 4px 18px rgba(61,114,224,0.13)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#3d72e0", fontSize: 18,
        }}
      >
        <AnimatePresence mode="wait">
          {mobileOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>✕</motion.span>
            : <motion.span key="burger" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>☰</motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 50,
                background: "rgba(15,23,42,0.32)",
                backdropFilter: "blur(3px)",
              }}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed", left: 0, top: 0,
                height: "100vh", width: 240, zIndex: 55,
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(24px)",
                borderRight: "1px solid rgba(91,154,245,0.13)",
                boxShadow: "8px 0 36px rgba(61,114,224,0.13)",
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg, #5b9af5, #3d72e0, #7ab5f8)",
              }} />
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}