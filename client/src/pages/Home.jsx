import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatCard from "../components/ChatCard";
import axios from "@/api/axios";
import toast from "react-hot-toast";
import ChatsSkeleton from "@/components/ChatsSkeleton";
import GroupChatModal from "@/components/GroupChatModal";
import ManageChatModal from "@/components/ManageChatModal";

const Home = () => {
  const [allChats, setAllChats] = useState([]);
  const [chats, setChats] = useState([]);
  const [menu, setMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuRef = useRef(null);

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
      const res = await axios.get("/api/chat/fetch");

      if (res.data.error) {
        toast.error(res.data.error);
        setLoading(false);
        return;
      }

      setAllChats(res.data);
      setChats(res.data);
    } catch (error) {
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleChatUpdate = (chat) => {
    if (chat.chatId) {
      setAllChats((prev) => prev.filter((c) => c._id !== chat.chatId));
      setChats((prev) => prev.filter((c) => c._id !== chat.chatId));
    } else {
      setAllChats((prev) => [...prev, chat]);
      setChats((prev) => [...prev, chat]);
    }
  };

  const getChatDetails = (chat) => {
    if (chat.isGroupChat) {
      return {
        chatName: chat.chatName,
        avatar: chat.avatar,
      };
    } else {
      const user = chat.users[0];
      return {
        chatName: user.username,
        avatar: user.avatar,
      };
    }
  };

  return (
    <div className="max-h-screen h-screen w-full bg-gray-100 dark:bg-black flex items-center justify-center">
      <div
        className="h-[95%] w-[95%] xl:w-[80%] bg-gray-50 dark:bg-[#121212] shadow-[#a1a1a14f] shadow-lg dark:shadow-[#000000a8] rounded-lg overflow-hidden relative flex border-[1.3px] border-zinc-200 dark:border-zinc-950"
        onClick={handleClick}
      >
        <Sidebar menu={menu} toggleMenu={toggleMenu} ref={menuRef} />

        <div className="chats-panel h-full basis-full sm:basis-[40%] lg:basis-[25%] ml-12 px-4">
          <div className="w-full flex items-center justify-between my-4">
            <h1 className="text-zinc-900 dark:text-gray-50 text-lg font-semibold select-none">
              Chat App
            </h1>
            <GroupChatModal onChatUpdate={handleChatUpdate} />
          </div>
          <div className="user-chats h-full flex-1 flex flex-col">
            <div className="search-box h-[40px] w-full flex items-center overflow-hidden gap-x-1">
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
            <div className="all-chats-container h-full overflow-y-auto my-4 space-y-3 custom-scroller">
              {loading ? (
                <ChatsSkeleton count={8} />
              ) : chats.length > 0 ? (
                chats.map((chat) => {
                  const { chatName, avatar } = getChatDetails(chat);

                  return (
                    <ChatCard
                      key={chat._id}
                      avatar={avatar}
                      username={chatName}
                      // msgStatus={chat.msgStatus}
                      // lastSeen={chat.lastSeen}
                      // latestMsg={chat.latestMessage}
                      // msgCount={chat.msgCount}
                    />
                  );
                })
              ) : (
                <p className="text-center">No Chats!</p>
              )}
            </div>
          </div>
        </div>

        <div className="divider h-full w-[1.3px] bg-zinc-200 dark:bg-zinc-950"></div>

        <div className="chat h-full basis-0 sm:flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
