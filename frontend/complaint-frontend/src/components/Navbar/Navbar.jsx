import { motion } from "framer-motion";

export default function Navbar({ title }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900"
    >
      <h1 className="text-white font-bold text-lg tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
          <span className="text-slate-400 text-sm">🔍</span>
          <input
            className="bg-transparent text-slate-300 text-sm outline-none w-28 placeholder-slate-500"
            placeholder="Search..."
          />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xs text-white font-bold">
            S
          </div>
          <span className="text-slate-300 text-sm font-medium">
            Sara Tariq
          </span>
          <span className="text-slate-400 text-xs">▾</span>
        </div>
      </div>
    </motion.div>
  );
}