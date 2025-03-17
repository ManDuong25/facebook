import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import images from "../../assets/images";  

const ChatSidebar = ({right}) => {
  const chats = [
    {
      id: 1,
      name: "2-1[Luni] Nhóm VIP",
      message: "Đức: Tôi ",
      time: "39 phút",
      avatar: images.group1,
      online: true,
    },
    {
      id: 2,
      name: "chú bé đù",
      message: "",
      time: "21 giờ",
      avatar: images.group1,
      online: false,
    },
    {
      id: 3,
      name: "Thế Minh",
      message: "diễn ",
      time: "23 giờ",
      avatar: images.group1,
      online: false,
    },
    {
      id: 4,
      name: "Nguyễn Lý",
      message: " toàn nhăn ng...",
      time: "1 ngày",
      avatar: images.group1,
      online: false,
    },
    {
      id: 5,
      name: "DCT1224",
      message: "ĐĂNG KÝ THAM GIA HỖ...",
      time: "1 ngày",
      avatar: images.group1,
      online: false,
    },
    {
      id: 6,
      name: "Mặc Vấn",
      message: "Rồi",
      time: "5 ngày",
      avatar: images.group1,
      online: false,
    },
    {
      id: 7,
      name: "Autumn",
      message: "Đã bày tỏ cảm xúc ❤️ về tin nh...",
      time: "2 tuần",
      avatar: images.group1,
      online: true,
    },
  ];

  return (
    <div className="fixed top-14 w-[360px] h-[90vh] bg-white shadow-lg border-l border-r border-gray-300 z-50 flex flex-col"
    style={{ right: `${right}px` }}>
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h2 className="text-lg font-semibold">Đoạn chat</h2>
        <div className="flex items-center gap-4">
          <i className="bi bi-three-dots text-xl cursor-pointer"></i>
          <i className="bi bi-arrows-fullscreen text-xl cursor-pointer"></i>
          <i className="bi bi-pencil-square text-xl cursor-pointer"></i>
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <i className="bi bi-search absolute left-3 top-2.5 text-gray-400"></i>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 rounded-full bg-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Tìm kiếm trên Messenger"
          />
        </div>
      </div>

      <div className="px-3 py-2 flex items-center border-b">
        <button className="font-bold text-sm text-[#1877F2] px-3 py-1 bg-white rounded-full transition-colors duration-200 hover:bg-[#f0f2f5]">
          Hộp thư
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-5">
                  {chat.name}
                </span>
                {chat.message && (
                  <span className="text-xs text-gray-500 leading-4">
                    {chat.message}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400">{chat.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
