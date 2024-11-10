import { CircleCheckBig, CircleX, ImagePlus, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loadingAnim from "../animations/loadingAnim.json";
import toast from "react-hot-toast";
import axios from "@/api/axios";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Component() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    // phoneNumber: "",
    avatar: null,
    avatarFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const debouncedUsername = useDebounce(formData.username, 500);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handlePhoneChange = (value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     phoneNumber: value,
  //   }));
  // };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: URL.createObjectURL(file),
        avatarFile: file,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      avatar: null,
      avatarFile: null,
    });
  };

  const checkUsernameAvailability = async (username) => {
    if (username.trim() === "") {
      setUsernameAvailable(null);
      return;
    }

    try {
      setCheckingUsername(true);
      const res = await axios.post("/api/user/check-username", { username });

      if (res.data.error) {
        setUsernameAvailable(false);
        toast.error(res.data.error);
        return;
      }
      setUsernameAvailable(true);
    } catch (error) {
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    if (debouncedUsername) {
      checkUsernameAvailability(debouncedUsername);
    }
  }, [debouncedUsername]);

  const validateForm = () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      toast.error("Please fill out all required fields!");
      return false;
    }
    if (!usernameAvailable) {
      toast.error("Username is not available");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    // if (phoneNumber.length < 10) {
    //   toast.error("Please enter a valid phone number");
    //   return false;
    // }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("username", formData.username);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      // payload.append("phoneNumber", `+${formData.phoneNumber}`);
      if (formData.avatarFile) {
        payload.append("avatar", formData.avatarFile);
      }

      const response = await axios.post("/api/user/signup", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      const { user, accessToken } = response.data;
      dispatch(login(user, accessToken));

      toast.success("Signup successful. Verify Your Email Now!");
      navigate("/verify-user");
      resetForm();
    } catch (error) {
      toast.error(error.response.data.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="w-full sm:w-auto sm:min-w-[20rem] dark:text-gray-50 text-black flex flex-col gap-3 mt-6 items-center"
    >
      <div className="w-full flex flex-col items-center gap-1">
        <label
          htmlFor="avatar"
          className="h-28 w-28 bg-slate-300 dark:bg-[#323232] rounded-full flex items-center justify-center cursor-pointer text-[#121212] dark:text-gray-300"
        >
          {formData.avatar ? (
            <img
              src={formData.avatar}
              alt="Avatar Preview"
              className="h-full w-full object-cover rounded-full border-2 border-blue-500 p-1"
            />
          ) : (
            <ImagePlus size={20} />
          )}
        </label>
        <label
          htmlFor="avatar"
          className="text-sm cursor-pointer text-blue-500 hover:underline"
        >
          Add Avatar
        </label>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
      <div className="w-full flex flex-col gap-1">
        <label htmlFor="username" className="text-sm">
          Username*
        </label>
        <Input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          autoComplete="off"
          className={`h-10 rounded-md outline-none py-2 px-3 ${
            usernameAvailable === false
              ? "border-red-500"
              : usernameAvailable === true
              ? "border-green-500"
              : ""
          } bg-gray-300 dark:bg-[#323232] text-black dark:text-gray-50`}
        />
        {formData.username && (
          <>
            {checkingUsername ? (
              <div className="flex items-center gap-x-2">
                <Lottie
                  animationData={loadingAnim}
                  loop={true}
                  className="w-4 h-4"
                />
                <p className="text-xs text-gray-500">
                  Checking availability...
                </p>
              </div>
            ) : usernameAvailable === false ? (
              <div className="flex items-center gap-x-0">
                <CircleX className="text-red-500 h-4" />
                <p className="text-xs text-red-500">Username already taken</p>
              </div>
            ) : usernameAvailable === true ? (
              <div className="flex items-center">
                <CircleCheckBig className="text-green-500 h-4" />
                <p className="text-xs text-green-500">Username available</p>
              </div>
            ) : null}
          </>
        )}
      </div>
      <div className="w-full flex flex-col gap-1">
        <label htmlFor="email" className="text-sm">
          Email*
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          autoComplete="off"
          className="h-10 rounded-md outline-none bg-gray-300 dark:bg-[#323232] py-2 px-3 text-black dark:text-gray-50"
        />
      </div>
      <div className="w-full flex flex-col gap-1">
        <label htmlFor="password" className="text-sm">
          Password*
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="off"
            className="h-10 rounded-md outline-none bg-gray-300 dark:bg-[#323232] py-2 px-3 pr-10 text-black dark:text-gray-50"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 h-full"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
      </div>
      {/* <div className="w-full flex flex-col gap-1">
        <label htmlFor="phoneNumber" className="text-sm">
          Phone Number*
        </label>
        <PhoneInput
          country={"in"}
          value={formData.phoneNumber}
          onChange={handlePhoneChange}
          inputProps={{
            name: "phoneNumber",
            required: true,
            autoComplete: "off",
          }}
          containerClass="phone-input-container"
          inputClass="phone-input"
          buttonClass="phone-input-button"
          dropdownClass="phone-input-dropdown"
          enableSearch={true}
        />
      </div> */}
      <button
        type="submit"
        disabled={loading || !formData.username || !usernameAvailable}
        className="w-full bg-blue-800 disabled:bg-slate-500 text-gray-50 py-2 px-4 rounded-md mt-2 font-semibold text-base flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {loading && (
          <Lottie animationData={loadingAnim} loop={true} className="w-6 h-6" />
        )}
        Signup
      </button>
      <p className="mt-4">
        Already have an account?{" "}
        <Link to={"/auth/login"} className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
