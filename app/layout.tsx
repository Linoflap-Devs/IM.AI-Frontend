import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "IM.AI",
    description: "Smart Cart for smart ",
};
export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-personal-bg-color`}>
                {children}{" "}
            </body>
        </html>
    );
}
