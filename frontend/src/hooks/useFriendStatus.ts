// hooks/useFriendStatus.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export type FriendStatus = "connect" | "connected" | "pending";

export const useFriendStatus = (thisUser: string | null, eventsUser: string | null) => {
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("connect");

  useEffect(() => {
    const fetchFriendStatus = async () => {
      if (!thisUser || !eventsUser) return;
      
      try {
        const response = await axios.get(`/api/users/${thisUser}`);
        const user = response.data.data;
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
  }, [thisUser, eventsUser]);

  return { friendStatus, setFriendStatus };
};