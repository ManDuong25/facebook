import React from "react";
import Header from "../../components/Header/Header.jsx";
import LeftSidebar from "../../components/Sidebars/Home/LeftSidebar.jsx";
import RightSidebar from "../../components/Sidebars/Home/RightSidebar.jsx";
import styles from "./HomeLayout.module.scss";  // Đổi cách import

const HomeLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* Container chính */}
      <div className="flex flex-1 overflow-hidden">
        {/* Cột trái - Sidebar */}
        <div className={`hidden lg:block lg:w-1/4 bg-gray-100 overflow-y-auto min-h-0 ${styles["scrollbar-custom"]} ${styles["sidebar"]}`}>
          <LeftSidebar />
        </div>

        {/* Cột giữa - Feed */}
        <div className={`w-full lg:w-1/2 bg-white overflow-y-auto min-h-0 ${styles["feed-scrollbar"]}`}>
          {children}
        </div>

        {/* Cột phải - Sidebar */}
        <div className={`hidden lg:block lg:w-1/4 bg-gray-100 overflow-y-auto min-h-0 ${styles["scrollbar-custom"]} ${styles["sidebar"]}`}>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
