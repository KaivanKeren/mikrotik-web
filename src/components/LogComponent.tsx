import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw, WifiOff } from "lucide-react";

interface LogEntry {
  time: string;
  message: string;
  user?: string;
  address?: string;
  topics?: string[];
}

interface LogsState {
  system: LogEntry[];
  hotspot: LogEntry[];
}

const LogComponent: React.FC = () => {
  const [logs, setLogs] = useState<LogsState>({ system: [], hotspot: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3030/api/logs/all");
        const data: LogEntry[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response structure");
        }

        // Pisahkan log berdasarkan topics
        const systemLogs = data.filter(
          (log) => !log.topics.includes("hotspot")
        );
        const hotspotLogs = data.filter((log) =>
          log.topics.includes("hotspot")
        );

        setLogs({
          system: systemLogs,
          hotspot: hotspotLogs,
        });

        setError(null);
      } catch (err) {
        setError("Failed to fetch logs");
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatTime = (timeStr: string): string => {
    return new Date(timeStr).toLocaleString();
  };

  const renderLogEntry = (log: LogEntry, type: "system" | "hotspot") => {
    const isHotspot = type === "hotspot";
  
    return (
      <div
        key={`${log.time}-${log.message}`}
        className="border-b border-gray-200 p-4 hover:bg-gray-50"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-gray-500">{formatTime(log.time)}</p>
  
            {isHotspot && log.user && (
              <p className="text-sm font-medium text-blue-600">
                User: {log.user}
              </p>
            )}
  
            {isHotspot && log.address && (
              <p className="text-sm text-gray-600">IP: {log.address}</p>
            )}
  
            {/* Perbaikan: Pastikan topics diubah menjadi array sebelum dipetakan */}
            {!isHotspot && log.topics && (
              <div className="flex gap-2 mt-1">
                {log.topics?.split(",").map((topic: string, i: React.Key | null | undefined) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {topic.trim()}
                  </span>
                ))}
              </div>
            )}
  
            <p className="mt-2 text-sm text-gray-700">{log.message}</p>
          </div>
        </div>
      </div>
    );
  };  

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>MikroTik Logs</CardTitle>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system">System Logs</TabsTrigger>
            <TabsTrigger value="hotspot">Hotspot Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading system logs...</p>
                </div>
              ) : (
                logs.system?.map((log) => renderLogEntry(log, "system"))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="hotspot">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading hotspot logs...</p>
                </div>
              ) : (
                logs.hotspot.map((log) => renderLogEntry(log, "hotspot"))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LogComponent;
