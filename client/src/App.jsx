import React, { Suspense, useEffect, useRef, useState } from "react";
import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { useTheme } from "./context/themeContext";
import { Moon, Sun } from "lucide-react";
import { login, logout } from "./store/authSlice";
import axios from "@/api/axios";
import Loader from "./components/Loader";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
// import { SwitchTransition, CSSTransition } from "react-transition-group";
import routes from "./routesConfig";

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const [loader, setLoader] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();

  const nodeRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user", {
          withCredentials: true,
        });

        const { user, accessToken } = res.data;
        dispatch(login(user, accessToken));

        if (!res.data.user) {
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
        toast.success("Please login to continue");
      } finally {
        setLoader(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  if (loader) {
    return <Loader />;
  }

  return (
    // <SwitchTransition component={null}>
    // <CSSTransition
    //   key={location.pathname}
    //   nodeRef={nodeRef}
    //   className="fade"
    //   timeout={300}
    //   unmountOnExit
    // >
    <div
      ref={nodeRef}
      className="relative min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white"
    >
      <button
        className="absolute right-3 top-4 p-2 rounded-xl shadow-lg shadow-[#a1a1a14f] dark:shadow-[#0b0b0b] dark:bg-[#121212] dark:text-white bg-gray-50 text-black z-[999]"
        onClick={toggleTheme}
      >
        {theme === "dark" ? <Moon /> : <Sun />}
      </button>
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
    //   </CSSTransition>
    // </SwitchTransition>
  );
};

export default App;
