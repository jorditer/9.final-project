import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface FriendsContextType {
  friendsList: string[];
  refreshFriends: () => void;
}

const FriendsContext = createContext<FriendsContextType | null>(null);

export const FriendsProvider = ({ children, thisUser }: { children: ReactNode, thisUser: string | null }) => {
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const fetchFriends = async () => {
      if (thisUser) {
        try {
          const response = await api.get(`/users/${thisUser}`);
          setFriendsList(response.data.data.friends);
        } catch (err) {
          console.error("Error fetching friends list:", err);
        }
      }
    };
    fetchFriends();
  }, [thisUser, refreshCounter]);

  const refreshFriends = () => setRefreshCounter(prev => prev + 1);

  return (
    <FriendsContext.Provider value={{ friendsList, refreshFriends }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}; 