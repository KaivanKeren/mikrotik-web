"use client";

import Sidebar from "@/components/Sidebar";
import UsersComponent from "@/components/UserComopenent";
import React, { useState } from "react";

export default function UsersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <UsersComponent />
    </div>
  );
}
