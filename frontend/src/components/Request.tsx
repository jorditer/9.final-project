import { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import api from "../services/api";
import { useFriends } from "../context/FriendsContext";

interface RequestProps {
  thisUser: string | null;
  onFriendshipChange: () => void;
  show?: boolean;
  setShow?: (show: boolean) => void;
  refreshRequests: () => void;
}

const Request: React.FC<RequestProps> = ({ 
  onFriendshipChange, 
  thisUser,
  show: externalShow,
  setShow: setExternalShow,
  refreshRequests,
}) => {
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [internalShow, setInternalShow] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const { refreshFriends } = useFriends();

  // Combine both show conditions
  const showPopup = typeof externalShow !== 'undefined' ? externalShow : internalShow;
  const handleRequestAction = async (friendUsername: string, action: 'accept' | 'reject') => {
    if (processingRequest) return;
      
    setProcessingRequest(friendUsername);
    try {
      await api.post(`/users/${thisUser}/friends/${action}/${friendUsername}`);
      const updatedRequests = pendingRequests.filter(username => username !== friendUsername);
      setPendingRequests(updatedRequests);
      
      if (updatedRequests.length === 0) {
        handleClose();
      }
      
      if (action === 'accept') {
        onFriendshipChange();
        refreshFriends();
      }
  
      refreshRequests(); // Add this here to update the count
    } catch (err) {
      console.error(`Error ${action}ing friend request:`, err);
    } finally {
      setProcessingRequest(null);
    }
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!thisUser) return;
      
      try {
        const response = await api.get(`/users/${thisUser}`);
        const user = response.data.data;
        setPendingRequests(user.pendingFriendRequests);
        setInternalShow(user.pendingFriendRequests.length > 0);
      } catch (err) {
        console.error("Error fetching pending friend requests:", err);
      }
    };

    const interval = setInterval(fetchPendingRequests, 30000);
    fetchPendingRequests();
    return () => clearInterval(interval);
  }, [thisUser]);

  const handleClose = () => {
    if (setExternalShow) {
      setExternalShow(false);
    }
    setInternalShow(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed top-16 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-72">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-dark" />
            <h2 className="text-lg font-semibold">Friend Requests</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2">
          {pendingRequests.map((username) => (
            <div 
              key={username} 
              className="p-3 mb-2 last:mb-0 bg-secondary border border-dark rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{username}</span>
                <div className="flex gap-2 text-sm font-semibold text-secondary">
                  <button
                    onClick={() => handleRequestAction(username, 'accept')}
                    disabled={processingRequest === username}
                    className={`px-4 py-1 rounded-md transition-colors
                      ${processingRequest === username
                        ? 'bg-gray-400'
                        : 'bg-green-500 hover:bg-green-600'
                      }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(username, 'reject')}
                    disabled={processingRequest === username}
                    className={`px-4 py-1 rounded-md transition-colors
                      ${processingRequest === username
                        ? 'bg-gray-400'
                        : 'bg-red-500 hover:bg-red-600'
                      }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingRequests.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No pending requests
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Request;