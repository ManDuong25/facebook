import React, { useState } from "react";
import { useSelector } from "react-redux";
import images from "../../../assets/images";
import CreatePostModal from "../../Modals/CreatePostModal";
import { getAvatarUrl, handleImageError } from "../../../utils/avatarUtils";

const actions = [
  { icon: "bi-camera-video", color: "text-red-500", label: "Video trực tiếp" },
  { icon: "bi-images", color: "text-green-500", label: "Ảnh/video" },
  { icon: "bi-emoji-smile", color: "text-yellow-500", label: "Cảm xúc/hoạt động" },
];

const ActionButton = ({ icon, color, label }) => (
  <button
    type="button"
    className="flex items-center gap-2 p-2 rounded-lg text-sm text-[#65676b] hover:bg-[#f0f2f5] focus:outline-none"
  >
    <i className={`bi ${icon} ${color} text-xl`}></i>
    <span>{label}</span>
  </button>
);

const CreatePost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector(state => state.auth.user);

  return (
    <>
      <div className="bg-white shadow-sm rounded-2xl p-4 border border-gray-300 border-t-gray-300/10">
        <div className="flex items-center mb-3">
          <img
            src={getAvatarUrl(user?.avatar)}
            alt="avatar"
            className="w-10 h-10 rounded-full mr-3 object-cover"
            onError={handleImageError}
          />
          <input
            type="text"
            className="flex-grow w-full bg-[#f0f2f5] focus:bg-[#e4e6eb] rounded-full px-4 py-2 text-sm outline-none"
            placeholder="Khư ơi, bạn đang nghĩ gì thế?"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        <div className="border-t border-gray-200 my-3"></div>
        <div className="flex justify-between">
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </div>
      {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default CreatePost;