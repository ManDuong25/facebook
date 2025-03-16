import React from "react";

// 1. Import ảnh từ thư mục assets
import avatarImg from "../../../assets/images/avatar.jpg";
import group1Img from "../../../assets/images/group1.jpg";
import group2Img from "../../../assets/images/group2.jpg";

// 2. Thay vì dùng đường dẫn tuyệt đối, ta gán vào object
const menuItems = [
  { icon: "bi-people-fill", text: "Bạn bè" },
  { icon: "bi-clock-history", text: "Kỷ niệm" },
  { icon: "bi-bookmark-fill", text: "Đã lưu" },
  { icon: "bi-people", text: "Nhóm" },
  { icon: "bi-play-btn-fill", text: "Video" },
  { icon: "bi-shop", text: "Marketplace" },
  { icon: "bi-newspaper", text: "Bảng feed" },
];

const shortcuts = [
  { image: group1Img, name: "Cộng đồng Sinh viên SGU" },
  { image: group2Img, name: "SGU_Mobile Nâng cao" },
  { image: group1Img, name: "ĐH Sài Gòn (SGU)" },
];

const LeftSidebar = () => {
  return (
    <div className="w-[280px] bg-[#f0f2f5] px-4 py-3 space-y-6">
      {/* Avatar + Tên */}
      <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-300 rounded-lg py-2">
        <img
          src={avatarImg}          // <-- Sử dụng biến avatarImg
          alt="Avatar"
          className="w-9 h-9 rounded-full"
        />
        <span className="font-semibold text-[16px]">Lăng Khư</span>
      </div>

      {/* Menu chính */}
      <ul className="space-y-1">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-[#e4e6eb]"
          >
            <i
              className={`bi ${item.icon} text-[#1b74e4] w-9 h-9 text-[24px] flex justify-center items-center`}
            ></i>
            <span className="text-[15px] font-medium">{item.text}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-[#e4e6eb]">
          <i className="bi bi-chevron-down text-black bg-[#e4e6eb] w-9 h-9 text-[18px] rounded-full flex justify-center items-center"></i>
          <span>Xem thêm</span>
        </li>
      </ul>

      {/* Lối tắt */}
      <div>
        <h6 className="text-[16px] text-[#65676b] mb-3">Lối tắt của bạn</h6>
        <ul className="space-y-1">
          {shortcuts.map((shortcut, index) => (
            <li
              key={index}
              className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-[#f0f2f5]"
            >
              <img
                src={shortcut.image}  // <-- Dùng biến image đã import
                alt="Group"
                className="w-9 h-9 rounded-[5px]"
              />
              <span className="text-[14px] font-medium">{shortcut.name}</span>
            </li>
          ))}
          <li className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-[#e4e6eb]">
            <i className="bi bi-chevron-down text-black bg-[#e4e6eb] w-9 h-9 text-[18px] rounded-full flex justify-center items-center"></i>
            <span>Xem thêm</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeftSidebar;
