"use client";

import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";

export default function UsersPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div>UsersPage</div>
    </div>
  );
}
