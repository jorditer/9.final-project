// Connect.tsx
import { useState, useEffect } from "react";
import axios from "axios";

interface ConnectProps {
  thisUser: string;
  eventsUser: string;
  onFriendshipChange: () => void;
  friendStatus: "connect" | "connected" | "pending";
  setFriendStatus: (status: "connect" | "connected" | "pending") => void;
}

const Connect: React.FC<ConnectProps> = ({ 
  onFriendshipChange, 
  thisUser, 
  eventsUser,
  friendStatus,
  setFriendStatus
}) => {
  const handleFriendAction = async () => {
    try {
      if (friendStatus === "connect") {
        await axios.post(`/api/users/${thisUser}/friends/request/${eventsUser}`);
        setFriendStatus("pending");
      } else if (friendStatus === "connected") {
        await axios.delete(`/api/users/${thisUser}/friends/${eventsUser}`);
        setFriendStatus("connect");
      }
      onFriendshipChange();
    } catch (err) {
      console.error("Error updating friend status:", err);
    }
  };

  const getButtonText = () => {
    if (friendStatus === "connected") {
      return "Connected";
    } else if (friendStatus === "pending") {
      return "Pending";
    }
    return "Connect";
  };

  return (
    <button
      onClick={handleFriendAction}
      className={`-mb-2 group relative h-8 w-20 flex items-center justify-center 
        overflow-hidden overflow-x-hidden rounded-md px-4 text-neutral-50 ${
        friendStatus === "connected"
          ? "bg-blue-500"
          : friendStatus === "pending"
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-neutral-950"
      }`}
    >
      <span className="relative z-10 transition-opacity duration-300">
        {friendStatus === "connected" ? (
          <>
            <span className="group-hover:hidden">Connected</span>
            <span className="hidden group-hover:inline">Disconnect</span>
          </>
        ) : (
          getButtonText()
        )}
      </span>
      <span className="absolute inset-0 overflow-hidden rounded-md">
        <span 
          className={`absolute left-0 aspect-square w-full origin-center 
          -translate-x-full rounded-full transition-transform duration-500 ${
          friendStatus === "pending"
            ? "pointer-events-none"
            : friendStatus === "connected"
            ? "bg-red-500 group-hover:-translate-x-0 group-hover:scale-150"
            : "bg-blue-600 group-hover:-translate-x-0 group-hover:scale-150"
        }`}
        />
      </span>
    </button>
  );
};

export default Connect;