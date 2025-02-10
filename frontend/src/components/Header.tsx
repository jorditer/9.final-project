import { useState } from 'react';
import { Filter } from 'lucide-react';
import User from './User';

interface HeaderProps {
  thisUser: string | null;
  handleLogout: () => void;
  setEventsUser: (username: string) => void;
  setShowProfile: (showProfile: boolean) => void;
  onFilterChange: (filter: 'all' | 'day' | 'week' | 'month') => void;
}

const Header: React.FC<HeaderProps> = ({
  thisUser,
  handleLogout,
  setEventsUser,
  setShowProfile,
  onFilterChange,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');

  const handleFilterChange = (filter: 'all' | 'day' | 'week' | 'month') => {
    setTimeFilter(filter);
    onFilterChange(filter);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-primary/95 shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Left section with logo and filters */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <h1 className="text-3xl font-bold">EventPin</h1>
            
            {/* Desktop Filters */}
            <div className="hidden sm:flex bg-secondary/80 p-1 pe-2 rounded-lg">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timeFilter === 'all' 
                    ? 'bg-white shadow-sm text-gray-800' 
                    : 'text-gray-600 hover:bg-tertiary/60'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('day')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timeFilter === 'day' 
                    ? 'bg-white shadow-sm text-gray-800' 
                    : 'text-gray-600 hover:bg-tertiary/60'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleFilterChange('week')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timeFilter === 'week' 
                    ? 'bg-white shadow-sm text-gray-800' 
                    : 'text-gray-600 hover:bg-tertiary/60'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => handleFilterChange('month')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timeFilter === 'month' 
                    ? 'bg-white shadow-sm text-gray-800' 
                    : 'text-gray-600 hover:bg-tertiary/60'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* User Menu */}
          <User
            thisUser={thisUser}
            handleLogout={handleLogout}
            setEventsUser={setEventsUser}
            setShowProfile={setShowProfile}
          />
        </div>
      </div>

      {/* Mobile filter menu */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`p-2 rounded-md ${timeFilter === 'all' ? 'text-dark' : 'text-gray-600'}`}
          title="All Events"
        >
          <Filter className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleFilterChange('day')}
          className={`p-2 rounded-md ${timeFilter === 'day' ? 'text-dark' : 'text-gray-600'}`}
          title="Today's Events"
        >
          Today
        </button>
        <button
          onClick={() => handleFilterChange('week')}
          className={`p-2 rounded-md ${timeFilter === 'week' ? 'text-dark' : 'text-gray-600'}`}
          title="This Week's Events"
        >
          Week
        </button>
        <button
          onClick={() => handleFilterChange('month')}
          className={`p-2 rounded-md ${timeFilter === 'month' ? 'text-dark' : 'text-gray-600'}`}
          title="This Month's Events"
        >
          Month
        </button>
      </div>
    </header>
  );
};

export default Header;