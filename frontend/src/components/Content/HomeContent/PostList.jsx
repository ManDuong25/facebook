import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PostItem from "./PostItem";
import { setPosts } from "../../../redux/features/postSlice";
import { getAllPosts } from "../../../services/api";

const PostList = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.post.posts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsData = await getAllPosts();
        console.log("✅ Kết nối API thành công! Số lượng bài viết:", postsData?.length);
        
        // Kiểm tra và loại bỏ các bài viết trùng lặp theo ID
        if (Array.isArray(postsData)) {
          // Sử dụng Map để loại bỏ các bài viết trùng lặp
          const uniquePostsMap = new Map();
          postsData.forEach(post => {
            if (post && post.id) {
              // Chỉ thêm vào Map nếu ID chưa tồn tại
              uniquePostsMap.set(post.id, post);
            }
          });
          
          // Chuyển Map thành mảng bài viết duy nhất
          const uniquePosts = Array.from(uniquePostsMap.values());
          console.log("✅ Đã xử lý bài viết trùng lặp. Số lượng ban đầu:", postsData.length, 
                      "Số lượng sau xử lý:", uniquePosts.length);
          
          // Sắp xếp bài viết theo thời gian (mới nhất lên đầu)
          const sortedPosts = uniquePosts.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          dispatch(setPosts(sortedPosts));
        } else {
          console.error("❌ Dữ liệu trả về không phải là mảng:", postsData);
          setError("Dữ liệu không hợp lệ");
          dispatch(setPosts([]));
        }
      } catch (error) {
        console.error("❌ Lỗi khi kết nối API:", error);
        console.log("Chi tiết lỗi:", error.response);
        setError("Không thể tải bài viết");
        dispatch(setPosts([]));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [dispatch]);

  if (loading) {
    return <div className="p-4 text-center">Đang tải bài viết...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!posts.length) {
    return <div className="p-4 text-center">Chưa có bài viết nào.</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;