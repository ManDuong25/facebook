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
        return postRepository.findAll();
    }

    // Lấy bài viết theo id
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    // Lấy bài viết của 1 user
    public List<Post> getPostsByUser(User user) {
        return postRepository.findByUser(user);
    }
    
    // Lấy bài viết đã chia sẻ của 1 user
    public List<Post> getSharedPostsByUser(User user) {
        List<Share> shares = shareRepository.findByUser(user);
        return shares.stream()
                .map(Share::getPost)
                .collect(Collectors.toList());
    }
    
    // Lấy tất cả bài viết và bài viết đã chia sẻ của 1 user
    public List<Post> getAllPostsByUser(User user) {
        List<Post> result = new ArrayList<>();
        
        // Thêm bài viết của user
        result.addAll(getPostsByUser(user));
        
        // Thêm bài viết đã chia sẻ
        result.addAll(getSharedPostsByUser(user));
        
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
}