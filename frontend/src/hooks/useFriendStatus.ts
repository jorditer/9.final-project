import { useState, useEffect } from 'react';
import api from '../services/api';

export type FriendStatus = "connect" | "connected" | "pending";

export const useFriendStatus = (thisUser: string | null, eventsUser: string | null) => {
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("connect");

  useEffect(() => {
    const fetchFriendStatus = async () => {
      // Early return if we don't have both users
      if (!thisUser || !eventsUser) {
        return;
      }
      
      try {
        const response = await api.get(`/users/${thisUser}`);
        const user = response.data.data;

        // Determine the friendship status based on user data
        if (user.friends.includes(eventsUser)) {
          setFriendStatus("connected");
        } else if (user.sentFriendRequests.includes(eventsUser)) {
          setFriendStatus("pending");
        } else {
          setFriendStatus("connect");
        }
      } catch (err) {
        console.error("Error fetching friend status:", err);
      }
    };

    fetchFriendStatus();
  }, [thisUser, eventsUser]); // Rerun when either user changes

  return { friendStatus, setFriendStatus };
};