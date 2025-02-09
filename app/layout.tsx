import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react" // Import React
import { AuthProvider } from "./context/authContext"
import Navbar from "./components/Navbar"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Your Website",
  description: "Your website description",
  // Add other metadata as needed
  other: {
    monetag: "031906f3bb6cbdec5103f3f652a96785",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="monetag" content="031906f3bb6cbdec5103f3f652a96785" />
      </head>
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

