import "./globals.css";

export const metadata = {
  title: "IssueTracker",
  description: "University complaint and issue tracking system"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
