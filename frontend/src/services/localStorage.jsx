// import { LogOut } from "./UseServices";

// Lưu item vào localStorage với thời hạn sống (seconds)
function setItemWithExpiration(key, value, expirationInHour = 0.5) {
    const now = new Date();
    const expirationTime = now.getTime() + expirationInHour * 60 * 60 * 1000;
    const item = {
        value: value,
        expirationTime: expirationTime,
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// Lấy item từ localStorage và kiểm tra thời gian hết hạn
function getItemWithExpiration(key) {
    const item = JSON.parse(localStorage.getItem(key));
    if (item && item.expirationTime > new Date().getTime()) {
        return item.value;
    } else if (item && item.expirationTime < new Date().getTime()) {
        // call api logout
        // await LogOut();
        // Xóa item khỏi localStorage nếu đã hết hạn
        localStorage.removeItem(key);
        return false;
    } else {
        localStorage.removeItem(key);
        return false;
    }
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    localStorage.removeItem('email');
}

export { setItemWithExpiration, getItemWithExpiration, removeToken };
