import React, { Suspense, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import axios from "@/api/axios";
import { login, logout, verifyUser } from "./store/authSlice";
import Loader from "./components/Loader";
import routes from "./routesConfig";
import "./App.css";

export default function App() {
  const [loader, setLoader] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  const nodeRef = useRef(null);

  const authPaths = ["/auth/login", "/auth/signup"];

  useEffect(() => {
    const fetchUser = async () => {
      if (authPaths.includes(location.pathname)) {
        setLoader(false);
        return;
      }

      try {
        const res = await axios.get("/api/user");
        const { user, accessToken } = res.data;

        dispatch(login(user, accessToken));
        if (user?.isVerified) {
          dispatch(verifyUser());
        }
      } catch (error) {
        dispatch(logout());
      } finally {
        setLoader(false);
      }
    };

    fetchUser();
  }, [dispatch, location.pathname]);

  if (loader) {
    return <Loader />;
  }

  return (
    <div
      ref={nodeRef}
      className="relative min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white"
    >
      <Toaster />
      <Suspense fallback={<Loader />}>
        <Routes location={location}>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children &&
                route.children.map((childRoute, childIndex) => (
                  <Route
                    key={childIndex}
                    path={childRoute.path}
                    element={childRoute.element}
                  />
                ))}
            </Route>
          ))}
        </Routes>
      </Suspense>
    </div>
  );
}
