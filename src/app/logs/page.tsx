"use client";

import LogComponent from "@/components/LogComponent";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";

const LogPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 min-h-screen bg-gray-50 p-8">
        <LogComponent />
      </div>
    </div>
  );
};

export default LogPage;
