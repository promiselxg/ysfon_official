import localFont from "next/font/local";
import "./globals.css";
import PageTransition from "@/components/animation/pageTransition";
import LayoutWrapper from "./layout-wrapper";
import { Toaster } from "@/components/ui/sonner";

const euclid = localFont({
  src: [
    {
      path: "./fonts/Euclid_Circular_A_Light_Italic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/Euclid_Circular_A_Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Euclid_Circular_A_Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Euclid_Circular_A_Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Euclid_Circular_A_SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-euclid",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={euclid.variable}>
      <body className="font-euclid">
        <PageTransition>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster richColors />
        </PageTransition>
      </body>
    </html>
  );
}
