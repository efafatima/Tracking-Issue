export default function AttachmentsSection({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div style={{ border: "1px solid rgba(91,154,245,0.25)", borderRadius: 12, padding: "12px 14px", background: "rgba(91,154,245,0.03)", marginTop: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 900, color: "#3d72e0", textTransform: "uppercase", marginBottom: 9 }}>
        Attachments ({attachments.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {attachments.map((att) => {
          const isImage = att.file_type?.startsWith("image/");
          const fileName = att.file_url ? decodeURIComponent(att.file_url.split("/").pop()) : `File #${att.id}`;
          const icon = att.file_type?.includes("pdf") ? "📄" : att.file_type?.includes("word") ? "📝" : isImage ? null : "📎";
          return (
            <div key={att.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 9, background: "white", border: "1px solid #e2e8f0" }}>
              {isImage ? (
                <img src={att.file_url} alt="attachment" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 7, border: "1px solid #e2e8f0", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>
                  {icon}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{att.file_type || "Unknown type"}</div>
              </div>
              <a href={att.file_url} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: "rgba(61,114,224,0.08)", color: "#3d72e0", textDecoration: "none", flexShrink: 0 }}>
                View
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
