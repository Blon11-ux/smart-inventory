import "./globals.css";
import { LanguageProvider } from "../components/LanguageProvider";

export const metadata = {
  title: "Smart Inventory",
  description: "Inventory management for small shops",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}