package backend.backend.service;

import backend.backend.model.Post;
import backend.backend.model.Share;
import backend.backend.model.User;
import backend.backend.repository.PostRepository;
import backend.backend.repository.ShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ShareRepository shareRepository;

    // Tạo bài viết mới
    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    // Lấy tất cả bài viết
    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        // Sắp xếp bài viết theo thời gian tạo mới nhất
        posts.sort(Comparator.comparing(Post::getCreatedAt).reversed());
        return posts;
    }

    // Lấy bài viết theo id
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    // Lấy bài viết của 1 user và sắp xếp theo thời gian tạo mới nhất
    public List<Post> getPostsByUser(User user) {
        return postRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // Lấy bài viết đã chia sẻ của 1 user
    public List<Post> getSharedPostsByUser(User user) {
        List<Share> shares = shareRepository.findByUser(user);
        List<Post> sharedPosts = shares.stream()
                .map(Share::getPost)
                .collect(Collectors.toList());

        // Sắp xếp bài viết theo thời gian tạo mới nhất
        sharedPosts.sort(Comparator.comparing(Post::getCreatedAt).reversed());
        return sharedPosts;
    }

    // Lấy tất cả bài viết và bài viết đã chia sẻ của 1 user
    public List<Post> getAllPostsByUser(User user) {
        List<Post> result = new ArrayList<>();

        // Thêm bài viết của user
        result.addAll(getPostsByUser(user));

        // Thêm bài viết đã chia sẻ
        result.addAll(getSharedPostsByUser(user));

        // Sắp xếp tất cả bài viết theo thời gian tạo mới nhất
        result.sort(Comparator.comparing(Post::getCreatedAt).reversed());

        return result;
    }

    // Cập nhật bài viết
    public Post updatePost(Long id, Post postUpdate) {
        return postRepository.findById(id)
                .map(existingPost -> {
                    existingPost.setContent(postUpdate.getContent());
                    existingPost.setImageUrl(postUpdate.getImageUrl());
                    existingPost.setVideoUrl(postUpdate.getVideoUrl());
                    existingPost.setUpdatedAt(LocalDateTime.now());
                    return postRepository.save(existingPost);
                })
                .orElse(null);
    }

    // Xoá bài viết
    public boolean deletePost(Long id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Đếm tổng số bài viết
    public long countAllPosts() {
        return postRepository.count();
    }

    // Đếm số bài viết được tạo trong n ngày qua
    public int countPostsInLastDays(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return postRepository.countByCreatedAtAfter(startDate);
    }


}