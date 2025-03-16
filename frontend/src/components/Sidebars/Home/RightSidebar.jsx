import React from "react";

// Import ảnh từ thư mục src/assets/images (điều chỉnh đường dẫn nếu cần)
import group1Img from "../../../assets/images/group1.jpg";
import avatarImg from "../../../assets/images/avatar.jpg";

const ads = [
  {
    id: 1,
    title: "VnShop",
    description: "app.vnpay.vn",
    image: group1Img,
  },
  {
    id: 2,
    title: "Khớp lệnh nhanh hơn? Hãy đến với Exness.",
    description: "exness.com",
    image: group1Img,
  },
];

const friends = [
  "Dương Công Mẫn",
  "Thanh Tuyền",
  "Nguyễn Trọng Thanh Hải",
  "Trần Thái Hoàng",
  "Lê Thế Minh",
  "Mỹ Duyên",
  "Mỹ Linh",
];

const AdItem = ({ title, description, image }) => (
  <div className="flex items-center mb-3 cursor-pointer hover:bg-gray-200 transition-colors">
    <img
      src={image}
      alt={title}
      className="w-[120px] h-[120px] object-cover rounded-lg mr-3"
    />
    <div className="flex flex-col justify-center">
      <h5 className="text-base font-bold text-black leading-5">{title}</h5>
      <p className="text-sm text-[#65676B]">{description}</p>
    </div>
  </div>
);

const OnlineFriend = ({ name }) => (
  <div className="flex items-center relative cursor-pointer hover:bg-gray-200 transition-colors">
    <img
      src={avatarImg}
      alt={name}
      className="w-10 h-10 rounded-full mr-3 object-cover"
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
          {friends.map((name, index) => (
            <OnlineFriend key={index} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
