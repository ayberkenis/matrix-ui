import "./globals.css";
import { LocaleProvider } from "../lib/localeContext";

export const metadata = {
  title: "Matrix",
  description: "Matrix simulation control room",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
