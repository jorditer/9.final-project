import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SearchBarProps {
  setEventsUser: (username: string) => void;
  setShowProfile: (showProfile: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ setEventsUser, setShowProfile }) => {
  const [inputValue, setInputValue] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        // Update this line to match the response structure
        const usernames = res.data.data.map((user: { username: string }) => user.username);
        setUsers(usernames);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleUserSelect = (username: string) => {
    setEventsUser(username);
    setInputValue(username);
    setShowProfile(true);
    setShowResults(false);
  };

  return (
    <div className="fixed top-[0.1rem] sm:top-2 left-2 sm:left-4 z-10">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Search users..."
        className="px-3 py-2 border border-black text-base rounded-md bg-white/90"
      />
      
      {showResults && inputValue && filteredUsers.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {filteredUsers.map((username) => (
            <button
              key={username}
              onClick={() => handleUserSelect(username)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100"
            >
              {username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;