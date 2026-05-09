export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

 export const STATUS_META = {
  Pending:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  dot: "#f59e0b" },
  Submitted:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  dot: "#f59e0b" },
  Assigned:    { color: "#5b9af5", bg: "rgba(91,154,245,0.1)",  dot: "#5b9af5" },
  "In Progress":{ color: "#8b5cf6",bg: "rgba(139,92,246,0.1)", dot: "#8b5cf6" },
  Solved:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   dot: "#22c55e" },
  Resolved:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   dot: "#22c55e" },
  Fulfilled:   { color: "#16a34a", bg: "rgba(22,163,74,0.1)",   dot: "#16a34a" },
  Closed:      { color: "#16a34a", bg: "rgba(22,163,74,0.1)",   dot: "#16a34a" },
};

export const SEV_META = {
  Low:    { color: "#22c55e", bg: "rgba(34,197,94,0.09)"   },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.09)"  },
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.09)"   },
  Urgent: { color: "#b91c1c", bg: "rgba(185,28,28,0.09)"   },
};


export const HODS = [
  { id: 1, name: "Dr. Khalid Mehmood", dept: "Computer Science", avatar: "K" },
  { id: 2, name: "Dr. Amina Bashir", dept: "Civil Engineering", avatar: "A" },
  { id: 3, name: "Dr. Tariq Hussain", dept: "Electrical Eng.", avatar: "T" },
  { id: 4, name: "Dr. Nadia Farooq", dept: "Management", avatar: "N" },
];

export const ACTIVITY = [
  { icon: "🔒", text: "Complaint finalized", time: "2m ago", color: "#22c55e" },
  { icon: "🎓", text: "Assigned to HOD", time: "15m ago", color: "#5b9af5" },
];

// const ACTIVITY = [
//   { icon: "🔒", text: "Complaint #C-1041 finalized by Admin",         time: "2m ago",  color: "#22c55e" },
//   { icon: "🎓", text: "Assigned 'WiFi Issue' to Dr. Khalid Mehmood",  time: "15m ago", color: "#5b9af5" },
//   { icon: "✅", text: "Mr. Ahmed Raza solved 'Broken Desk'",           time: "1h ago",  color: "#22c55e" },
//   { icon: "⚠️", text: "High severity complaint submitted",              time: "2h ago",  color: "#ef4444" },
//   { icon: "🎓", text: "Assigned 'HVAC Issue' to Dr. Amina Bashir",    time: "3h ago",  color: "#5b9af5" },
// ];


 export const PRED_META = {
  Low:    { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   icon: "🟢" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  icon: "🟡" },
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   icon: "🔴" },
};

 



export const INITIAL_COMPLAINTS = [
  { id: 1, title: "WiFi not working in Block-C", category: "IT Support",     severity: "High",   status: "In Progress", date: "10/11", rated: false },
  { id: 2, title: "Parking area damaged",        category: "Facilities",     severity: "Medium", status: "Solved",      date: "10/23", rated: true  },
  { id: 3, title: "Broken bench in room 204",    category: "Infrastructure", severity: "Low",    status: "Pending",     date: "11/02", rated: false },
  { id: 4, title: "Projector bulb issue",        category: "IT Support",     severity: "Medium", status: "Assigned",    date: "11/08", rated: false },
];

// export const  = {
//   "Low Delay": { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: "🟡" },
//   "Medium Delay": { color: "#f97316", bg: "rgba(249,115,22,0.08)", icon: "🟠" },
//   "High Delay": { color: "#ef4444", bg: "rgba(239,68,68,0.08)", icon: "🔴" },
// };

