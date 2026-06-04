export default function IssueTimeline({ steps, currentStep = 0 }) {
  const timelineSteps = [
    { label: "Submitted", time: "5 min ago" },
    { label: "Routed", time: "4 min ago" },
    { label: "Assigned", time: "3 min ago" },
    { label: "In Progress", time: "Just now" },
    { label: "Resolved", time: null }
  ];

  return (
    <div className="timeline">
      {timelineSteps.map((step, index) => (
        <div 
          key={index}
          className={`timeline-item ${index < currentStep ? "completed" : index === currentStep ? "active" : ""}`}
        >
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-label">{step.label}</div>
            {step.time && <div className="timeline-time">{step.time}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
