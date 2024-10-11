import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loadingAnim from "../animations/loadingAnim.json";
import axios from "@/api/axios";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({
      identifier: "",
      password: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    const { identifier, password } = formData;

    try {
      if (!identifier || !password) {
        toast.error("Please fill out all required fields!");
        return;
      }
      setLoading(true);

      const response = await axios.post(
        "/api/user/login",
        { identifier, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.error) {
        toast.error(response.data.error);
        setLoading(false);
        return;
      }

      const { user } = response.data;
      dispatch(login({ user, token: response.data.accessToken }));

      navigate("/");
      toast.success("Login successful");
      resetForm();
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full sm:w-auto sm:min-w-[20rem] dark:text-gray-50 text-black flex flex-col gap-3 mt-6 items-center">
      <div className="w-full flex flex-col gap-1">
        <label htmlFor="identifier" className="text-sm">
          Email / Username*
        </label>
        <input
          type="text"
          id="identifier"
          name="identifier"
          value={formData.identifier}
          onChange={handleInputChange}
          className="h-10 rounded-md outline-none bg-gray-300 dark:bg-[#323232] py-2 px-3 text-black dark:text-gray-50"
        />
      </div>
      <div className="w-full flex flex-col gap-1">
        <label htmlFor="password" className="text-sm">
          Password*
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="h-10 rounded-md outline-none bg-gray-300 dark:bg-[#323232] py-2 px-3 text-black dark:text-gray-50"
        />
      </div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-800 disabled:bg-slate-500 text-gray-50 py-2 px-4 rounded-md mt-2 font-semibold text-base flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {loading && (
          <div className="w-6 h-6">
            <Lottie animationData={loadingAnim} loop={true} />
          </div>
        )}
        Login
      </button>
      <p className="mt-4">
        Don't have an account?{" "}
        <Link to={"/auth/signup"} className="text-blue-500 hover:underline">
          Signup
        </Link>
      </p>
    </div>
  );
};

export default Login;
