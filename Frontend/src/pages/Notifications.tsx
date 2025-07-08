import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";
import { ArrowLeft } from "lucide-react";
import { UserNav } from "../components/user-nav";
import { useNavigate } from "react-router-dom";

const categoryIcons: Record<string, string> = {
  welcome: "👋",
  message: "💬",
  campaign: "📢",
  default: "🔔",
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch the user's access token on mount
  useEffect(() => {
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      setAccessToken(data.session?.access_token || null);
    };
    getToken();
  }, []);

  // Fetch notifications from backend
  useEffect(() => {
    if (!accessToken || !user) return;
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:8000/notifications/", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
        });
        if (res.status === 401) throw new Error("Unauthorized. Please log in again.");
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
        setError("");
      } catch (err: any) {
        setError(err.message || "Error fetching notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [accessToken, user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to new notifications for this user
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => {
            // Avoid duplicates
            if (prev.some((n) => n.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await fetch("http://localhost:8000/notifications/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(selected),
      });
      setNotifications((prev) => prev.filter((n) => !selected.includes(n.id)));
      setSelected([]);
      setSuccessMsg("Selected notifications deleted.");
    } catch (err) {
      setError("Failed to delete notifications");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAll = async () => {
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await fetch("http://localhost:8000/notifications/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(notifications.map((n) => n.id)),
      });
      setNotifications([]);
      setSelected([]);
      setSuccessMsg("All notifications deleted.");
    } catch (err) {
      setError("Failed to delete notifications");
    } finally {
      setActionLoading(false);
    }
  };

  const getIcon = (category: string) => categoryIcons[category] || categoryIcons.default;

  const handleOpenDialog = async (n: any) => {
    setError("");
    setSuccessMsg("");
    if (!n.is_read) {
      setActionLoading(true);
      try {
        await fetch("http://localhost:8000/notifications/mark-read", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify([n.id]),
        });
        setNotifications((prev) => prev.map((notif) => notif.id === n.id ? { ...notif, is_read: true } : notif));
        setSuccessMsg("Notification marked as read.");
      } catch (err) {
        setError("Failed to mark notification as read");
      } finally {
        setActionLoading(false);
      }
    }
    setOpenDialog(n);
  };

  const dismissError = () => setError("");
  const dismissSuccess = () => setSuccessMsg("");

  if (!isAuthenticated) {
    return <div className="py-12 text-center text-gray-400">Please log in to view notifications.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
        <h1 className="text-3xl font-bold text-purple-700 flex-1 text-center">Notifications</h1>
        <button
          className="ml-auto p-2 rounded-full hover:bg-gray-100 text-gray-500"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded relative flex items-center justify-between">
          <span>{error}</span>
          <button onClick={dismissError} className="ml-4 text-lg font-bold">&times;</button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded relative flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={dismissSuccess} className="ml-4 text-lg font-bold">&times;</button>
        </div>
      )}
      <div className="flex gap-2 mb-6">
        <Button onClick={selectAll} size="sm" disabled={actionLoading}>Select All</Button>
        <Button onClick={deselectAll} size="sm" variant="outline" disabled={actionLoading}>Deselect All</Button>
        <Button onClick={deleteSelected} size="sm" variant="destructive" disabled={selected.length === 0 || actionLoading}>Delete Selected</Button>
        <Button onClick={deleteAll} size="sm" variant="destructive" disabled={notifications.length === 0 || actionLoading}>Delete All</Button>
      </div>
      {loading ? (
        <div className="py-12 text-center text-gray-400">
          <svg className="animate-spin h-8 w-8 mx-auto text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Loading...
        </div>
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
                disabled={actionLoading}
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