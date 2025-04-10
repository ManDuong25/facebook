import React from "react";
import images from "../../../assets/images"; 
import { getAvatarUrl, handleImageError } from "../../../utils/avatarUtils";

const ads = [
  {
    id: 1,
    title: "VnShop",
    description: "app.vnpay.vn",
    image: images.group1,
  },
  {
    id: 2,
    title: "Khớp lệnh nhanh hơn? Hãy đến với Exness.",
    description: "exness.com",
    image: images.group1,
  },
];

// Dữ liệu mẫu bạn bè với avatar
const friends = [
  { id: 1, name: "Dương Công Mẫn", avatar: null }, // Sử dụng avatar mặc định
  { id: 2, name: "Thanh Tuyền", avatar: null },
  { id: 3, name: "Nguyễn Trọng Thanh Hải", avatar: null },
  { id: 4, name: "Trần Thái Hoàng", avatar: null },
  { id: 5, name: "Lê Thế Minh", avatar: null },
  { id: 6, name: "Mỹ Duyên", avatar: null },
  { id: 7, name: "Mỹ Linh", avatar: null },
];

const AdItem = ({ title, description, image }) => (
  <div className="flex items-center mb-3 cursor-pointer hover:bg-gray-200 transition-colors">
    <img
      src={image}
      alt={title}
      className="w-[120px] h-[120px] object-cover rounded-lg mr-3"
      onError={handleImageError}
    />
    <div className="flex flex-col justify-center">
      <h5 className="text-base font-bold text-black leading-5">{title}</h5>
      <p className="text-sm text-[#65676B]">{description}</p>
    </div>
  </div>
);

const OnlineFriend = ({ name, avatar }) => (
  <div className="flex items-center relative cursor-pointer hover:bg-gray-200 transition-colors">
    <img
      src={getAvatarUrl(avatar)}
      alt={name}
      className="w-10 h-10 rounded-full mr-3 object-cover"
      onError={handleImageError}
    />
    <span className="absolute left-8 top-8 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
    <p className="text-sm text-[#65676B]">{name}</p>
  </div>
);

const RightSidebar = () => {
  return (
    <div className="w-80 p-4 bg-gray-100 rounded-lg">
      {/* PHẦN QUẢNG CÁO */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#65676B] mb-2">
          Được tài trợ
        </h3>
        {ads.map((ad) => (
          <AdItem key={ad.id} {...ad} />
        ))}
        <hr className="border-t border-gray-500 my-3" />
      </div>

      {/* PHẦN SINH NHẬT */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#65676B] mb-1">
          Sinh nhật
        </h3>
        <div className="flex items-center text-sm text-[#65676B] cursor-pointer hover:bg-gray-200 transition-colors p-2 rounded-lg">
          <i className="bi bi-gift text-2xl text-[#1877F2] mr-2"></i>
          <p>Hôm nay là sinh nhật của Hân Su.</p>
        </div>
        <hr className="border-t border-gray-500 my-3" />
      </div>

      {/* DANH SÁCH BẠN BÈ ONLINE */}
      <div>
        <h4 className="text-base font-semibold text-[#65676B] mb-2">
          Người liên hệ
        </h4>
        <div className="space-y-3">
          {friends.map((friend) => (
            <OnlineFriend key={friend.id} name={friend.name} avatar={friend.avatar} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;