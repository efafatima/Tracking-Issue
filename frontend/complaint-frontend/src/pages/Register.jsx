import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser, loginUser, getPublicDepartments } from "../services/api";
import AuthLayout from "../components/main/AuthLayout";
import InputField from "../components/main/InputField"
import RoleDropdown from "../components/main/RoleDropdown"




export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    department: "",
    terms: false,
  });

  useEffect(() => {
    getPublicDepartments()
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);


    
const handleSubmit = async () => {
  setErrorMsg("");
  if (!formData.terms) {
    setErrorMsg("Please agree to the terms and conditions.");
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    setErrorMsg("Passwords do not match.");
    return;
  }
  if (!formData.department) {
    setErrorMsg("Please select your department.");
    return;
  }

  try {
    setLoading(true);


   const payload = {
  username: formData.username.trim(),
  email: formData.email.trim(),
  password: formData.password,
  role: "student",
  department: formData.department,
};
    // 1️⃣ Register user
    await registerUser(payload);

    // 2️⃣ Auto login
    const res = await loginUser({
      username: formData.username,  // ya email bhi chal sakta hai, backend pe depend karta hai
      password: formData.password,
    });

    // 3️⃣ Save tokens & role
    localStorage.setItem("token", res.access);
    localStorage.setItem("refresh", res.refresh);
    localStorage.setItem("role", "student");
    localStorage.setItem("username", res.username);
    localStorage.setItem("full_name", res.full_name || res.username);
    localStorage.setItem("email", res.email);
    localStorage.setItem("department", res.department || formData.department);
    localStorage.setItem("department_name", res.department_name || departments.find((dept) => String(dept.id) === String(formData.department))?.name || "");

    setSuccess(true);

    // 4️⃣ Navigate based on role
    window.location.href = "/student-dashboard";





  }catch (err) {
  let msg = "Registration failed. Please try again.";
  const data = err.response?.data;
  if (data) {
    const pick = (v) => Array.isArray(v) ? v[0] : v;
    if (data.username) msg = pick(data.username);
    else if (data.email) msg = pick(data.email);
    else if (data.role) msg = pick(data.role);
    else if (data.password) msg = pick(data.password);
    else if (data.non_field_errors) msg = pick(data.non_field_errors);
    else if (data.message) msg = data.message;
    else if (data.detail) msg = data.detail;
  }
  setErrorMsg(msg);
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
            width: 370, background: "white",
            borderRadius: 24, padding: "40px 36px 32px",
            boxShadow: "0 20px 80px rgba(61,114,224,0.13), 0 4px 20px rgba(61,114,224,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.85)",
          }}
        >
          {/* Animated top bar */}
          <motion.div
            style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              height: 4, borderRadius: "0 0 8px 8px", width: 80,
              background: "linear-gradient(90deg,#5b9af5,#3d72e0,#7ab5f8,#5b9af5)",
              backgroundSize: "200%",
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

          {/* BZU Logo badge */}
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <motion.div
              whileHover={{ scale: 1.06, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
                boxShadow: "0 6px 24px rgba(61,114,224,0.2), 0 0 0 4px rgba(91,154,245,0.12)",
                border: "3px solid rgba(255,255,255,0.9)",
              }}
            >
              <img src="/bzu-logo.png" alt="BZU" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </motion.div>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 4 }}>
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
              ✦ BZU Departmental Complaint System ✦
            </motion.span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            textAlign: "center", fontSize: "1.4rem", fontWeight: 900,
            color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 4,
          }}>
            Create an{" "}
            <span style={{
              background: "linear-gradient(135deg,#5b9af5,#3d72e0)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Account</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            textAlign: "center", fontSize: 12, color: "#94a3b8",
            fontWeight: 500, marginBottom: 20,
          }}>
            Join BZU's complaint management system
          </motion.p>

          {/* Divider */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <motion.div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0)" }}
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#5b9af5,#3d72e0)" }} />
            <motion.div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#e2e8f0,transparent)" }}
              initial={{ scaleX: 0, originX: 1 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }} />
          </motion.div>

          {/* Error banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                key="reg-error"
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
            <InputField placeholder="Name" type="text" icon="🧑" variants={fadeUp}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            <InputField placeholder="Email address" type="email" icon="✉️" variants={fadeUp}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <InputField placeholder="Password" type={showPassword ? "text" : "password"} icon={showPassword ? "👁️" : "🔒"} variants={fadeUp}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onIconClick={() => setShowPassword(!showPassword)}
            />
            <InputField placeholder="Confirm Password" type={showConfirm ? "text" : "password"} icon={showConfirm ? "👁️" : "🔑"} variants={fadeUp}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              onIconClick={() => setShowConfirm(!showConfirm)}
            />



            <motion.div variants={fadeUp}>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  fontSize: 13,
                  color: formData.department ? "#1e293b" : "#94a3b8",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: "rgba(248,250,255,0.8)",
                  borderRadius: 12,
                  outline: "none",
                  border: "1.5px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  fontWeight: 600,
                }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </motion.div>

            {/* Role Dropdown */}
            <RoleDropdown variants={fadeUp} selected={formData.role}
              onSelect={(value) => setFormData({ ...formData, role: value })} />
          </motion.div>

          {/* Terms */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14 }}>
            <input type="checkbox" id="terms" checked={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
              style={{
                marginTop: 2, accentColor: "#5b9af5", cursor: "pointer", flexShrink: 0,
              }} />
            <label htmlFor="terms" style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500, lineHeight: 1.5, cursor: "pointer" }}>
              I agree to the{" "}
              <a href="#" style={{ color: "#5b9af5", fontWeight: 700, textDecoration: "none" }}>Terms of Service</a>
              {" "}and{" "}
              <a href="#" style={{ color: "#5b9af5", fontWeight: 700, textDecoration: "none" }}>Privacy Policy</a>
            </label>
          </motion.div>

          {/* Sign Up Button */}
          <motion.div variants={fadeUp}>
            <motion.button
              onClick={handleSubmit}
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
                    ✓ Account Created!
                  </motion.span>
                ) : (
                  <motion.span key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Create Account →
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Login link */}
          <motion.p variants={fadeUp} style={{
            textAlign: "center", fontSize: 12, color: "#94a3b8",
            marginTop: 16, fontWeight: 500,
          }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#5b9af5", fontWeight: 700, textDecoration: "none" }}>
              Login Now
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
