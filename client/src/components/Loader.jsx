import Lottie from "lottie-react";
import chatLoadingAnim from "../animations/chat-loading.json";
import React from "react";

function CustomLoader() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-transparent">
      {/* <LoaderCircle className="text-gray-300 dark:text-gray-100 animate-spin h-10 md:h-24 w-10 md:w-24" /> */}
      <Lottie animationData={chatLoadingAnim} loop={true} className="h-28" />
    </div>
  );
}

export default CustomLoader;
