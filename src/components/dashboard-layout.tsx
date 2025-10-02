"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { LayoutDashboard, Users, Calendar, FileText, Menu, X, Package, Stethoscope, Briefcase } from "lucide-react"
import { cn } from "~/lib/utils"
import { SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode
}

const allNavigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointment Notes", href: "/appointment-notes", icon: FileText },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Dispenser", href: "/dispenser", icon: Stethoscope },
];

type Role = "doctor" | "pharmacist" | "admin" | "receptionist";
type NavigationName = (typeof allNavigationItems)[number]['name'];

const rolePermissions: Record<Role, NavigationName[]> = {
  doctor: ["Dashboard", "Appointments", "Patients", "Appointment Reports"],
  pharmacist: ["Dashboard", "Dispenser", "Inventory"],
  admin: allNavigationItems.map(item => item.name),
  receptionist: ["Dashboard", "Appointments", "Patients"],
};

// Function to convert a Navigation Name to a URL-friendly slug
const getSlug = (name: string): string => {
  return `/${name.toLowerCase().replace(/\s/g, '-')}`;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isLoaded } = useUser()

  const userRole = useMemo(() => {
    if (isLoaded && user && typeof user.publicMetadata.role === 'string') {
      return user.publicMetadata.role as Role;
    }
    return null;
  }, [isLoaded, user]);

  const navigation = useMemo(() => {
    if (!userRole || !rolePermissions[userRole as Role]) {
      return [];
    }
    
    const requiredNames = rolePermissions[userRole as Role];

    return allNavigationItems
      .filter(item => requiredNames.includes(item.name as NavigationName))
      .map(item => {
        // Construct the dynamic href: /userRole/slug
        const slug = getSlug(item.name);
        
        // Dashboard is typically /dashboard, not /role/dashboard.
        // For all other links, use the dynamic path structure.
        const dynamicHref = item.name === 'Dashboard' ? item.href : `/${userRole}${slug}`;

        // Return a new item with the dynamic href
        return {
          ...item,
          href: dynamicHref,
        };
      });
  }, [userRole]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">ClinicCare</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-4 py-2 border-b border-sidebar-border">
            <p className="text-sm font-semibold text-primary">Role: <span className="capitalize">{userRole || 'N/A'}</span></p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              // The isCurrent logic needs to check against the calculated dynamic href
              const isCurrent = typeof window !== 'undefined' && window.location.pathname.startsWith(item.href) && (item.href !== '/dashboard' || window.location.pathname === '/dashboard');

              return (
                <a
                  key={item.name}
                  // ITEM.HREF NOW USES THE DYNAMIC VALUE CALCULATED ABOVE
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isCurrent
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t border-sidebar-border">
            <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Sign Out</span>
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user.fullName}</span>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}