import React from "react";
import { Check, CheckCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DialogTitle } from "@radix-ui/react-dialog";
import { format, isThisYear, isToday, isYesterday } from "date-fns";

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

  const formatTimestamp = (date) => {
    if (isToday(date)) {
      return format(date, "hh:mm a"); // Show time if the date is today
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else if (isThisYear(date)) {
      return format(date, "MMM d"); // Show abbreviated month if within the current year
    } else {
      return format(date, "MMM d, yyyy"); // Show month, day, and year for older dates
    }
  };

  const avatar = chat.isGroupChat ? chat.avatar : chat.users[0].avatar;
  const username = chat.isGroupChat ? chat.chatName : chat.users[0].username;

  return (
    <div
      onClick={onClick}
      className={`chat-card flex items-center gap-x-2 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-md hover:transition-color ease-linear hover:duration-100 select-none cursor-pointer p-2 ${
        selected ? "bg-gray-200 dark:bg-zinc-800" : "bg-transparent"
      }`}
    >
      <Dialog>
        <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-11  w-auto aspect-square">
            <AvatarImage
              src={avatar}
              alt={`${username}'s avatar`}
              className="rounded-full object-cover"
            />
            <AvatarFallback>{username}</AvatarFallback>
          </Avatar>
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          className="max-h-[90vh] max-w-[90vw] sm:max-h-[70vh] sm:max-w-[70vh]"
        >
          <DialogTitle className="hidden">{username}</DialogTitle>
          <img
            src={avatar}
            alt={`${username}'s avatar`}
            className="w-full h-full object-cover rounded-lg"
          />
        </DialogContent>
      </Dialog>
      <div className="chat-card-details w-[75%] flex flex-col justify-between flex-1">
        <div className="chat-card-top flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate flex-1">
            {chat.isGroupChat ? chat.chatName : chat.users[0].username}
          </h3>
          <p className="max-w-fit text-xs text-gray-700 dark:text-zinc-400">
            {formatTimestamp(chat.latestMessage.timestamp)}
          </p>
        </div>
        <div className="chat-card-bottom flex items-center justify-between text-xs text-gray-700 dark:text-zinc-400 mt-[2px]">
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
