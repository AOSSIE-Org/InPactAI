import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { format } from "date-fns";

// Placeholder icons for categories
const categoryIcons: Record<string, string> = {
  welcome: "👋",
  message: "💬",
  campaign: "📢",
  default: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:8000/notifications/", {
          headers: {
            "x-user-id": "test-user-id", // Replace with real user id or auth token
          },
        });
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err: any) {
        setError(err.message || "Error fetching notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(notifications.map((n) => n.id));
  };

  const deselectAll = () => {
    setSelected([]);
  };

  const deleteSelected = async () => {
    try {
      await fetch("http://localhost:8000/notifications/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user-id",
        },
        body: JSON.stringify(selected),
      });
      setNotifications((prev) => prev.filter((n) => !selected.includes(n.id)));
      setSelected([]);
    } catch (err) {
      alert("Failed to delete notifications");
    }
  };

  const deleteAll = async () => {
    try {
      await fetch("http://localhost:8000/notifications/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "test-user-id",
        },
        body: JSON.stringify(notifications.map((n) => n.id)),
      });
      setNotifications([]);
      setSelected([]);
    } catch (err) {
      alert("Failed to delete notifications");
    }
  };

  const getIcon = (category: string) => categoryIcons[category] || categoryIcons.default;

  const handleOpenDialog = async (n: any) => {
    if (!n.is_read) {
      try {
        await fetch("http://localhost:8000/notifications/mark-read", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "test-user-id",
          },
          body: JSON.stringify([n.id]),
        });
        setNotifications((prev) => prev.map((notif) => notif.id === n.id ? { ...notif, is_read: true } : notif));
      } catch (err) {
        // ignore error for now
      }
    }
    setOpenDialog(n);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">Notifications</h1>
      <div className="flex gap-2 mb-6">
        <Button onClick={selectAll} size="sm">Select All</Button>
        <Button onClick={deselectAll} size="sm" variant="outline">Deselect All</Button>
        <Button onClick={deleteSelected} size="sm" variant="destructive" disabled={selected.length === 0}>Delete Selected</Button>
        <Button onClick={deleteAll} size="sm" variant="destructive" disabled={notifications.length === 0}>Delete All</Button>
      </div>
      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-xl shadow overflow-hidden">
          {notifications.length === 0 && <li className="py-12 text-center text-gray-400">No notifications</li>}
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-center gap-4 py-5 px-4 cursor-pointer transition
                ${n.is_read
                  ? "bg-gray-100 text-gray-400 opacity-60"
                  : "bg-white text-gray-800 hover:bg-purple-50"}
              `}
              onClick={() => handleOpenDialog(n)}
            >
              <input
                type="checkbox"
                checked={selected.includes(n.id)}
                onChange={e => { e.stopPropagation(); toggleSelect(n.id); }}
                className="form-checkbox h-5 w-5 text-purple-600"
                onClick={e => e.stopPropagation()}
              />
              <span className="text-2xl">{getIcon(n.category)}</span>
              <div className="flex-1">
                <div className={`text-lg ${n.is_read ? "font-normal text-gray-500" : "font-semibold text-gray-800"}`}>{n.title}</div>
                <div className={`text-sm ${n.is_read ? "text-gray-400" : "text-gray-600"} line-clamp-1`}>{n.message}</div>
              </div>
              <div className={`text-xs ml-2 whitespace-nowrap ${n.is_read ? "text-gray-300" : "text-gray-400"}`}>{format(new Date(n.created_at), "PPpp")}</div>
              {!n.is_read && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" title="Unread"></span>}
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!openDialog} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          {openDialog && (
            <>
              <DialogHeader>
                <span className="text-3xl mb-2">{getIcon(openDialog.category)}</span>
                <DialogTitle className="text-xl mt-2">{openDialog.title}</DialogTitle>
                <DialogDescription className="text-gray-500 mb-2">
                  {format(new Date(openDialog.created_at), "PPpp")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-base text-gray-700">{openDialog.message}</div>
              <DialogFooter>
                <Button onClick={() => setOpenDialog(null)} variant="outline">Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 