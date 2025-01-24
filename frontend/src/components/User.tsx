import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface UserProps {
  thisUser: string | null;
  handleLogout: () => void;
}

const User: React.FC<UserProps> = ({ thisUser, handleLogout }) => {
  if (!thisUser) return null;

  return (
    <button
      onClick={handleLogout}
      className="p-2 text-base opacity-70 flex items-center justify-center text-white font-semibold text-center bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 absolute top-1 sm:top-2 right-2 sm:right-4 text-nowrap login"
    >
		<UserIcon/>
    </button>
  );
};

export default User;