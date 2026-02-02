
"use client"

import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { AuthButton } from "@/components/auth-button"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"

interface NavItemBase {
  href: string;
  label: string;
}

interface NavItemWithSubLinks extends NavItemBase {
  subLinks: NavItemBase[]; // subLinks can only contain base items
}

type NavItem = NavItemBase | NavItemWithSubLinks;

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAdmin, isMod, isStreamer, loading } = usePermissions() // Destructure new flags

  const baseNavLinks: NavItem[] = [
    { href: "/", label: "Inicio" },
    { href: "/streamers", label: "Streamers" },
    { href: "/servers", label: "Servidores" },
    { href: "/shop", label: "Tienda" },
    { href: "/blog", label: "Blog" },
  ]

  const dashboardLinks: NavItemBase[] = [] // dashboardLinks will initially be base items

  // Use the new role flags for conditional rendering
  if (isStreamer) {
    dashboardLinks.push({ href: "/dashboard/streamer", label: "Panel Streamer" })
  }
  if (isMod) {
    dashboardLinks.push({ href: "/dashboard/mod", label: "Panel Moderador" })
  }
  if (isAdmin) {
    dashboardLinks.push({ href: "/dashboard/admin", label: "Panel Administrador" })
  }

  const navLinks: NavItem[] = [...baseNavLinks]

  if (dashboardLinks.length > 0) {
    navLinks.push({ href: "/dashboard", label: "Dashboard", subLinks: dashboardLinks } as NavItemWithSubLinks) // Cast to NavItemWithSubLinks
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <div className="theme-logo-icon" />
            <span className="hidden sm:inline">StreamerForce</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              "subLinks" in link ? ( // Check if subLinks property exists
                <div key={link.href} className="relative group">
                  <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Button>
                  <div className="absolute left-0 pt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 z-50 hidden group-hover:block">
                    <div className="py-1">
                      {(link as NavItemWithSubLinks).subLinks.map((subLink) => (
                        <Link
                          key={subLink.href}
                          href={subLink.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Theme Switcher & Auth */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {/* AuthButton handles its own loading and user state */}
            <AuthButton />

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                "subLinks" in link ? (
                  <div key={link.href} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                    {(link as NavItemWithSubLinks).subLinks.map((subLink) => (
                      <Link
                        key={subLink.href}
                        href={subLink.href}
                        className="block pl-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              {/* AuthButton handles rendering login/logout based on its internal user state */}
              <AuthButton /> 
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
