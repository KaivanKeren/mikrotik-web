import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  WifiIcon,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  User,
} from "lucide-react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Area,
  AreaChart,
} from "recharts";

interface TimeSeriesPoint {
  timestamp: string;
  [key: string]: number | string;
}

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

const ClientComponent = () => {
  const [alerts, setAlerts] = useState<BandwidthAlert[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [data, setData] = useState<NetworkData>({
    interfaces: [],
    usageByIP: {},
  });
  const [peakUsage, setPeakUsage] = useState({ rx: 0, tx: 0 });
  const [totalTransferred, setTotalTransferred] = useState({ rx: 0, tx: 0 });

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9090");

    ws.onmessage = (event: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(event.data);

      if (message.type === "bandwidth_update") {
        setData(message.data);

        const ipAddresses = Object.keys(message.data.usageByIP);
        if (!selectedIP && ipAddresses.length > 0) {
          setSelectedIP(ipAddresses[0]);
        }

        // Update peak usage for all clients
        Object.values(message.data.usageByIP).forEach((usage) => {
          setPeakUsage((prev) => ({
            rx: Math.max(prev.rx, usage.rx),
            tx: Math.max(prev.tx, usage.tx),
          }));
        });

        // Update total transferred for all clients
        setTotalTransferred((prev) => ({
          rx:
            prev.rx +
            Object.values(message.data.usageByIP).reduce(
              (sum, usage) => sum + usage.rx,
              0
            ),
          tx:
            prev.tx +
            Object.values(message.data.usageByIP).reduce(
              (sum, usage) => sum + usage.tx,
              0
            ),
        }));

        setTimeSeriesData((prev) => {
          const newPoint: TimeSeriesPoint = {
            timestamp: new Date().toLocaleTimeString(),
            ...Object.entries(message.data.usageByIP).reduce(
              (acc, [ip, usage]) => ({
                ...acc,
                [`${ip}_rx`]: usage.rx,
                [`${ip}_tx`]: usage.tx,
              }),
              {}
            ),
          };
          return [...prev.slice(-60), newPoint];
        });
      } else if (message.type === "bandwidth_alert") {
        setAlerts((prev) => [...prev.slice(-9), message]);
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedIP]);

  const formatSpeed = (speed: number) => {
    if (speed >= 1000000) return `${(speed / 1000000).toFixed(2)} Mbps`;
    if (speed >= 1000) return `${(speed / 1000).toFixed(2)} Kbps`;
    return `${speed.toFixed(2)} Kbps`;
  };

  const getSpeedColor = (speed: number, type: "rx" | "tx") => {
    const threshold = type === "rx" ? peakUsage.rx : peakUsage.tx;
    const percentage = (speed / threshold) * 100;
    if (percentage > 80) return "text-red-600";
    if (percentage > 50) return "text-yellow-600";
    return type === "rx" ? "text-green-600" : "text-blue-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Monitor</h1>
          <p className="text-gray-500 mt-2">
            Detailed Client Bandwidth Usage Monitor
          </p>
        </div>
      </div>
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} className="border-yellow-500">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertTitle>Bandwidth Alert</AlertTitle>
              <AlertDescription>
                High usage detected from IP {alert.ip}:{" "}
                {formatSpeed(alert.usage)}
                <div className="text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Client Usage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(data.usageByIP).map(([ip, usage]) => (
          <Card key={ip} className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-bold">Client: {ip}</span>
                <Activity className="w-4 h-4 text-green-500 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Current Speed Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Download</span>
                    </div>
                    <span
                      className={`text-xl font-bold ${getSpeedColor(
                        usage.rx,
                        "rx"
                      )}`}
                    >
                      {formatSpeed(usage.rx)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Upload</span>
                    </div>
                    <span
                      className={`text-xl font-bold ${getSpeedColor(
                        usage.tx,
                        "tx"
                      )}`}
                    >
                      {formatSpeed(usage.tx)}
                    </span>
                  </div>
                </div>

                {/* Time Series Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient
                          id={`colorRx_${ip}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id={`colorTx_${ip}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-50"
                      />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatSpeed}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                        }}
                        formatter={(value: number) => [formatSpeed(value)]}
                      />
                      <Area
                        type="monotone"
                        dataKey={`${ip}_rx`}
                        name="Download"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill={`url(#colorRx_${ip})`}
                      />
                      <Area
                        type="monotone"
                        dataKey={`${ip}_tx`}
                        name="Upload"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill={`url(#colorTx_${ip})`}
                      />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Peak Download
                    </div>
                    <div className="font-semibold">
                      {formatSpeed(peakUsage.rx)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Peak Upload
                    </div>
                    <div className="font-semibold">
                      {formatSpeed(peakUsage.tx)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Total Downloaded
                    </div>
                    <div className="font-semibold">
                      {formatSpeed(totalTransferred.rx)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Total Uploaded
                    </div>
                    <div className="font-semibold">
                      {formatSpeed(totalTransferred.tx)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientComponent;