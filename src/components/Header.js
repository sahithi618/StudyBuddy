"use client"

import { useState } from "react"
import { SignInButton, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Menu, X, Bot } from "lucide-react"

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <SignedOut>
        <div className="flex h-20 items-center justify-between px-8 bg-slate-100">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-primary font-bold text-xl">Study Buddy</span>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button
              className="text-sm font-semibold bg-blue-600 text-white"
              variant="outline"
              asChild
            >
              <SignInButton mode="modal" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 bg-white border-t">
            <SignInButton mode="modal">
              <Button className="w-full bg-blue-600 text-white">Sign In</Button>
            </SignInButton>
          </div>
        )}
    </SignedOut>
  )
}

export default Header
