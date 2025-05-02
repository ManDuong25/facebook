package backend.backend.service;

import backend.backend.model.Post;
import backend.backend.model.PostLike;
import backend.backend.model.User;
import backend.backend.repository.PostLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostLikeService {

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    // Thêm lượt like cho bài viết
    public PostLike likePost(Long postId, Long userId) {
        Post post = postService.getPostById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Optional<PostLike> existingLike = postLikeRepository.findByPostAndUser(post, user);
        if (existingLike.isPresent()) {
            throw new RuntimeException("User already liked this post");
        }

        PostLike like = new PostLike();
        like.setPost(post);
        like.setUser(user);
        return postLikeRepository.save(like);
    }

    // Xóa lượt like
    public void unlikePost(Long postId, Long userId) {
        Post post = postService.getPostById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        PostLike like = postLikeRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new RuntimeException("Like not found"));
        postLikeRepository.delete(like);
    }

    // Lấy danh sách like theo bài viết
    public List<PostLike> getLikesByPost(Post post) {
        if (post == null || post.getId() == null) {
            throw new IllegalArgumentException("Post or post ID cannot be null");
        }
        return postLikeRepository.findByPost(post);
    }

    // Lấy danh sách like của 1 user
    public List<PostLike> getLikesByUser(User user) {
        return postLikeRepository.findByUser(user);
    }

    // Đếm số lượng like của một bài viết
    public int countLikesByPost(Post post) {
        return postLikeRepository.findByPost(post).size();
    }

    // Đếm số lượng like của một bài viết theo postId
    public int countLikesByPostId(Long postId) {
        Post post = postService.getPostById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return countLikesByPost(post);
    }
}