import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BuildTrack | Construction Asset Management",
  description: "Cloud-based asset management for construction sites, powered by Microsoft Azure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
