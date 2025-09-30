import { Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Scanin",
  description:
    "Scan produk, dapatkan tips daur ulang, jadwalkan jemputan bank sampah, dan kumpulkan poin ramah lingkungan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${grotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
