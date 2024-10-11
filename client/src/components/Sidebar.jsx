import React, { forwardRef, useEffect, useRef, useState } from "react";
import { MenuIcon, MessageSquareText, User, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "@/api/axios";
import Lottie from "lottie-react";
import loadingAnim from "../animations/loadingAnim.json";
import { logout } from "@/store/authSlice";

const Sidebar = forwardRef(({ menu, toggleMenu }, ref) => {
  const buttonRef = ref;

  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const menuClasses = menu ? "w-48 items-start" : "w-12 items-center";
  const iconContainerClasses = menu
    ? "justify-start px-4"
    : "justify-center px-0";
  const linkContainerClasses = menu
    ? "py-2 px-4 justify-start"
    : "py-2 px-0 justify-center";
  const activeLinkClasses = "bg-slate-300 dark:bg-zinc-700";

  const handleProfile = () => {
    setShowProfile((prev) => !prev);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/user/logout");
      if (res.data.error) {
        toast.error(res.data.message);
        setLoading(false);
        return;
      }
      dispatch(logout());
      toast.success(res.data.message);
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        showProfile
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfile]);

  return (
    <div
      className={`sidebar z-[49] h-full flex flex-col absolute bg-slate-200 dark:bg-zinc-800 py-4 rounded-tr-lg rounded-br-lg ${menuClasses}`}
      ref={buttonRef}
    >
      <div
        onClick={toggleMenu}
        className={`text-zinc-900 dark:text-gray-50 flex items-center cursor-pointer ${iconContainerClasses}`}
      >
        {menu ? (
          <X strokeWidth={1.5} size={20} />
        ) : (
          <MenuIcon strokeWidth={1.5} size={20} />
        )}
      </div>
      <div className="w-full flex flex-col gap-2 mt-6">
        <NavLink
          to={"/"}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 rounded-md hover:bg-slate-300 hover:dark:bg-zinc-700 cursor-pointer ${
              isActive && activeLinkClasses
            } ${linkContainerClasses}`
          }
        >
          <MessageSquareText strokeWidth={1.5} size={20} />
          {menu && <p className="select-none">Chats</p>}
        </NavLink>
      </div>
      <div className="relative w-full mt-auto">
        <div
          onClick={handleProfile}
          className={`w-full flex items-center gap-3 rounded-md bg-cover ${
            showProfile
              ? "bg-slate-300 dark:bg-zinc-700"
              : "hover:bg-slate-300 hover:dark:bg-zinc-700"
          } cursor-pointer select-none ${linkContainerClasses}`}
        >
          <img
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            className="h-11 w-11"
          />
          {menu && <p className="select-none">Profile</p>}
        </div>
        {showProfile && (
          <div
            ref={profileRef}
            className={`absolute ${
              menu ? "bottom-12 left-24" : "bottom-0 left-12"
            } min-h-52 w-52 bg-slate-200 dark:bg-zinc-800 flex flex-col items-start p-4 rounded-md shadow-md dark:shadow-zinc-950`}
          >
            <div className="flex-1 w-full flex flex-col items-start justify-end mb-2">
              <div
                key={user._id}
                className="flex items-center gap-2 mb-2 cursor-pointer font-bold"
              >
                <img
                  src={user.avatar}
                  alt="profile pic"
                  className="h-8 w-8 rounded-full object-cover object-center bg-zinc-300 dark:bg-zinc-700"
                />
                <span>{user.username}</span>
              </div>
            </div>
            <Separator className="bg-slate-300 dark:bg-zinc-700 mt-auto" />
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline flex items-center gap-2 ml-2 mt-2 rounded-md cursor-pointer"
            >
              {loading && (
                <div className="w-4 h-4">
                  <Lottie animationData={loadingAnim} loop={true} />
                </div>
              )}
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default Sidebar;
