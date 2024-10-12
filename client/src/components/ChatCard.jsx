import { Check, CheckCheck } from "lucide-react";
import React from "react";

function ChatCard({
  avatar,
  username,
  latestMsg,
  msgStatus,
  lastSeen,
  msgCount,
}) {
  const renderCheckIcon = () => {
    switch (msgStatus) {
      case "sent":
        return <Check size={18} className="text-gray-500 dark:text-gray-400" />;
      case "delivered":
        return (
          <CheckCheck size={18} className="text-gray-500 dark:text-gray-400" />
        );
      case "seen":
        return (
          <CheckCheck size={18} className="text-blue-500 dark:text-blue-400" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="chat-card h-[60px] flex items-center gap-x-2 hover:bg-slate-300 dark:hover:bg-zinc-700 rounded-md transition-color ease-linear duration-100 select-none cursor-pointer p-2">
      <img
        src={avatar}
        alt={`${username}'s avatar`}
        className="h-full aspect-square rounded-full object-cover object-center"
      />
      <div className="chat-card-details flex flex-col justify-between flex-1">
        <div className="chat-card-top flex items-center justify-between">
          <h3 className="font-semibold truncate max-w-[120px]">{username}</h3>
          <div className="flex items-center gap-x-1 text-xs text-gray-500 dark:text-gray-400">
            {renderCheckIcon()}
            <p>{lastSeen && lastSeen}</p>
          </div>
        </div>
        <div className="chat-card-bottom flex items-center justify-between text-sm">
          <p className="truncate max-w-[150px]">{latestMsg}</p>
          {msgCount > 0 && (
            <span className="bg-blue-500 text-white rounded-full text-xs h-[18px] w-[18px] flex items-center justify-center">
              {msgCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatCard;
