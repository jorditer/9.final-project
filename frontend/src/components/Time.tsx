import React from 'react';
import { Calendar, Clock, Timer } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// First style: Visual timeline with icon and colored urgency indicator
const Time = ({ date }) => {
  const now = new Date();
  // const diffInHours = (new Date(date) - now) / (1000 * 60 * 60);
  
  // Determine urgency color based on how soon the event is
  const getUrgencyColor = () => {
    // if (diffInHours < 24) return 'bg-red-500';
    // if (diffInHours < 72) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
      <div className={`w-2 h-2 rounded-full ${getUrgencyColor()}`} />
      <Calendar className="w-5 h-5 text-gray-600" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {format(new Date(date), 'EEEE, MMMM d')}
        </span>
        <span className="text-xs text-gray-500">
          {format(new Date(date), 'h:mm a')}
        </span>
      </div>
      <span className="text-xs text-gray-400 italic">
        {formatDistanceToNow(new Date(date), { addSuffix: true })}
      </span>
    </div>
  );
};

export default Time;