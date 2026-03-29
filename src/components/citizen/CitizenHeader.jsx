import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Mock notifications
  const notifications = [];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    // Mock logout logic
    localStorage.removeItem("ecotrack_user");

    // Redirect to login or landing page
    navigate("/login");
  };

  return (
    <header className="h-16 w-full bg-white border-b border-gray-200 flex items-center px-6 relative">
      
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-green-600 rounded-sm" />
        <span className="text-xl font-semibold text-gray-800">
          EcoTrack
        </span>
      </div>

      <div className="flex-1" />

      {/* Right: Actions */}
      <div className="flex items-center gap-6 relative">
        
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-600 hover:text-gray-800"
          >
            🔔
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-2 h-4 w-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border rounded-lg z-50">
              <div className="p-4 border-b text-sm font-semibold">
                Notifications
              </div>

              <div className="p-4 text-sm text-gray-500">
                No notifications yet.
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
          U
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
