import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, ShieldCheck, UserCog } from "lucide-react";

const palette = {
  navy: "#0F2342",
  teal: "#1D9E75",
  amber: "#BA7517",
  red: "#A32D2D",
  purple: "#534AB7",
  bg: "#F5F7FA",
  textMuted: "#667085",
  border: "rgba(15, 35, 66, 0.12)",
};

const stats = [
  { value: "2.4K+", label: "Students", color: palette.navy, Icon: ShieldCheck },
  { value: "98%", label: "Resolved", color: palette.teal, Icon: CheckCircle2 },
  { value: "24h", label: "In Review", color: palette.amber, Icon: CircleDashed },
  { value: "Admin", label: "Supervisor", color: palette.purple, Icon: UserCog },
];

export default function BZUWelcome() {
  return (
    <main
      style={{
        minHeight: "100svh",
        width: "100%",
        display: "grid",
        placeItems: "center",
        background: palette.bg,
        padding: "32px 20px",
      }}
    >
      <section
        className="welcome-card"
        style={{
          width: "min(560px, 100%)",
          margin: "0 auto",
          padding: "clamp(22px, 5vw, 32px)",
          borderRadius: 18,
          background: "#FFFFFF",
          border: 0,
          boxShadow: "0 24px 56px rgba(15, 35, 66, 0.10)",
          textAlign: "center",
        }}
      >
        <div className="welcome-animate" style={{ display: "grid", justifyItems: "center", gap: 14 }}>
          <div
            style={{
              width: 82,
              height: 82,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              background: "#ffffff",
              border: 0,
              overflow: "hidden",
            }}
          >
            <Image src="/bzu-logo.png" alt="BZU Logo" width={70} height={70} priority style={{ borderRadius: "50%" }} />
          </div>
          <span
            style={{
              color: palette.teal,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Welcome to
          </span>
        </div>

        <h1
          className="welcome-animate"
          style={{
            margin: "14px 0 0",
            color: palette.navy,
            fontSize: "clamp(2.25rem, 8vw, 3.5rem)",
            lineHeight: 1.04,
            fontWeight: 900,
            letterSpacing: 0,
          }}
        >
          Issue Tracker <span style={{ display: "block", marginTop: 8, fontSize: "0.34em", fontWeight: 800 }}>(BZU Complaint System)</span>
        </h1>

        <p
          className="welcome-animate"
          style={{
            width: "min(390px, 100%)",
            margin: "16px auto 0",
            color: palette.textMuted,
            fontSize: 15,
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          Streamline, manage and track departmental complaints with a clear workflow for students, admins and supervisors.
        </p>

        <div
          className="welcome-animate"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginTop: 28,
          }}
        >
          <Link
            href="/login"
            style={{
              minHeight: 50,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 10,
              background: palette.navy,
              color: "#FFFFFF",
              fontWeight: 800,
              boxShadow: "0 14px 26px rgba(15, 35, 66, 0.22)",
            }}
          >
            Login <ArrowRight size={17} />
          </Link>
          <Link
            href="/register"
            style={{
              minHeight: 50,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 10,
              background: "#FFFFFF",
              color: palette.navy,
              border: `1px solid ${palette.border}`,
              fontWeight: 800,
            }}
          >
            Register <ArrowRight size={17} />
          </Link>
        </div>

        <div
          className="welcome-animate"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
            gap: 10,
            marginTop: 28,
            paddingTop: 24,
            borderTop: `1px solid ${palette.border}`,
          }}
        >
          {stats.map(({ value, label, color, Icon }) => (
            <div
              key={label}
              style={{
                minWidth: 0,
                padding: "14px 8px",
                borderRadius: 10,
                background: "#F9FAFB",
                border: "1px solid rgba(15, 35, 66, 0.08)",
              }}
            >
              <Icon size={18} color={color} />
              <div style={{ marginTop: 8, color, fontSize: 16, fontWeight: 900 }}>{value}</div>
              <div style={{ marginTop: 4, color: palette.textMuted, fontSize: 11, fontWeight: 800 }}>{label}</div>
            </div>
          ))}
        </div>

        <p className="welcome-animate" style={{ margin: "20px 0 0", color: "#98A2B3", fontSize: 12, fontWeight: 700 }}>
          Bahauddin Zakariya University &copy; {new Date().getFullYear()}
        </p>
      </section>
    </main>
  );
}
