import "~/styles/globals.css";

import { type Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "DocThing",
  description: "A Clinic Management App",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <ClerkProvider>
        <html lang="en">
        <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
