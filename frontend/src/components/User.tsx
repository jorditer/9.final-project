import { useState, useRef, useEffect } from "react";
import { User as UserIcon, LogOut, UserCircle, UserPlus } from "lucide-react";
import api from "../services/api";

interface UserProps {
  thisUser: string | null;
  handleLogout: () => void;
  setEventsUser: (username: string) => void;
  setShowProfile: (show: boolean) => void;
  setShowRequests: (show: boolean) => void;
  refreshRequests: () => void; 
}

const User: React.FC<UserProps> = ({ 
  thisUser, 
  handleLogout, 
  setEventsUser, 
  setShowProfile,
  setShowRequests,
  refreshRequests,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetchPendingRequests();
  }, [refreshRequests]);

  const fetchPendingRequests = async () => {
    if (!thisUser) return;
    
    try {
      const response = await api.get(`/users/${thisUser}`);
      const user = response.data.data;
      setPendingRequestsCount(user.pendingFriendRequests.length);
    } catch (err) {
      console.error("Error fetching pending friend requests:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPendingRequests, 30000);
    fetchPendingRequests();
    return () => clearInterval(interval);
  }, [thisUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    if (thisUser) {
      setEventsUser(thisUser);
      setShowProfile(true);
      setIsDropdownOpen(false);
    }
  };

  const handleViewRequests = () => {
    setShowRequests(true);
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowProfile(false);
    setShowRequests(false);
    handleLogout();
  };

  if (!thisUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="rounded-full p-2 text-base opacity-70 flex items-center justify-center text-white font-semibold 
                   bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br 
                   focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 relative"
      >
        <UserIcon className="w-5 h-5" />
        {pendingRequestsCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {pendingRequestsCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="z-50 absolute right-0 mt-2.5 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleViewProfile}
              className="w-[96%] px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <UserCircle className="w-4 h-4" />
              My Profile
            </button>
            {pendingRequestsCount > 0 && (
              <button
                onClick={handleViewRequests}
                className="w-[96%] px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 relative"
              >
                <UserPlus className="w-4 h-4" />
                Friend Requests
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              </button>
            )}
            <button
              onClick={handleLogoutClick}
              className="w-[96%] px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;