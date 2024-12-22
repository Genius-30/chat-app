import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import ChatCard from "../components/ChatCard";
import ChatsSkeleton from "@/components/ChatsSkeleton";
import GroupChatModal from "@/components/GroupChatModal";
import ManageChatModal from "@/components/ManageChatModal";
import { Separator } from "@/components/ui/separator";
import Sidebar from "../components/Sidebar";
import axios from "@/api/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function Home() {
  const [allChats, setAllChats] = useState([]);
  const [chats, setChats] = useState([]);
  const [menu, setMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showChatList, setShowChatList] = useState(true);

  const menuRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const { chatId } = useParams();

  const toggleMenu = () => {
    setMenu(!menu);
  };

  const handleClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenu(false);
    }
  };

  const handleSearch = (text) => {
    if (text.trim() === "") {
      setChats(allChats);
    } else {
      const filteredChats = allChats.filter((chat) =>
        chat.isGroupChat
          ? chat.chatName.toLowerCase().includes(text.toLowerCase())
          : chat.users[0].username.toLowerCase().includes(text.toLowerCase())
      );
      setChats(filteredChats);
    }
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/chat");

      if (res.data.error) {
        toast.error(res.data.error);
        setLoading(false);
        return;
      }

      setAllChats(res.data);
      setChats(res.data);
    } catch {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
      setShowChatList(false);
    } else {
      setSelectedChatId(null);
      setShowChatList(true);
    }
  }, [chatId]);

  const handleChatUpdate = (chat) => {
    if (chat.chatId) {
      setAllChats((prev) => prev.filter((c) => c._id !== chat.chatId));
      setChats((prev) => prev.filter((c) => c._id !== chat.chatId));
    } else {
      setAllChats((prev) => [...prev, chat]);
      setChats((prev) => [...prev, chat]);
    }
  };

  return (
    <div className="max-h-screen h-dvh w-full bg-gray-100 dark:bg-black flex items-center justify-center">
      <div
        className="relative h-full w-full sm:h-[95%] sm:w-[95%] xl:w-[80%] bg-gray-50 dark:bg-[#121212] shadow-[#a1a1a14f] shadow-lg dark:shadow-[#000000a8] sm:rounded-lg overflow-hidden flex flex-row"
        onClick={handleClick}
      >
        {/* Sidebar */}
        <Sidebar menu={menu} toggleMenu={toggleMenu} ref={menuRef} />

        {/* Chats Panel */}
        <div
          className={`chats-panel h-full w-full sm:w-[30%] lg:w-[24%] flex-shrink-0 ${
            showChatList ? "block" : "hidden sm:block"
          } mb-12 sm:mb-0 sm:ml-12`}
        >
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-zinc-900 dark:text-gray-50 text-lg font-semibold select-none">
                Chat App
              </h1>
              <GroupChatModal onChatUpdate={handleChatUpdate} />
            </div>

            {/* Search Box */}
            <div className="search-box h-9 w-full flex items-center overflow-hidden gap-x-1 mb-4">
              <input
                type="text"
                placeholder="Search here..."
                className="h-full w-full bg-slate-200 dark:bg-[#1f1f1f] rounded-md outline-none px-4"
                onChange={(e) => {
                  handleSearch(e.target.value);
                }}
              />
              <ManageChatModal
                onChatUpdate={handleChatUpdate}
                existingChats={allChats}
              />
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 custom-scroller">
              {loading && <ChatsSkeleton count={8} />}

              {chats.length > 0 ? (
                chats.map((chat) => {
                  return (
                    <ChatCard
                      key={chat._id}
                      chat={chat}
                      onClick={() => {
                        setSelectedChatId(chat._id);
                        navigate(`/chat/${chat._id}`);
                        setShowChatList(false);
                      }}
                      selected={selectedChatId === chat._id}
                      currentUserId={currentUser._id}
                    />
                  );
                })
              ) : (
                <p className="text-center">No Chats!</p>
              )}
            </div>
          </div>
        </div>

        {/* Separator - Hidden on smaller screens */}
        <Separator className="separator hidden sm:block h-full w-[1px] flex-shrink-0" />

        {/* Chat Panel */}
        <div
          className={`chat relative h-full flex-grow ${
            showChatList ? "hidden sm:flex" : "flex"
          } items-center justify-center`}
        >
          {selectedChatId ? (
            <div className="h-full w-full">
              <Outlet />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 dark:bg-[#121212]">
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/chatbot-support-illustration-download-in-svg-png-gif-file-formats--call-logo-customer-business-activities-pack-illustrations-2283917.png"
                alt=""
                className="h-52 w-52 md:h-72 md:w-72 object-contain"
              />
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Please select a chat to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
