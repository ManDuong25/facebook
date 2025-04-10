import React from "react";
import Header from "../../components/Header/Header.jsx";
import LeftSidebar from "../../components/Sidebars/Home/LeftSidebar.jsx";
import RightSidebar from "../../components/Sidebars/Home/RightSidebar.jsx";
import styles from "./HomeLayout.module.scss";
const HomeLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-y-auto">
      <Header />
      {/* Container chính - thêm padding-top để tạo khoảng cách với header cố định */}
      <div className="flex flex-1 pt-14"> 
        {/* Cột trái - Sidebar */}
        <div className={`hidden lg:block lg:w-1/4 bg-gray-100 fixed top-14 bottom-0 overflow-y-auto ${styles["scrollbar-custom"]} ${styles["sidebar"]}`}>
          <LeftSidebar />
        </div>
        {/* Cột giữa - Feed */}
        <div className={`w-full lg:w-1/2 lg:ml-[25%] overflow-y-auto ${styles["feed-scrollbar"]}`}>
          {children}
        </div>

        {/* Cột phải - Sidebar */}
        <div className={`hidden lg:block lg:w-1/4 bg-gray-100 fixed top-14 right-0 bottom-0 overflow-y-auto ${styles["scrollbar-custom"]} ${styles["sidebar"]}`}>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
