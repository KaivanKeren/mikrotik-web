import React from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  AlertTriangle,
  Network,
  Router,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Shield,
  FileClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const Sidebar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) => {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Network, label: "Interfaces", href: "/interfaces" },
    { icon: Router, label: "Clients", href: "/clients" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: Shield, label: "Firewall", href: "/firewall" },
    { icon: FileClock, label: "Log", href: "/log" },
    { icon: AlertTriangle, label: "Alerts", href: "/alerts" },
  ];

  return (
    <div
      className={cn(
        "sticky top-0 flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <span className="text-lg font-semibold">Network Monitor</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    "hover:bg-gray-100 group",
                    isActive
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-gray-700 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      collapsed ? "mx-auto" : "",
                      isActive
                        ? "text-blue-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="bottom-0 p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;