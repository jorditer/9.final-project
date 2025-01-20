import React from 'react';
import Pin from '../interfaces/Pin';
import Time from './Time';
import { formatDistanceToNow } from 'date-fns';

interface ProfileProps {
  showProfile: boolean;
  thisUser: string | null;
  pins: Pin[];
}

const Profile: React.FC<ProfileProps> = ({ showProfile, thisUser, pins }) => {
  const userEvents = pins.filter(pin => pin.username === thisUser);

  return (
    <div
      className={`fixed mx-2 bottom-2 w-[calc(100%-1rem)] h-1/3 bg-white transition-all duration-700 ease-in-out transform ${
        showProfile ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      } overflow-hidden rounded-t-lg`}
    >
      <div className="h-full p-4 flex gap-4">
        {/* Profile Section */}
        <div className="flex flex-col items-center w-1/4">
          <div className="w-20 h-20 bg-black rounded-full mb-2" />
          <span className="font-semibold text-center">{thisUser}</span>
        </div>

        {/* Events Section */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="font-bold mb-2">My Events</h3>
          <div className="flex flex-col gap-3">
            {userEvents.map((event) => (
              <div key={event._id} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.location}</p>
                <p className="text-sm">{event.description}</p>
                <div className="text-sm text-gray-500 mt-1">
                  <Time date={event.date} />
                  <span className="ml-2">
                    ({formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })})
                  </span>
                </div>
              </div>
            ))}
            {userEvents.length === 0 && (
              <p className="text-gray-500 text-center">No events created yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;