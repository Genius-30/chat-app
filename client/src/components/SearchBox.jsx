import React, { useState, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import axios from "@/api/axios";
import useDebounce from "@/hooks/useDebounce";

function SearchBox({ onSearch, onChatUpdate }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [existingChats, setExistingChats] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleAddOrRemoveUser = async (user) => {
    try {
      const res = await axios.post(
        "/api/chat/toggle",
        { userId: user._id },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.error) {
        toast.error(res.data.message);
        return;
      }

      setOpen(false);
      setSearchTerm("");
      setUsers([]);

      onChatUpdate(res.data);

      if (res.data.message.includes("removed")) {
        setExistingChats((prev) =>
          prev.filter((chatUser) => chatUser._id !== user._id)
        );
        toast.success("Chat removed successfully");
      } else {
        setExistingChats((prev) => [...prev, user]);
        toast.success("Chat created successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleSearchUsers = async () => {
    if (!debouncedSearchTerm.trim()) {
      setUsers([]);
      return;
    }

    try {
      const res = await axios.get(
        `/api/user/search?search=${debouncedSearchTerm}`,
        {
          withCredentials: true,
        }
      );

      setUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    }
  };

  useEffect(() => {
    handleSearchUsers();
  }, [debouncedSearchTerm]);

  return (
    <div className="search-box h-[40px] w-full bg-slate-200 dark:bg-[#1f1f1f] rounded-md flex items-center overflow-hidden">
      <input
        type="text"
        placeholder="Search here..."
        className="h-full w-full outline-none bg-transparent px-4"
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onSearch(e.target.value);
        }}
      />
      <div className="h-full w-[20%] flex items-center justify-center cursor-pointer">
        <Search size={20} />
      </div>
      <div
        onClick={() => setOpen(true)}
        className="h-full w-[20%] flex items-center justify-center cursor-pointer"
      >
        <UserPlus size={20} />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Manage Chat</DialogTitle>
            <DialogDescription>
              <span>Search and Add/Remove chats from the list</span>
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2"
          />
          {users.length > 0 && (
            <ul className="mt-2">
              {users.map((user) => {
                const isExistingChat = existingChats.some(
                  (chatUser) => chatUser._id === user._id
                );

                return (
                  <li
                    key={user._id}
                    className="flex justify-between items-center p-2 border-b"
                  >
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={`${user.username}'s avatar`}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                      <span>{user.username}</span>
                    </div>
                    <Button
                      onClick={() => handleAddOrRemoveUser(user)}
                      variant="outline"
                    >
                      {isExistingChat ? "Remove" : "Add"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          {users.length === 0 && debouncedSearchTerm && (
            <span className="mt-2 text-gray-500">No users found</span>
          )}
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SearchBox;
