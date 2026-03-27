import React, { useEffect, useState, useRef } from "react";
import API from "../api/api";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await API.get("/users/notifications/unread-count");
      setCount(res.data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/notifications?limit=5");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  const toggleDropdown = () => {
    setOpen(!open);
    if (!open) fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/users/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      fetchCount();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative font-['Nunito']" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={`relative px-5 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 outline-none cursor-pointer flex items-center justify-center shadow-sm transform hover:-translate-y-0.5 active:scale-95 ${
          open
            ? "bg-[#6C5CE7] text-[#FFFFFF] shadow-md"
            : "bg-[#F5F6FA] text-[#2D3436] hover:bg-[#FFFFFF] hover:text-[#6C5CE7] hover:border-[#6C5CE7] border border-transparent"
        }`}
      >
        Alerts
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-[#FFFFFF] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-pulse border-2 border-[#FFFFFF]">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#FFFFFF] shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[24px] border border-[#F5F6FA] z-50 overflow-hidden flex flex-col transform origin-top-right transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-5 border-b border-[#F5F6FA] bg-[#F5F6FA] bg-opacity-50 flex items-center justify-between">
            <span className="text-[12px] font-black text-[#6C5CE7] uppercase tracking-[0.2em] m-0">
              Notifications
            </span>
            {count > 0 && (
              <span className="text-[9px] font-black text-[#2D3436] opacity-40 uppercase tracking-widest bg-[#FFFFFF] px-2 py-1 rounded-[8px] shadow-sm">
                {count} Unread
              </span>
            )}
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 bg-[#FFFFFF]">
              <div className="w-8 h-8 border-4 border-[#F5F6FA] border-t-[#6C5CE7] rounded-full animate-spin"></div>
              <span className="text-[10px] font-black text-[#6C5CE7] uppercase tracking-widest animate-pulse m-0">
                Syncing Data...
              </span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center bg-[#FFFFFF]">
              <p className="text-[11px] font-black text-[#2D3436] opacity-30 uppercase tracking-[0.2em] m-0">
                Inbox is completely clear
              </p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto no-scrollbar flex flex-col bg-[#FFFFFF]">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`p-6 border-b border-[#F5F6FA] last:border-none cursor-pointer transition-all duration-300 group hover:bg-[#F5F6FA]/50 relative ${
                    !n.isRead ? "bg-[#6C5CE7]/5" : "bg-[#FFFFFF]"
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6C5CE7] shadow-[2px_0_10px_rgba(108,92,231,0.5)]"></div>
                  )}
                  <p
                    className={`text-[13px] font-black m-0 leading-tight transition-colors duration-300 ${!n.isRead ? "text-[#6C5CE7]" : "text-[#2D3436] group-hover:text-[#6C5CE7]"}`}
                  >
                    {n.title}
                  </p>
                  <p className="text-[11px] font-bold text-[#2D3436] opacity-60 mt-2 leading-relaxed m-0">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
