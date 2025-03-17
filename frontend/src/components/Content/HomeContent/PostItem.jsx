import React from "react";
import images from "../../../assets/images"; 

const post = {
  avatar: images.avatarJpg, 
  name: "VKR News",
  time: "8 phút trước",
  content: "🔥 Tiết lộ thêm ảnh thời hẹn hò...",
  image: images.avatarJpg, 
};

const actions = [
  { icon: "bi-hand-thumbs-up", label: "Thích" },
  { icon: "bi-chat", label: "Bình luận" },
  { icon: "bi-share", label: "Chia sẻ" },
];

const ActionButton = ({ icon, label }) => (
  <button className="flex items-center gap-2 p-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
    <i className={`bi ${icon}`}></i> {label}
  </button>
);

const PostItem = () => (
  <div className="w-full bg-white shadow rounded-lg overflow-hidden mt-3">
    <div className="p-3">
      <div className="flex items-center">
        <img
          src={post.avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full mr-2.5"
        />
        <div>
          <h6 className="m-0 text-sm font-bold">{post.name}</h6>
          <small className="text-xs text-gray-500">{post.time}</small>
        </div>
      </div>
      <p className="mt-2 text-sm">{post.content}</p>
    </div>
    <img src={post.image} alt="post" className="w-full h-auto" />
    <div className="p-3">
      <div className="flex justify-between">
        {actions.map((action, index) => (
          <ActionButton key={index} {...action} />
        ))}
      </div>
    </div>
  </div>
);

export default PostItem;
