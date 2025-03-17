import React, { useState, useRef, useEffect } from "react";
import ChatSidebar from "./ChatSidebar"; 
import images from "../../assets/images"; 

function Header() {
  const [activeTab, setActiveTab] = useState("home");
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [activeRightIcon, setActiveRightIcon] = useState("");
  const avatarRef = useRef(null);
  const [chatPosition, setChatPosition] = useState(0);

  const rightIcons = ["bi-grid-3x3-gap", "bi-messenger", "bi-bell"];

  // Hàm xử lý click vào icon phải
  const handleRightIconClick = (icon) => {
    if (icon === "bi-messenger") {
      if (activeRightIcon === "bi-messenger") {
        setActiveRightIcon("");
        setShowChatSidebar(false);
      } else {
        setActiveRightIcon("bi-messenger");
        setShowChatSidebar(true);
      }
    } else {
      setShowChatSidebar(false);
      if (activeRightIcon === icon) {
        setActiveRightIcon("");
      } else {
        setActiveRightIcon(icon);
      }
    }
  };

  // Lấy vị trí của avatar thay vì Messenger
  useEffect(() => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setChatPosition(window.innerWidth - rect.right); 
    }
  }, [showChatSidebar]);

  return (
    <div>
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="flex items-center h-14 w-full">
          {/* CỘT TRÁI */}
          <div className="hidden lg:flex lg:w-1/4 px-4 items-center gap-3">
            <img src={images.logo} alt="Facebook Logo" className="w-11 h-18" />
            <div className="flex items-center h-10 px-3 rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] transition">
              <i className="bi bi-search text-gray-500 text-[18px]"></i>
              <input
                type="text"
                placeholder="Tìm kiếm trên Facebook"
                className="bg-transparent outline-none text-base text-gray-700 placeholder-[#65676b] ml-2 w-54"
              />
            </div>
          </div>

          {/* CỘT GIỮA */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-[496px] flex items-center gap-16">
              {[
                { id: "home", icon: "bi-house-door" },
                { id: "watch", icon: "bi-tv" },
                { id: "market", icon: "bi-shop" },
                { id: "group", icon: "bi-people" },
                { id: "gaming", icon: "bi-controller" },
              ].map(({ id, icon }) => (
                <div
                  key={id}
                  className={`relative w-12 h-12 flex items-center justify-center rounded-md cursor-pointer transition ${
                    activeTab === id
                      ? "text-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(id)}
                >
                  <i className={`bi ${icon} text-[28px]`}></i>
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[150%] h-[2px] bg-blue-500 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="hidden lg:flex lg:w-1/4 px-4 items-center gap-3 justify-end">
            {rightIcons.map((icon) => (
              <div
                key={icon}
                onClick={() => handleRightIconClick(icon)}
                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e4e6eb] transition cursor-pointer ${
                  activeRightIcon === icon ? "text-blue-500" : "text-gray-600"
                }`}
              >
                <i className={`bi ${icon} text-[22px]`}></i>
              </div>
            ))}
            {/* Avatar */}
            <div ref={avatarRef} className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
              <img src={images.avatarJpg} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </nav>
      {/* Hiển thị ChatSidebar tại vị trí của avatar */}
      {showChatSidebar && <ChatSidebar right={chatPosition} />}
    </div>
  );
}

export default Header;
