# 🚀 Quick Implementation Guide

## How to Use New Components

### 1. StatusBadge - Show Issue Status
```jsx
import StatusBadge from "@/components/StatusBadge";

// In your JSX:
<StatusBadge status="In Progress" showIcon={true} />
<StatusBadge status="Resolved" />
<StatusBadge status="Escalated" />

// Available statuses:
// - "Open" (Blue)
// - "In Progress" (Amber)
// - "Resolved" (Green)
// - "Escalated" (Red)
```

### 2. RoleBadge - Show User Role
```jsx
import RoleBadge from "@/components/RoleBadge";

// In your JSX:
<RoleBadge role={profile.role} showDescription={false} />

// Available roles:
// - "Student" (Blue badge 🔵)
// - "Faculty Member" (Purple badge 🟣)
// - "HOD" (Green badge 🟢)
// - "DSA" (Amber badge 🟠)
// - "Supervisor" (Red badge 🔴)
```

### 3. AIPanel - Show AI Suggestions
```jsx
import AIPanel from "@/components/AIPanel";

// In your JSX:
<AIPanel 
  category="Academic" 
  severity="High" 
  suggestions={["Similar issue: Lab access", "Related: Computer issue"]}
/>

// Severity options: "Low", "Medium", "High"
// Suggestions: array of strings (up to 3 recommended)
```

### 4. IssueTimeline - Show Progress
```jsx
import IssueTimeline from "@/components/IssueTimeline";

// In your JSX:
<IssueTimeline currentStep={2} />

// Steps are auto-defined:
// 0 = Submitted
// 1 = Routed
// 2 = Assigned (current shown here)
// 3 = In Progress
// 4 = Resolved
```

## CSS Classes Available

### Status Badges
```jsx
// Direct class usage:
<span className="status-badge open">Open</span>
<span className="status-badge in-progress">In Progress</span>
<span className="status-badge resolved">Resolved</span>
<span className="status-badge escalated">Escalated</span>
```

### Role Colors
```jsx
// Direct CSS classes:
<div className="role-student">Student themed content</div>
<div className="role-faculty">Faculty themed content</div>
<div className="role-hod">HOD themed content</div>
<div className="role-dsa">DSA themed content</div>
<div className="role-supervisor">Supervisor themed content</div>
```

### AI Panel
```jsx
// Direct class usage:
<div className="ai-panel">
  <span className="ai-badge">✨ AI Assistant</span>
</div>
```

### Timeline
```jsx
// Direct class usage:
<div className="timeline">
  <div className="timeline-item completed">
    <div className="timeline-dot"></div>
    <div className="timeline-content">
      <div className="timeline-label">Submitted</div>
      <div className="timeline-time">5 min ago</div>
    </div>
  </div>
</div>
```

## CSS Variables Usage

### Using Role Colors
```jsx
<div style={{ color: "var(--role-student)" }}>Blue text</div>
<div style={{ background: "var(--role-faculty)" }}>Purple bg</div>
```

### Using Status Colors
```jsx
<div style={{ color: "var(--status-open)" }}>Open (Blue)</div>
<div style={{ color: "var(--status-in-progress)" }}>Progress (Amber)</div>
<div style={{ color: "var(--status-resolved)" }}>Resolved (Green)</div>
<div style={{ color: "var(--status-escalated)" }}>Escalated (Red)</div>
```

### Using Primary Colors
```jsx
<div style={{ background: "var(--dark-navy)" }}>Dark navy bg</div>
<div style={{ color: "var(--uni-blue)" }}>Uni blue text</div>
<div style={{ background: "var(--ai-purple)" }}>AI purple</div>
```

## Component Integration Examples

### Example 1: Dashboard Header
```jsx
import RoleBadge from "@/components/RoleBadge";

<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
  <h1>{profile.role} Dashboard</h1>
  <RoleBadge role={profile.role} showDescription />
</div>
```

### Example 2: Complaint Card
```jsx
import StatusBadge from "@/components/StatusBadge";

<div className="complaint-card">
  <h3>{complaint.title}</h3>
  <p>{complaint.description}</p>
  <div style={{ display: "flex", gap: 8 }}>
    <StatusBadge status={complaint.status} />
    <span className="badge">{complaint.priority}</span>
  </div>
</div>
```

### Example 3: Form with AI Suggestions
```jsx
import AIPanel from "@/components/AIPanel";

<form>
  <textarea placeholder="Describe issue..." />
  {suggestionsAvailable && (
    <AIPanel 
      category={suggestion.category}
      severity={suggestion.severity}
      suggestions={suggestion.similar}
    />
  )}
  <button>Submit</button>
</form>
```

### Example 4: Issue Detail Page
```jsx
import StatusBadge from "@/components/StatusBadge";
import IssueTimeline from "@/components/IssueTimeline";

<div>
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <h2>{issue.title}</h2>
    <StatusBadge status={issue.status} />
  </div>
  <p>{issue.description}</p>
  <IssueTimeline currentStep={issue.currentStep} />
</div>
```

## Customization Guide

### Change Role Color
In `designTokens.js`, update `ROLE_COLORS`:
```javascript
export const ROLE_COLORS = {
  Student: {
    primary: "#NEW_COLOR", // Change this
    light: "#NEW_LIGHT_COLOR",
    badge: "🔵",
    description: "Issue submission & tracking",
  },
  // ...
};
```

### Add New Status
In `designTokens.js`, add to `STATUS_COLORS`:
```javascript
export const STATUS_COLORS = {
  // Existing...
  "On Hold": {
    color: "#NEW_COLOR",
    bg: "#NEW_BG",
    icon: "⏸️",
    label: "On Hold",
  },
};
```

### Update CSS Variables
In `globals.css`, add to `:root`:
```css
:root {
  --new-color: #HEXCODE;
  --new-role: #HEXCODE;
}
```

## Testing Checklist

- [ ] Landing page loads correctly
- [ ] Login page has feature highlights
- [ ] Dashboard shows role color
- [ ] Status badges display in complaint cards
- [ ] AI panel appears in form
- [ ] Mobile layout works
- [ ] All colors match specification
- [ ] No console errors
- [ ] Responsive design works

## Performance Notes

- ✅ No external dependencies added
- ✅ Uses existing lucide-react icons
- ✅ CSS classes are performant
- ✅ Components are lightweight
- ✅ Mobile-optimized

## Troubleshooting

**Issue: Colors not showing**
- Check CSS variables are defined in globals.css
- Verify color hex codes are correct
- Clear browser cache

**Issue: Badges not displaying**
- Import component correctly
- Check status/role values match
- Verify designTokens.js is in lib folder

**Issue: Mobile layout broken**
- Check media queries in globals.css
- Verify viewport meta tag in HTML
- Test with DevTools device emulation

---

Ready to use! 🎉
