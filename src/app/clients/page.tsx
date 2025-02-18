"use client";

import ClientComponent from "@/components/ClientComponent";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";

const InterfacePage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 min-h-screen bg-gray-50 p-8">
        <ClientComponent />
      </div>
    </div>
  );
};

export default InterfacePage;
