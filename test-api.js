const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Đường dẫn đến hình ảnh test (thay đổi tùy theo hệ thống của bạn)
const imagePath = './test-image.jpg'; // Hoặc .png, .gif,... bất kỳ hình ảnh nào

// Kiểm tra file tồn tại
if (!fs.existsSync(imagePath)) {
  console.error(`Error: File ${imagePath} not found`);
  process.exit(1);
}

// Tạo FormData
const form = new FormData();
form.append('userId', 1); // Thay đổi ID người dùng nếu cần
form.append('avatar', fs.createReadStream(imagePath));

console.log('Sending request to upload avatar...');
console.log(`Image path: ${imagePath}`);
console.log(`Image size: ${fs.statSync(imagePath).size} bytes`);

// Gửi request
async function uploadAvatar() {
  try {
    const response = await fetch('http://localhost:8080/api/users/avatar', {
      method: 'POST',
      body: form,
    });

    console.log('Status:', response.status);
    console.log('Status text:', response.statusText);

    const text = await response.text();
    console.log('Response:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed response:', JSON.stringify(data, null, 2));
    } catch (err) {
      console.log('Could not parse response as JSON');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

uploadAvatar(); 