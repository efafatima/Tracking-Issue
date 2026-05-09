import FloatingParticle from "./FloatingParticle";
import { PARTICLES } from "./Particle";

export default function AuthLayout({ children }) {
  return (
     <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden grid-bg"
        style={{
          background: "linear-gradient(145deg,#c8ddf5 0%,#dceaf9 30%,#eef4fd 60%,#e0eaf8 100%)",
          minHeight: "100vh",
        }}
      >
      {/* Blobs */}
      <div className="blob-a absolute" style={{
          top: "-80px", left: "-80px", width: 360, height: 360,
          borderRadius: "60% 40% 55% 45%/50% 60% 40% 50%",
          background: "radial-gradient(circle at 35% 35%, rgba(168,200,248,0.7), rgba(200,224,252,0.25))",
          filter: "blur(32px)",
        }} />
        <div className="blob-b absolute" style={{
          bottom: "-100px", right: "-100px", width: 420, height: 420,
          borderRadius: "45% 55% 40% 60%/60% 45% 55% 40%",
          background: "radial-gradient(circle at 65% 65%, rgba(144,184,240,0.6), rgba(176,204,248,0.2))",
          filter: "blur(38px)",
        }} />
        <div className="blob-c absolute" style={{
          top: "35%", right: "-30px", width: 160, height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(144,184,240,0.5), transparent)",
          filter: "blur(20px)",
        }} />
        <div className="blob-a absolute" style={{
          bottom: "8%", left: "-20px", width: 130, height: 130,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,200,248,0.45), transparent)",
          filter: "blur(16px)",
        }} />


      {/* Particles */}
     {PARTICLES.map(p => <FloatingParticle key={p.id} {...p} />)}




      {/* YAHAN LOGIN / REGISTER CARD AYEGA */}
      {children}
    </div>
  );
}