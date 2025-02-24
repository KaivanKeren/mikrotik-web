import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  ArrowUpDown,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface User {
  username: string;
  profile: string;
  disabled: boolean;
  bytesIn: number;
  bytesOut: number;
  uptime: number;
  ip?: string;
  mac?: string;
  lastSeen?: string;
}

interface SortConfig {
  key: keyof User;
  direction: "asc" | "desc";
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "username",
    direction: "asc",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await fetch("http://localhost:3030/api/users");
      const data: User[] = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchUserDetails = async (username: string): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:3030/api/users/${username}`
      );
      const data: User = await response.json();
      setSelectedUser(data);
      setShowUserDetails(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleSort = (key: keyof User) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const filteredAndSortedUsers = users
    .filter((user) =>
      Object.values(user).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortConfig.direction === "asc") {
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      }
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    });

  return (
    <div className="w-full h-full p-4 space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Hotspot Users Management
          </CardTitle>
          <CardDescription>
            Comprehensive view of all hotspot users with real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => fetchUsers()}>
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("username")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Username
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead
                      onClick={() => handleSort("bytesIn")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Download
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("bytesOut")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Upload
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("uptime")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        Uptime
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.username} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.profile}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.disabled ? "destructive" : "default"}
                        >
                          {user.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(user.bytesIn)}</TableCell>
                      <TableCell>{formatBytes(user.bytesOut)}</TableCell>
                      <TableCell>{formatUptime(user.uptime)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => fetchUserDetails(user.username)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {user.disabled ? "Enable User" : "Disable User"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-500">Username</h4>
                  <p>{selectedUser.username}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Profile</h4>
                  <p>{selectedUser.profile}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Status</h4>
                  <Badge
                    variant={selectedUser.disabled ? "destructive" : "default"}
                  >
                    {selectedUser.disabled ? "Disabled" : "Active"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Uptime</h4>
                  <p>{formatUptime(selectedUser.uptime)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Download</h4>
                  <p>{formatBytes(selectedUser.bytesIn)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Upload</h4>
                  <p>{formatBytes(selectedUser.bytesOut)}</p>
                </div>
                {selectedUser.ip && (
                  <div>
                    <h4 className="font-medium text-gray-500">IP Address</h4>
                    <p>{selectedUser.ip}</p>
                  </div>
                )}
                {selectedUser.mac && (
                  <div>
                    <h4 className="font-medium text-gray-500">MAC Address</h4>
                    <p>{selectedUser.mac}</p>
                  </div>
                )}
                {selectedUser.lastSeen && (
                  <div>
                    <h4 className="font-medium text-gray-500">Last Seen</h4>
                    <p>{new Date(selectedUser.lastSeen).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
