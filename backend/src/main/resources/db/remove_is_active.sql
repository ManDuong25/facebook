-- Xóa trường is_active khỏi bảng users vì không cần thiết
ALTER TABLE users DROP COLUMN is_active;
