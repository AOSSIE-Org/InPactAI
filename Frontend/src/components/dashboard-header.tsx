import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Rocket,
  Search,
  Users,
} from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import { UserNav } from "./user-nav";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
};

const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/sponsorships", icon: Briefcase, label: "Sponsorships" },
  { to: "/dashboard/collaborations", icon: Users, label: "Collaborations" },
  { to: "/dashboard/contracts", icon: FileText, label: "Contracts" },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
];

export type DashboardHeaderProps = {
  showSearch?: boolean;
  showQuickLogout?: boolean;
  onLogout?: () => void;
};

export default function DashboardHeader({
  showSearch = true,
  showQuickLogout = false,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2 mr-6 ml-6">
          <Rocket className="h-6 w-6 text-[hsl(262.1,83.3%,57.8%)]" />
          <span className="font-bold text-xl hidden md:inline-block">Inpact</span>
        </Link>

        <div className="flex items-center space-x-4">
          {DASHBOARD_NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <Button
              key={to}
              variant="ghost"
              size="sm"
              className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]"
              asChild
            >
              <Link to={to}>
                <Icon className="h-5 w-5" />
                <span className="sr-only">{label}</span>
              </Link>
            </Button>
          ))}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {showSearch && (
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[300px] rounded-full bg-[hsl(210,40%,96.1%)] border-[hsl(214.3,31.8%,91.4%)]"
              />
            </div>
          )}

          <ModeToggle />

          {showQuickLogout && typeof onLogout === "function" && (
            <Button onClick={onLogout} variant="ghost" aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          )}

          <UserNav />
        </div>
      </div>
    </header>
  );
}
