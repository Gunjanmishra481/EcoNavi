import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EmissioNavi | Sustainable Mobility Companion",
  description: "Beautiful multi-feature frontend for sustainable navigation, fares, emissions, rewards, and safety.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

