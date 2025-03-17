import React, { useRef, useState } from "react";
import images from "../../../assets/images"; 

const Stories = () => {
  const stories = [
    { id: 1, name: "Tạo tin", isCreate: true },
    { id: 2, name: "Sành Lounge Số 1 Thái Hà" },
    { id: 3, name: "Hoàng Văn" },
    { id: 4, name: "Hoàng Tuan Tech" },
    { id: 5, name: "Tuổi trẻ Đại học Sài Gòn" },
    { id: 6, name: "Nhà Hàng 5 Sao" },
    { id: 7, name: "Trà Sữa Ngon" },
    { id: 8, name: "Công Viên 4 Mùa" },
    { id: 9, name: "Chill Sky Bar" },
    { id: 10, name: "Cuộc Sống Đời Thường" },
  ];

  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleNext = () => {
    if (containerRef.current) {
      const newScrollPosition = scrollPosition + 110;
      containerRef.current.scrollTo({ left: newScrollPosition, behavior: "smooth" });
      setScrollPosition(newScrollPosition);
    }
  };

  const handlePrev = () => {
    if (containerRef.current) {
      const newScrollPosition = Math.max(0, scrollPosition - 110);
      containerRef.current.scrollTo({ left: newScrollPosition, behavior: "smooth" });
      setScrollPosition(newScrollPosition);
    }
  };

  return (
    <div className="relative w-full">
      {/* Container cuộn ngang */}
      <div
        ref={containerRef}
        className="flex w-full gap-2 py-2 overflow-x-auto scroll-smooth no-scrollbar"
        style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
      >
        {stories.map((story) => (
          <div
            key={story.id}
            className="relative w-[98px] h-[160px] flex-shrink-0 cursor-pointer overflow-hidden border border-gray-300 rounded-lg"
          >
            {story.isCreate ? (
              <div className="w-full h-full flex flex-col">
                <div className="h-[120px] w-full overflow-hidden">
                  <img
                    src={images.group1} // Sử dụng ảnh từ index.js
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-[40px] bg-white relative flex flex-col items-center justify-center">
                  <button className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-9 h-9 rounded-full bg-[#1877f2] text-white text-xl font-bold flex items-center justify-center border-4 border-white focus:outline-none">
                    +
                  </button>
                  <span className="mt-4 text-sm font-medium text-black">
                    {story.name}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={images.group1} // Sử dụng ảnh từ index.js
                  alt={story.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden border-2 border-[#1877f2]">
                  <img
                    src={images.avatarJpg} // Sử dụng ảnh từ index.js
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 w-full h-[50px] bg-gradient-to-t from-black/50 to-transparent flex items-end p-1">
                  <span className="text-white text-xs font-medium leading-tight">
                    {story.name}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Nút quay về (chỉ hiển thị khi đã cuộn) */}
      {scrollPosition > 0 && (
        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-300 shadow-lg"
        >
          <i className="bi bi-chevron-left text-black text-lg"></i>
        </button>
      )}

      {/* Nút chuyển tiếp (ẩn khi cuộn hết) */}
      {scrollPosition < (stories.length - 5) * 110 && (
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-300 shadow-lg"
        >
          <i className="bi bi-chevron-right text-black text-lg"></i>
        </button>
      )}
    </div>
  );
};

export default Stories;
