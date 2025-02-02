import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogOut, UserCircle } from 'lucide-react';

interface UserProps {
  thisUser: string | null;
  handleLogout: () => void;
  setEventsUser: (username: string) => void;
  setShowProfile: (show: boolean) => void;
}

const User: React.FC<UserProps> = ({ 
  thisUser, 
  handleLogout, 
  setEventsUser, 
  setShowProfile 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

// View Profile
  const handleViewProfile = () => {
    if (thisUser) {
      setEventsUser(thisUser);
      setShowProfile(true);
      setIsDropdownOpen(false);
    }
  };

  // Logout
  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    handleLogout();
  };

  if (!thisUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="rounded-xl p-2 text-base opacity-70 flex items-center justify-center text-white font-semibold text-center bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 absolute top-1 sm:top-2 right-1 sm:right-3 text-nowrap"
      >
        <UserIcon />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-2 mt-12 sm:mt-14 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleViewProfile}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <UserCircle className="w-4 h-4" />
              My Profile
            </button>
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
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