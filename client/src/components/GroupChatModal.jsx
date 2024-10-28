import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon, X, Upload, Loader2 } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import axios from "@/api/axios";

export default function GroupChatModal({ onChatUpdate }) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleCreateGroup = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append(
        "members",
        JSON.stringify(selectedUsers.map((user) => user._id))
      );
      if (groupAvatar) {
        formData.append("avatar", groupAvatar);
      }

      const res = await axios.post("/api/chat/group/create", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message);
      onChatUpdate(res.data.chat);
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setSearchQuery("");
    setSelectedUsers([]);
    setGroupAvatar(null);
    setPreviewAvatar(null);
  };

  useEffect(() => {
    handleSearchUsers();
  }, [debouncedSearchTerm]);

  const addUser = (user) => {
    if (!selectedUsers.some((selectedUser) => selectedUser._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-xs md:text-sm bg-transparent transition-none p-3 md:p-4"
        >
          <PlusIcon className="h-4 md:h-5 w-4 sm:w-5 mr-1" />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewAvatar} alt="Group Avatar" />
                <AvatarFallback className="text-5xl font-semibold">
                  {groupName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Upload size={16} />
                <span className="sr-only">Upload avatar</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="col-span-4"
              placeholder="Enter group name"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="searchUsers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-4"
              placeholder="Search users"
              autoComplete="off"
            />
          </div>
          {searchQuery && (
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm font-medium">
                        {user.username}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addUser(user)}
                      disabled={selectedUsers.some(
                        (selectedUser) => selectedUser._id === user._id
                      )}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {selectedUsers.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Selected Users:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    <span className="mb-1">{user.username}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-4 w-4"
                      onClick={() => removeUser(user._id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove user</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button
          className="w-full"
          onClick={handleCreateGroup}
          disabled={!groupName || selectedUsers.length === 0 || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Group...
            </>
          ) : (
            "Create Group"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
