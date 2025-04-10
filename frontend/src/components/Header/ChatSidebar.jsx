import React, { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import images from "../../assets/images";
import api from "../../services/apiConfig";
import { getAvatarUrl, handleImageError as globalHandleImageError } from "../../utils/avatarUtils";

const ChatSidebar = ({ right, onSelectConversation, selectedConversation }) => {
  const [conversations, setConversations] = useState([]);
  const defaultAvatar = images.avatarJpg;
  const defaultConversation = [
    {
      id: 0,
      name: "Người dùng mặc định",
      avatar: null, // Use null instead of defaultAvatar to test our utility function
      message: "Chào bạn! Hãy bắt đầu cuộc trò chuyện!",
      time: "Vừa xong",
      online: true,
    },
  ];

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const loggedInUserId = 1;
        // Gọi endpoint lấy danh sách cuộc trò chuyện cho user id 1
        const response = await api.get(`http://localhost:8080/api/messages/conversations/${loggedInUserId}`);
        console.log("Kết nối API thành công, dữ liệu:", response.data);
        if (response.data && response.data.data && response.data.data.length > 0) {
          setConversations(response.data.data);
        } else {
          console.log("API trả về dữ liệu rỗng, sử dụng defaultConversation.");
          setConversations(defaultConversation);
        }
      } catch (error) {
        console.error("Lỗi khi kết nối đến API:", error);
        setConversations(defaultConversation);
      }
    };

    fetchChats();
  }, []);

  return (
    <div
      className="fixed top-14 w-[360px] h-[90vh] bg-white shadow-lg border-l border-r border-gray-300 z-50 flex flex-col"
      style={{ right: `${right}px` }}
    >
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
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation && onSelectConversation(conv)}
            className={`flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer ${
              selectedConversation?.id === conv.id ? "bg-gray-200" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <img
                  src={getAvatarUrl(conv.avatar)}
                  alt={conv.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => globalHandleImageError(e)}
                />
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-5">
                  {conv.name}
                </span>
                {conv.message && (
                  <span className="text-xs text-gray-500 leading-4">
                    {conv.message}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400">{conv.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar; 