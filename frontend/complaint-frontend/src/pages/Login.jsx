import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "../services/api";
import AuthLayout from "../components/main/AuthLayout";
import InputField from "../components/main/InputField";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

 const handleLogin = async () => {
  // Trim inputs to remove extra spaces
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (!cleanUsername || !cleanPassword) {
    setErrorMsg("Please enter both username and password.");
    return;
  }

  setLoading(true);
  setSuccess(false);
  setErrorMsg("");

  try {
    const res = await loginUser({ username: cleanUsername, password: cleanPassword });

    // store tokens
    localStorage.setItem("token", res.access);
    localStorage.setItem("access", res.access);
    localStorage.setItem("refresh", res.refresh);
    localStorage.setItem("username", res.username);
    localStorage.setItem("full_name", res.full_name || res.username);
    localStorage.setItem("email", res.email || "");
    localStorage.setItem("department", res.department || "");
    localStorage.setItem("department_name", res.department_name || "");
    localStorage.setItem("faculty_designation", res.faculty_designation || "");

    const role = res.role;

    
    localStorage.setItem("role", role);

    setSuccess(true);

    // redirect based on role
    switch (role) {
      case "supervisor":
        navigate("/supervisor-dashboard");
        break;
      case "dsa":
        navigate("/dsa-dashboard");
        break;
      case "faculty member":
        navigate("/teacher-dashboard");
        break;
      case "student":
        navigate("/student-dashboard");
        break; 
        case "hod":
        navigate("/hod-dashboard");
        break;
      default:
        navigate("/");
    }
  } catch (error) {
    console.error("Login failed error:", error.response ? error.response.data : error);
    
    // Check if backend sent error message
    if (error.response?.data?.error) {
      setErrorMsg(error.response.data.error);
    } else {
      setErrorMsg("Login failed. Check your username and password.");
    }
  } finally {
    setLoading(false);
  }
};
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <>
      
        <AuthLayout>

        

        {/* Card */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{
            position: "relative", zIndex: 10,
            width: 360, background: "white",
            borderRadius: 24, padding: "42px 36px 34px",
            boxShadow: "0 20px 80px rgba(61,114,224,0.13), 0 4px 20px rgba(61,114,224,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.85)",
          }}
        >
          {/* Animated top bar */}
          <motion.div
            style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              height: 4, borderRadius: "0 0 8px 8px",
              background: "linear-gradient(90deg,#5b9af5,#3d72e0,#7ab5f8,#5b9af5)",
              backgroundSize: "200%", width: 80,
            }}
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Decorative dots */}
          <div style={{ position: "absolute", top: 18, right: 18, display: "flex", gap: 5 }}>
            {[0.25, 0.55, 1].map((o, i) => (
              <motion.div key={i}
                style={{ width: 6, height: 6, borderRadius: "50%", background: `rgba(91,154,245,${o})` }}
                animate={{ scale: [1, 1.5, 1], opacity: [o, 1, o] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>

          {/* BZU Badge */}
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <motion.div
              whileHover={{ scale: 1.06, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                width: 68, height: 68, borderRadius: "50%", overflow: "hidden",
                boxShadow: "0 6px 24px rgba(61,114,224,0.2), 0 0 0 4px rgba(91,154,245,0.12)",
                border: "3px solid rgba(255,255,255,0.9)",
              }}
            >
              <img src="/bzu-logo.png" alt="BZU" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </motion.div>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 6 }}>
            <motion.span
              style={{
                display: "inline-block", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ✦ BZU  Departmental Complaint System ✦
            </motion.span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            textAlign: "center", fontSize: "1.45rem", fontWeight: 900,
            color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 4,
          }}>
            Welcome{" "}
            <span style={{
              background: "linear-gradient(135deg,#5b9af5,#3d72e0)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Back</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            textAlign: "center", fontSize: 12.5, color: "#94a3b8",
            fontWeight: 500, marginBottom: 22,
          }}>
            Login to manage your complaints
          </motion.p>

          {/* Divider */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <motion.div
              style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0)" }}
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#5b9af5,#3d72e0)" }} />
            <motion.div
              style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#e2e8f0,transparent)" }}
              initial={{ scaleX: 0, originX: 1 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            />
          </motion.div>

          {/* Error banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{
                  marginBottom: 14, padding: "10px 14px", borderRadius: 10,
                  background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444", fontSize: 12.5, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                ⚠ {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fields */}
          <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <InputField
  placeholder="Username"
  type="text"
  icon="👤"
  onChange={e => setUsername(e.target.value)}
/>
            
            
            
            <InputField
  placeholder="Password"
  type={showPassword ? "text" : "password"}
  icon={showPassword ? "👁️" : "🔒"}
  onChange={e => setPassword(e.target.value)}
  onIconClick={() => setShowPassword(!showPassword)}
/>

            
                           
          </motion.div>

          {/* Forgot password */}
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <a href="#" style={{
              color: "#5b9af5", fontWeight: 600, textDecoration: "none",
              fontSize: 12, letterSpacing: "0.01em",
            }}>
              Forgot Password?
            </a>
          </motion.div>

          {/* Login Button */}
          <motion.div variants={fadeUp}>
            <motion.button
              onClick={handleLogin}
              whileHover={!loading && !success ? { scale: 1.025, y: -2, boxShadow: "0 10px 30px rgba(61,114,224,0.42)" } : {}}
              whileTap={!loading ? { scale: 0.975 } : {}}
              className="shimmer-btn"
              style={{
                width: "100%", height: 50, marginTop: 16,
                borderRadius: 13, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: success
                  ? "linear-gradient(90deg,#22c55e,#16a34a)"
                  : "linear-gradient(90deg,#5b9af5 0%,#3d72e0 100%)",
                color: "white", fontWeight: 700, fontSize: 15,
                boxShadow: "0 6px 22px rgba(61,114,224,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                position: "relative", overflow: "hidden",
                transition: "background 0.4s",
              }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading"
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                    className="spinner"
                  />
                ) : success ? (
                  <motion.span key="success"
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    ✓ Login Successful!
                  </motion.span>
                ) : (
                  <motion.span key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Login →
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Social login */}
          <motion.div variants={fadeUp} style={{ margin: "18px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {[
                {
                  label: "Google",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  ),
                },
                {
                  label: "Microsoft",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 21 21">
                      <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
                      <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
                      <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
                      <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                    </svg>
                  ),
                },
              ].map(({ label, icon }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 7, padding: "10px 0", borderRadius: 11,
                    border: "1.5px solid #e5e7eb", background: "#fff",
                    cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#374151",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {icon}{label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Register link */}
          <motion.p variants={fadeUp} style={{
            textAlign: "center", fontSize: 12, color: "#94a3b8",
            marginTop: 18, fontWeight: 500,
          }}>
            Don't have an account?{" "}
            <a href="/register" style={{ color: "#5b9af5", fontWeight: 700, textDecoration: "none" }}>
              Register Now
            </a>
          </motion.p>

          {/* Footer */}
          <motion.p variants={fadeUp} style={{
            textAlign: "center", fontSize: 10.5, color: "#cbd5e1",
            marginTop: 14, fontWeight: 500,
          }}>
            Bahauddin Zakariya University © {new Date().getFullYear()}
          </motion.p>
        </motion.div>
       </AuthLayout>
    </>
  );
}



