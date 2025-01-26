import { useState, useEffect } from "react";
import axios from "axios";

interface ConnectProps {
  thisUser: string;
  eventsUser: string;
  onFriendshipChange: () => void;
}

const Connect: React.FC<ConnectProps> = ({ onFriendshipChange, thisUser, eventsUser }) => {
  const [friendStatus, setFriendStatus] = useState<'connect' | 'connected' | 'pending'>('connect');
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fetchFriendStatus = async () => {
      try {
        const response = await axios.get(`/api/users/${thisUser}`);
        const user = response.data.data;

        if (user.friends.includes(eventsUser)) {
          setFriendStatus('connected');
        } else if (user.sentFriendRequests.includes(eventsUser)) {
          setFriendStatus('pending');
        } else {
          setFriendStatus('connect');
        }
      } catch (err) {
        console.error("Error fetching friend status:", err);
      }
    };

    fetchFriendStatus();
  }, [thisUser, eventsUser]);

  const handleFriendAction = async () => {
    try {
      if (friendStatus === 'connect') {
        await axios.post(`/api/users/${thisUser}/friends/request/${eventsUser}`);
        setFriendStatus('pending');
      } else if (friendStatus === 'connected') {
        await axios.delete(`/api/users/${thisUser}/friends/${eventsUser}`);
        setFriendStatus('connect');
      }
      onFriendshipChange();
    } catch (err) {
      console.error("Error updating friend status:", err);
    }
  };

  const getButtonText = () => {
    if (friendStatus === 'connected') {
      return hovering ? 'Disconnect' : 'Connected';
    } else if (friendStatus === 'pending') {
      return 'Pending';
    } else {
      return 'Connect';
    }
  };

  return (
    <button
      onClick={handleFriendAction}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`-mb-2 group relative h-8 w-20 flex items-center justify-center overflow-hidden overflow-x-hidden rounded-md px-4 text-neutral-50 ${
        friendStatus === 'connected'
          ? hovering
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-gray-300 text-gray-800'
          : friendStatus === 'pending'
          ? 'bg-blue-500 cursor-not-allowed'
          : 'bg-neutral-950 hover:bg-blue-600'
      }`}
    >
      <span className="relative z-10">
        {getButtonText()}
      </span>
      <span className="absolute inset-0 overflow-hidden rounded-md">
        <span className={`absolute left-0 aspect-square w-full origin-center -translate-x-full rounded-full transition-all duration-500 ${
          friendStatus === 'connected' && hovering
            ? 'bg-red-500 group-hover:-translate-x-0 group-hover:scale-150'
            : 'bg-blue-500 group-hover:-translate-x-0 group-hover:scale-150'
        }`}></span>
      </span>
    </button>
  );
};

export default Connect;