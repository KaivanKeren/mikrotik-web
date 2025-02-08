"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Wifi,
  AlertTriangle,
  Router,
  Network,
  HardDrive,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface NetworkInterface {
  interface: string;
  rxKbps: number;
  txKbps: number;
}

interface UsageData {
  rx: number;
  tx: number;
}

interface NetworkData {
  interfaces: NetworkInterface[];
  usageByIP: Record<string, UsageData>;
}

interface TimeSeriesPoint {
  timestamp: string;
  [key: string]: number | string; // For dynamic interface keys
}

interface BandwidthAlert {
  type: "bandwidth_alert";
  ip: string;
  usage: number;
  timestamp: string;
}

interface BandwidthUpdate {
  type: "bandwidth_update";
  data: NetworkData;
  timestamp: string;
}

type WebSocketMessage = BandwidthAlert | BandwidthUpdate;

type WebSocketStatus = "connecting" | "connected" | "disconnected";

interface IPChartData {
  ip: string;
  value: number;
  rx: number;
  tx: number;
}

const COLORS: string[] = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
];

const NetworkDashboard = () => {
  const [data, setData] = useState<NetworkData>({
    interfaces: [],
    usageByIP: {},
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [alerts, setAlerts] = useState<BandwidthAlert[]>([]);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>("connecting");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null
  );

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9090");

    ws.onopen = () => {
      setWsStatus("connected");
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
    };

    ws.onmessage = (event: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(event.data);

      if (message.type === "bandwidth_update") {
        setData(message.data);
        if (!selectedInterface && message.data.interfaces.length > 0) {
          setSelectedInterface(message.data.interfaces[0].interface);
        }

        setTimeSeriesData((prev) => {
          const newPoint: TimeSeriesPoint = {
            timestamp: new Date(message.timestamp).toLocaleTimeString(),
            ...message.data.interfaces.reduce(
              (acc, iface) => ({
                ...acc,
                [`${iface.interface}_rx`]: iface.rxKbps,
                [`${iface.interface}_tx`]: iface.txKbps,
              }),
              {}
            ),
          };
          return [...prev.slice(-30), newPoint];
        });
      } else if (message.type === "bandwidth_alert") {
        setAlerts((prev) => [...prev.slice(-9), message]);
      }
    };

    return () => ws.close();
  }, [selectedInterface]);

  const getTotalBandwidth = (type: "rx" | "tx"): number => {
    return data.interfaces.reduce(
      (sum, iface) => sum + (type === "rx" ? iface.rxKbps : iface.txKbps),
      0
    );
  };

  const getIPUsageData = (): IPChartData[] => {
    return Object.entries(data.usageByIP).map(([ip, usage]) => ({
      ip,
      value: usage.rx + usage.tx,
      rx: usage.rx,
      tx: usage.tx,
    }));
  };

  const formatBytes = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Network Monitor
            </h1>
            <p className="text-gray-500 mt-2">
              Real-time network performance dashboard
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              wsStatus === "connected"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="capitalize font-medium">{wsStatus}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Download
                  </p>
                  <p className="text-2xl font-bold">
                    {getTotalBandwidth("rx").toFixed(2)} Kbps
                  </p>
                </div>
                <ArrowDownRight className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Upload
                  </p>
                  <p className="text-2xl font-bold">
                    {getTotalBandwidth("tx").toFixed(2)} Kbps
                  </p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active Interfaces
                  </p>
                  <p className="text-2xl font-bold">{data.interfaces.length}</p>
                </div>
                <Network className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active IPs
                  </p>
                  <p className="text-2xl font-bold">
                    {Object.keys(data.usageByIP).length}
                  </p>
                </div>
                <Router className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time Bandwidth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Real-time Bandwidth Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis
                        label={{
                          value: "Kbps",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      {data.interfaces.map((iface, idx) => (
                        <React.Fragment key={iface.interface}>
                          <Line
                            type="monotone"
                            dataKey={`${iface.interface}_rx`}
                            name={`${iface.interface} RX`}
                            stroke={COLORS[idx % COLORS.length]}
                          />
                          <Line
                            type="monotone"
                            dataKey={`${iface.interface}_tx`}
                            name={`${iface.interface} TX`}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeDasharray="5 5"
                          />
                        </React.Fragment>
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* IP Usage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>IP Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getIPUsageData()}
                        dataKey="value"
                        nameKey="ip"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ ip }) => ip}
                      >
                        {getIPUsageData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interfaces" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.interfaces.map((iface, idx) => (
                <Card key={iface.interface}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5" />
                      {iface.interface}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Download Speed</span>
                        <span className="font-medium text-green-600">
                          {iface.rxKbps.toFixed(2)} Kbps
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Upload Speed</span>
                        <span className="font-medium text-blue-600">
                          {iface.txKbps.toFixed(2)} Kbps
                        </span>
                      </div>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[iface]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="interface" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey="rxKbps"
                              name="Download"
                              fill="#10B981"
                            />
                            <Bar
                              dataKey="txKbps"
                              name="Upload"
                              fill="#3B82F6"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(data.usageByIP).map(([ip, usage]) => (
                <Card key={ip}>
                  <CardHeader>
                    <CardTitle className="text-lg">Client: {ip}</CardTitle>
                    <CardDescription>
                      Total Usage:{" "}
                      {((usage.rx + usage.tx) / 1024 / 1024).toFixed(2)} MB
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Download</span>
                        <span className="font-medium">
                          {(usage.rx / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Upload</span>
                        <span className="font-medium">
                          {(usage.tx / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{ rx: usage.rx, tx: usage.tx }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="rx" name="Download" fill="#10B981" />
                            <Bar dataKey="tx" name="Upload" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alerts.map((alert, idx) => (
              <Alert key={idx} variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Bandwidth limit exceeded for IP {alert.ip} - Usage:{" "}
                  {(alert.usage / 1024 / 1024).toFixed(2)} MB at{" "}
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </AlertDescription>
              </Alert>
            ))}
            {alerts.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    No alerts to display
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NetworkDashboard;
