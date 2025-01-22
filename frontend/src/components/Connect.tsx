import { useState, useEffect } from "react";
import axios from "axios";

interface ConnectProps {
  thisUser: string;
  eventsUser: string;
}

const Connect: React.FC<ConnectProps> = ({ thisUser, eventsUser }) => {
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
    } catch (err) {
      console.error("Error updating friend status:", err);
    }
  };

  return (
    <button
      onClick={handleFriendAction}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`group relative h-12 overflow-hidden overflow-x-hidden rounded-md px-4 text-neutral-50 ${
        friendStatus === 'connected'
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          : 'bg-neutral-950 hover:bg-blue-600'
      }`}
    >
      <span className="relative z-10">
        {friendStatus === 'connected' && hovering ? 'Disconnect' : friendStatus === 'connected' ? 'Connected' : friendStatus === 'pending' ? 'Pending' : 'Connect'}
      </span>
      <span className="absolute inset-0 overflow-hidden rounded-md">
        <span className="absolute left-0 aspect-square w-full origin-center -translate-x-full rounded-full bg-blue-500 transition-all duration-500 group-hover:-translate-x-0 group-hover:scale-150"></span>
      </span>
    </button>
  );
};

export default Connect;