import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import images from "../../../assets/images";
import { getAvatarUrl, handleImageError } from "../../../utils/avatarUtils";

const menuItems = [
  { icon: "bi-people-fill", text: "Bạn bè", link: "/friends" },
  { icon: "bi-clock-history", text: "Kỷ niệm", link: "/memories" },
  { icon: "bi-bookmark-fill", text: "Đã lưu", link: "/saved" },
  { icon: "bi-people", text: "Nhóm", link: "/groups" },
  { icon: "bi-play-btn-fill", text: "Video", link: "/videos" },
  { icon: "bi-shop", text: "Marketplace", link: "/marketplace" },
  { icon: "bi-newspaper", text: "Bảng feed", link: "/feeds" },
];

const shortcuts = [
  { image: images.group1, name: "Cộng đồng Sinh viên SGU", link: "/groups/sgu-students" },
  { image: images.group2, name: "SGU_Mobile Nâng cao", link: "/groups/sgu-mobile" },
  { image: images.group1, name: "ĐH Sài Gòn (SGU)", link: "/groups/sgu" },
];

const LeftSidebar = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const getUserDisplayName = () => user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(): "Người dùng";

  return (
    <div className="w-[280px] bg-[#f0f2f5] px-4 py-3 space-y-6">
      <div onClick={() => navigate("/profile")} className="flex items-center gap-3 cursor-pointer hover:bg-gray-300 rounded-lg py-2">
        <img
          src={getAvatarUrl(user?.avatar)}
          alt="Avatar"
          className="w-9 h-9 rounded-full"
          onError={handleImageError}
        />
        <span className="font-semibold text-[16px]">{getUserDisplayName()}</span>
      </div>

      <ul className="space-y-1">
        {menuItems.map((item, index) => (
          <li key={index} onClick={() => navigate(item.link)} className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-[#e4e6eb]">
            <i className={`bi ${item.icon} text-[#1b74e4] w-9 h-9 text-[24px] flex justify-center items-center`}></i>
            <span className="text-[15px] font-medium">{item.text}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-[#e4e6eb]">
          <i className="bi bi-chevron-down text-black bg-[#e4e6eb] w-9 h-9 text-[18px] rounded-full flex justify-center items-center"></i>
          <span>Xem thêm</span>
        </li>
      </ul>

      <div>
        <h6 className="text-[16px] text-[#65676b] mb-3">Lối tắt của bạn</h6>
        <ul className="space-y-1">
          {shortcuts.map((shortcut, index) => (
            <li key={index} onClick={() => navigate(shortcut.link)} className="flex items-center gap-3 py-2 rounded-lg cursor-pointer hover:bg-[#f0f2f5]">
              <img src={shortcut.image} alt="Group" className="w-9 h-9 rounded-[5px]" />
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
