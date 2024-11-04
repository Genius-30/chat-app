import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Check, Edit, Home, MenuIcon, Moon, Sun, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "@/api/axios";
import Lottie from "lottie-react";
import loadingAnim from "../animations/loadingAnim.json";
import { logout, updateUser } from "@/store/authSlice";
import { useTheme } from "@/context/themeContext";

const Sidebar = forwardRef(({ menu, toggleMenu }, ref) => {
  const buttonRef = ref;
  const { theme, toggleTheme } = useTheme();

  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const profileRef = useRef(null);
  const profileIconRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

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
      navigate("/auth/login");

      dispatch(logout());
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      updateUserProfile("", file);
    }
  };

  const updateUserProfile = async (updatedUsername, avatar) => {
    const toastId = toast.loading("Updating profile...");
    try {
      const formData = new FormData();
      if (updatedUsername && updatedUsername !== user.username) {
        formData.append("username", updatedUsername);
      }
      if (avatar) formData.append("avatar", avatar);

      if (formData.has("username") || formData.has("avatar")) {
        const res = await axios.put("/api/user/update-user", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.error) {
          toast.error(res.data.message);
          return;
        }

        dispatch(
          updateUser({
            username: res.data.user.username,
            avatar: res.data.user.avatar,
          })
        );
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || "Invalid request");
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    if (user && user.username) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        !profileIconRef.current.contains(event.target) &&
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
      className={`sidebar absolute z-[49] bottom-0 sm:top-0 h-auto sm:h-full w-full ${
        menu ? "sm:w-48 sm:items-start" : "sm:w-12 sm:items-center"
      } flex flex-row items-center justify-between sm:justify-normal sm:flex-col gap-y-2 bg-slate-200 dark:bg-zinc-800 py-2 sm:py-4 shadow-lg px-2`}
      ref={buttonRef}
    >
      <button
        onClick={toggleMenu}
        className={`hidden sm:flex text-zinc-900 dark:text-gray-50 items-center cursor-pointer ${iconContainerClasses} mb-6`}
      >
        {menu ? (
          <X strokeWidth={1.5} size={20} />
        ) : (
          <MenuIcon strokeWidth={1.5} size={20} />
        )}
      </button>
      <button className="w-full flex flex-col gap-2">
        <NavLink
          to={"/"}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 rounded-md hover:bg-slate-300 hover:dark:bg-zinc-700 cursor-pointer ${
              isActive && activeLinkClasses
            } ${linkContainerClasses}`
          }
        >
          <Home strokeWidth={1.5} size={20} />
          {menu && <p className="select-none">Home</p>}
        </NavLink>
      </button>
      <button
        onClick={toggleTheme}
        className={`w-full flex items-center gap-3 rounded-md sm:hover:bg-slate-300 sm:hover:dark:bg-zinc-700 cursor-pointer ${linkContainerClasses} bg-transparent`}
      >
        {theme === "dark" ? (
          <Sun strokeWidth={1.5} size={20} />
        ) : (
          <Moon strokeWidth={1.5} size={20} />
        )}
        {menu && <p className="select-none">Theme</p>}
      </button>
      <div className="relative w-full sm:mt-auto">
        <div
          ref={profileIconRef}
          onClick={handleProfile}
          className={`w-full flex items-center justify-center gap-3 rounded-full bg-cover ${
            showProfile
              ? "shadow-none dark:shadow-none"
              : "hover:shadow-gray-600 hover:dark:shadow-zinc-950"
          } cursor-pointer select-none sm:mb-2 shadow-sm`}
        >
          <img
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            className="h-8 aspect-square rounded-full object-cover object-center"
          />
          {menu && <p className="select-none">Profile</p>}
        </div>
        {showProfile && (
          <div
            ref={profileRef}
            className={`absolute ${
              menu
                ? "bottom-4 left-14"
                : "bottom-14 sm:bottom-0 right-2 sm:left-14"
            } min-h-52 w-52 bg-slate-200 dark:bg-zinc-800 flex flex-col items-start p-4 rounded-md shadow-md dark:shadow-zinc-950`}
          >
            <div className="flex-1 w-full flex flex-col items-start justify-end mb-2">
              <div
                key={user._id}
                className="w-full flex flex-col items-center gap-3 mb-2 cursor-pointer"
              >
                <label htmlFor="profileImage" className="cursor-pointer">
                  <img
                    src={profileImage || user.avatar}
                    alt="profile pic"
                    className="h-28 w-auto aspect-square rounded-full object-cover object-center bg-zinc-300 dark:bg-zinc-700"
                  />
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="w-full flex justify-center items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-gray-300 dark:bg-[#323232] text-black dark:text-gray-50 border rounded-md px-2 py-1"
                    />
                  ) : (
                    <span>{username || user.username}</span>
                  )}
                  <div
                    onClick={() => {
                      if (isEditing) {
                        updateUserProfile(username);
                      }
                      setIsEditing((prev) => !prev);
                    }}
                    className="cursor-pointer"
                  >
                    {isEditing ? <Check size={16} /> : <Edit size={16} />}
                  </div>
                </div>
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
