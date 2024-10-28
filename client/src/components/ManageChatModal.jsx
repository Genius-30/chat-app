import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import axios from "@/api/axios";

export default function ManageChatModal({ onChatUpdate, existingChats }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const filteredUsers = users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUsers(filteredUsers);
  }, [searchTerm]);

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

      onChatUpdate(res.data.chat);
      toast.success(res.data.message);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <UserPlus className="h-full w-[20%] md:w-[15%] bg-slate-200 dark:bg-[#1f1f1f] rounded-md py-2 px-2" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Chat</DialogTitle>
          <DialogDescription>
            Search and Add/Remove chats from the list
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm sm:text-base"
          />
          {users.length > 0 ? (
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="p-4">
                {users.map((user) => {
                  const isExistingChat = existingChats
                    .filter((chat) => !chat.isGroupChat)
                    .some((chat) => chat.users.some((u) => u._id === user._id));

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center">
                        <img
                          src={user.avatar}
                          alt={`${user.username}'s avatar`}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <span className="text-sm font-medium">
                          {user.username}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleAddOrRemoveUser(user)}
                        variant="outline"
                        size="sm"
                      >
                        {isExistingChat ? "Remove" : "Add"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
