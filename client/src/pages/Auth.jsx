import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLogin(location.pathname === "/auth/login");
  }, [location]);

  return (
    <div className="max-h-screen h-dvh w-full p-4 flex items-center justify-center">
      <div className="w-full sm:w-auto sm:min-w-[24rem] min-h-[60vh] bg-gray-200 dark:bg-[#121212] p-4 rounded-3xl flex items-center justify-start flex-col text-gray-50 shadow-md shadow-gray-200 dark:shadow-black">
        <div className="bg-gray-300 dark:bg-[#323232] h-11 w-full rounded-full flex items-center justify-center gap-2 p-1 mb-2">
          <Link
            to={"/auth/signup"}
            className={`w-[50%] ${
              isLogin
                ? "bg-transparent text-black"
                : "bg-gray-500 dark:bg-[#6c6c6c] text-white"
            } rounded-full h-full flex items-center justify-center transition-all duration-100 ease-linear dark:text-white`}
          >
            Signup
          </Link>
          <Link
            to={"/auth/login"}
            className={`w-[50%] ${
              isLogin
                ? "bg-gray-500 dark:bg-[#6c6c6c] text-white"
                : "bg-transparent text-black"
            } rounded-full h-full flex items-center justify-center transition-all duration-100 ease-linear dark:text-white`}
          >
            Login
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Auth;
