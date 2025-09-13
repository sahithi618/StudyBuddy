import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Header from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator"
import 'filepond/dist/filepond.min.css'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { SignedIn, SignedOut } from "@clerk/nextjs"
import Homepage from "@/components/Homepage";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "App",
  description: "next app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SignedIn>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                  <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                  </div>
                </header>
                <div className="px-4">
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </SignedIn>
          <SignedOut>
            <Header/>
            <Homepage />
            <Footer/>
          </SignedOut>
          <Toaster/>
        </body>
      </html>
    </ClerkProvider>
  );
}
