import React from "react";
import { Check, CheckCheck } from "lucide-react";

export default function ChatCard({ chat, onClick, selected, currentUserId }) {
  const renderCheckIcon = () => {
    switch (chat.latestMessage.status) {
      case "sent":
        return <Check size={16} className="text-gray-500 dark:text-gray-400" />;
      case "delivered":
        return (
          <CheckCheck size={16} className="text-gray-500 dark:text-gray-400" />
        );
      case "seen":
        return (
          <CheckCheck size={16} className="text-blue-500 dark:text-blue-400" />
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      onClick={onClick}
      className={`chat-card flex items-center gap-x-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-md transition-color ease-linear duration-100 select-none cursor-pointer p-2 ${
        selected ? "bg-gray-200 dark:bg-zinc-800" : "bg-transparent"
      }`}
    >
      <img
        src={chat.isGroupChat ? chat.avatar : chat.users[0].avatar}
        alt={`${
          chat.isGroupChat ? chat.chatName : chat.users[0].username
        }'s avatar`}
        className="h-auto w-[20%] aspect-square rounded-full object-cover object-center"
      />
      <div className="chat-card-details w-[75%] flex flex-col justify-between flex-1">
        <div className="chat-card-top flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate flex-1">
            {chat.isGroupChat ? chat.chatName : chat.users[0].username}
          </h3>
          <p className="max-w-fit text-xs text-gray-700 dark:text-zinc-400">
            {formatTimestamp(chat.latestMessage.timestamp)}
          </p>
        </div>
        <div className="chat-card-bottom flex items-center justify-between text-xs text-gray-700 dark:text-zinc-400 mt-1">
          {renderCheckIcon()}
          <p className={`truncate max-w-full mx-[2px] mr-auto`}>
            {chat.latestMessage.content}
          </p>
          {/* {msgCount > 0 && (
            <span className="h-[18px] w-[18px] bg-blue-500 text-white rounded-full text-xs flex items-center justify-center ml-2">
              {msgCount}2
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
}
