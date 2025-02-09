import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Navbar from "./components/Navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CodeShare",
  description: "A simple and responsive source code sharing platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
          <Toaster position="top-center" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  )
}

