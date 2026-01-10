import "./globals.css";

export const metadata = {
  title: "Living Matrix",
  description: "Matrix simulation control room",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
