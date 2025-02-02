import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, MapPin } from 'lucide-react';
import api from "../services/api";  // Add this import at the top

interface SearchBarProps {
  setEventsUser: (username: string) => void;
  setShowProfile: (showProfile: boolean) => void;
  onLocationSelect?: (lat: number, long: number) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ setEventsUser, setShowProfile, onLocationSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchMode, setSearchMode] = useState<'users' | 'places'>('users');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Remove '/api' prefix
        const res = await api.get('/users');
        const usernames = res.data.data.map((user: { username: string }) => user.username);
        setUsers(usernames);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowResults(true);
  
    if (searchMode === 'places' && value.length >= 2) {
      try {
        // This stays as axios since it's an external API
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`,
          {
            params: {
              access_token: import.meta.env.VITE_MAPBOX_TOKEN,
              proximity: '2.168365,41.387098',
              language: 'en'
            }
          }
        );
        setPlaces(response.data.features);
      } catch (err) {
        console.error('Error searching places:', err);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="fixed top-[0.1rem] sm:top-2 left-2 sm:left-4 z-10">
      <div className="flex items-center gap-1">
        {/* Mode Toggle Buttons - These allow switching between user and place search */}
        <div className="flex gap-1 p-1 rounded-md ">
          <button
            onClick={() => {
              setSearchMode('users');
              setInputValue('');
              setShowResults(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              searchMode === 'users' 
                ? 'bg-gray-100 text-black' 
                : 'hover:bg-gray-200'
            }`}
            title="Search Users"
          >
            <Users size={18} />
          </button>
          <button
            onClick={() => {
              setSearchMode('places');
              setInputValue('');
              setShowResults(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              searchMode === 'places' 
                ? 'bg-gray-100 text-black' 
                : 'hover:bg-gray-200'
            }`}
            title="Search Places"
          >
            <MapPin size={18} />
          </button>
        </div>

        {/* Search Input and Results Dropdown */}
        <div className="relative">
          <input
          id="user"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowResults(true)}
            placeholder={searchMode === 'users' ? "Search users..." : "Search places..."}
            className="px-3 py-2 border border-black text-base rounded-xl bg-white/90 w-64"
          />
        
          {/* Results Dropdown - Shows when there's input and search is active */}
          {showResults && inputValue && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-400 rounded-md shadow-lg max-h-96 overflow-y-auto">
              {/* User Results */}
              {searchMode === 'users' && filteredUsers.map((username) => (
                <button
                  key={username}
                  onClick={() => {
                    setEventsUser(username);
                    setInputValue(username);
                    setShowProfile(true);
                    setShowResults(false);
                  }}
                  className="ps-3 w-[96%] py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <Users size={16} className="text-gray-600" />
                  {username}
                </button>
              ))}
              
              {/* Place Results */}
              {searchMode === 'places' && places.map((place) => (
                <button
                  key={place.id}
                  onClick={() => {
                    if (onLocationSelect) {
                      onLocationSelect(place.center[1], place.center[0]);
                    }
                    setInputValue(place.place_name);
                    setShowResults(false);
                  }}
                  className="ps-3 w-[96%] py-1.5 text-left hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-600 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{place.text}</span>
                      <span className="text-xs text-gray-500 truncate">
                        {place.context?.[0]?.text || 'Barcelona'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {/* Empty State Messages */}
              {searchMode === 'users' && filteredUsers.length === 0 && (
                <div className="px-3 py-2 text-gray-500">No users found</div>
              )}
              
              {searchMode === 'places' && places.length === 0 && (
                <div className="px-3 py-2 text-gray-500">No places found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;