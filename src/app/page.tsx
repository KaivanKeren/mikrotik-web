"use client"

import NetworkDashboard from "@/components/NetworkDashboard";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 min-h-screen bg-gray-50 p-8">
        <NetworkDashboard />
      </div>
    </div>
  );
}
