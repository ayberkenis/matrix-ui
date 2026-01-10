import "./globals.css";
import { LocaleProvider } from "../lib/localeContext";

export const metadata = {
  title: "Living Matrix",
  description: "Matrix simulation control room",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
