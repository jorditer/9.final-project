import { useState, useEffect } from "react";
import api from "../services/api";
import axios from "axios";

interface RequestProps {
  thisUser: string | null;
  onFriendshipChange: () => void;
}

const Request: React.FC<RequestProps> = ({ onFriendshipChange, thisUser }) => {
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      // Don't make the request if there's no user
      if (!thisUser) return;
      
      try {
        const response = await api.get(`/users/${thisUser}`);
        const user = response.data.data;
        setPendingRequests(user.pendingFriendRequests);
        setShowPopup(user.pendingFriendRequests.length > 0);
      } catch (err) {
        console.error("Error fetching pending friend requests:", err);
      }
    };

    fetchPendingRequests();
  }, [thisUser]);

  const handleAccept = async (friendUsername: string) => {
    try {
      // Remove '/api' prefix
      await api.post(`/users/${thisUser}/friends/accept/${friendUsername}`);
      const updatedRequests = pendingRequests.filter(username => username !== friendUsername);
      setPendingRequests(updatedRequests);
      setShowPopup(updatedRequests.length > 0);
      onFriendshipChange();
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const handleReject = async (friendUsername: string) => {
    try {
      // Remove '/api' prefix
      await api.post(`/users/${thisUser}/friends/reject/${friendUsername}`);
      const updatedRequests = pendingRequests.filter(username => username !== friendUsername);
      setPendingRequests(updatedRequests);
      setShowPopup(updatedRequests.length > 0);
    } catch (err) {
      console.error("Error rejecting friend request:", err);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
        {pendingRequests.map((username) => (
          <div key={username} className="flex justify-between items-center mb-2">
            <span>{username}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(username)}
                className="px-2 py-1 bg-green-500 text-white rounded-md"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(username)}
                className="px-2 py-1 bg-red-500 text-white rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {pendingRequests.length === 0 && <p className="text-gray-500 text-center">No pending requests</p>}
      </div>
    </div>
  );
};

export default Request;