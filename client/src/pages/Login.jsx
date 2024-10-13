import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loadingAnim from "../animations/loadingAnim.json";
import axios from "@/api/axios";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login, verifyUser } from "@/store/authSlice";

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

  // const handleResendVerificationEmail = async () => {
  //   toastId = toast.loading("Resending verification email...");
  //   navigate("/verify-email");

  //   try {
  //     const resendResponse = await axios.get(
  //       "/api/user/resend-verification-email"
  //     );

  //     if (resendResponse.data.error) {
  //       return;
  //     }

  //     toast.success(resendResponse.data.message);
  //   } catch (error) {
  //     console.log(error);

  //     toast.error(
  //       error.response.status === 401
  //         ? "Please Signup first to resend verification email."
  //         : error.response.data.message,
  //       {
  //         duration: 5000,
  //       }
  //     );
  //   } finally {
  //     toast.dismiss(toastId);
  //   }
  // };

  const showLinkToast = () => {
    const toastId = toast.error(
      <div>
        Your account is not verified. Please check your email for the
        verification link. or Go to{" "}
        <Link
          to="/verify-email"
          onClick={() => toast.dismiss(toastId)}
          style={{
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          verify
        </Link>
      </div>,
      {
        duration: 5000,
      }
    );
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

      const { user, accessToken } = response.data;
      dispatch(login(user, accessToken));
      dispatch(verifyUser());

      navigate("/");
      toast.success("Login successful");
      resetForm();
    } catch (error) {
      if (error.response.status === 403) {
        showLinkToast();
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
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
