-- Dữ liệu mẫu cho ứng dụng Facebook Clone
-- Sử dụng với spring.sql.init.mode=always trong application.properties

-- Thêm dữ liệu cho bảng users
INSERT INTO users (username, email, password, full_name, bio, avatar, cover_image, phone, address, role, created_at) VALUES
('admin', 'admin@example.com', '$2a$10$gYQPDsABXZVOHtBCGKajyOpyYHuWFdk9Cbw98n3gW6/aeAbQMpRky', 'Admin User', 'Administrator of the system', 'default.png', 'cover.jpg', '0987654321', 'Hanoi, Vietnam', 'ADMIN', NOW()),
('johndoe', 'john@example.com', '$2a$10$gYQPDsABXZVOHtBCGKajyOpyYHuWFdk9Cbw98n3gW6/aeAbQMpRky', 'John Doe', 'Software Engineer', 'user1.jpg', 'cover1.jpg', '0123456789', 'Ho Chi Minh City, Vietnam', 'USER', NOW()),
('janedoe', 'jane@example.com', '$2a$10$gYQPDsABXZVOHtBCGKajyOpyYHuWFdk9Cbw98n3gW6/aeAbQMpRky', 'Jane Doe', 'UX Designer', 'user2.jpg', 'cover2.jpg', '0123456788', 'Da Nang, Vietnam', 'USER', NOW()),
('bobsmith', 'bob@example.com', '$2a$10$gYQPDsABXZVOHtBCGKajyOpyYHuWFdk9Cbw98n3gW6/aeAbQMpRky', 'Bob Smith', 'Marketing Manager', 'user3.jpg', 'cover3.jpg', '0123456787', 'Nha Trang, Vietnam', 'USER', NOW()),
('alicejones', 'alice@example.com', '$2a$10$gYQPDsABXZVOHtBCGKajyOpyYHuWFdk9Cbw98n3gW6/aeAbQMpRky', 'Alice Jones', 'Product Manager', 'user4.jpg', 'cover4.jpg', '0123456786', 'Hue, Vietnam', 'USER', NOW());

-- Thêm dữ liệu mẫu cho posts
INSERT INTO posts (user_id, content, image, video, created_at, updated_at) VALUES
(2, 'This is my first post on this platform!', 'post1.jpg', NULL, NOW(), NOW()),
(3, 'Just finished a great UX design project!', 'post2.jpg', NULL, NOW(), NOW()),
(4, 'Marketing trends to watch in 2023', NULL, 'video1.mp4', NOW(), NOW()),
(5, 'Product management insights from my recent project', 'post3.jpg', NULL, NOW(), NOW()),
(2, 'Beautiful day in Ho Chi Minh City', 'post4.jpg', NULL, NOW(), NOW());

-- Thêm dữ liệu cho comments
INSERT INTO comments (post_id, user_id, content, created_at) VALUES
(1, 3, 'Welcome to the platform!', NOW()),
(1, 4, 'Nice to see you here!', NOW()),
(2, 2, 'Great work! Can you share more details?', NOW()),
(3, 5, 'These trends are spot on!', NOW()),
(4, 3, 'Very insightful, thanks for sharing!', NOW());

-- Thêm dữ liệu cho likes
INSERT INTO likes (user_id, post_id, comment_id, created_at) VALUES
(3, 1, NULL, NOW()),
(4, 1, NULL, NOW()),
(5, 1, NULL, NOW()),
(2, 2, NULL, NOW()),
(4, 2, NULL, NOW()),
(NULL, NULL, 1, NOW()),
(NULL, NULL, 3, NOW());

-- Thêm dữ liệu cho shares
INSERT INTO shares (user_id, post_id, content, created_at) VALUES
(4, 1, 'Check out this post from John!', NOW()),
(5, 2, 'Great UX design insights from Jane', NOW());

-- Thêm dữ liệu cho friend_requests
INSERT INTO friend_requests (sender_id, receiver_id, status, created_at) VALUES
(2, 3, 'PENDING', NOW()),
(4, 2, 'PENDING', NOW()),
(5, 3, 'PENDING', NOW());

-- Thêm dữ liệu cho friends
INSERT INTO friends (user1_id, user2_id, since) VALUES
(2, 4, NOW()),
(3, 5, NOW());

-- Thêm dữ liệu cho chat_rooms
INSERT INTO chat_rooms (name, type, created_at) VALUES
('John and Bob', 'PRIVATE', NOW()),
('Jane and Alice', 'PRIVATE', NOW()),
('Project Team', 'GROUP', NOW());

-- Thêm dữ liệu cho chat_room_members
INSERT INTO chat_room_members (chat_room_id, user_id, joined_at) VALUES
(1, 2, NOW()),
(1, 4, NOW()),
(2, 3, NOW()),
(2, 5, NOW()),
(3, 2, NOW()),
(3, 3, NOW()),
(3, 4, NOW()),
(3, 5, NOW());

-- Thêm dữ liệu cho messages
INSERT INTO messages (chat_room_id, sender_id, content, created_at) VALUES
(1, 2, 'Hey Bob, how are you?', NOW()),
(1, 4, 'Hi John, I''m doing great! How about you?', NOW()),
(2, 3, 'Alice, do you have time to discuss the design?', NOW()),
(2, 5, 'Sure Jane, how about tomorrow at 10 AM?', NOW()),
(3, 2, 'Team, we need to discuss the project timeline', NOW()),
(3, 3, 'I''m available tomorrow', NOW()),
(3, 4, 'Works for me too', NOW());

-- Thêm dữ liệu cho notifications
INSERT INTO notifications (user_id, type, content, reference_id, is_read, created_at) VALUES
(2, 'POST_LIKE', 'Jane Doe liked your post', 1, FALSE, NOW()),
(2, 'POST_COMMENT', 'Jane Doe commented on your post', 1, FALSE, NOW()),
(3, 'FRIEND_REQUEST', 'John Doe sent you a friend request', 1, FALSE, NOW()),
(2, 'MESSAGE', 'You have a new message from Bob Smith', 1, TRUE, NOW()),
(3, 'FRIEND_REQUEST', 'Alice Jones sent you a friend request', 3, FALSE, NOW());

-- Note: Mật khẩu mẫu là "password" đã được hash với BCrypt 