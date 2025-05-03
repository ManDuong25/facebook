const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");

// Đường dẫn đến hình ảnh test (thay đổi tùy theo hệ thống của bạn)
const imagePath = "./test-image.jpg"; // Hoặc .png, .gif,... bất kỳ hình ảnh nào

// Kiểm tra file tồn tại
if (!fs.existsSync(imagePath)) {
  console.error(`Error: File ${imagePath} not found`);
  process.exit(1);
}

// Tạo FormData
const form = new FormData();
form.append("userId", 1); // Thay đổi ID người dùng nếu cần
form.append("avatar", fs.createReadStream(imagePath));

// Gửi request
async function uploadAvatar() {
  try {
    const response = await fetch("http://localhost:8080/api/users/avatar", {
      method: "POST",
      body: form,
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
    } catch (err) {}
  } catch (error) {
    console.error("Error:", error);
  }
}

uploadAvatar();
