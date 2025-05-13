package backend.backend.service;

import backend.backend.model.Post;
import backend.backend.model.Share;
import backend.backend.model.User;
import backend.backend.repository.PostRepository;
import backend.backend.repository.ShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    // Lấy tất cả bài viết (cho admin) - bao gồm cả bài viết đã xóa
    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        // Sắp xếp bài viết theo thời gian tạo mới nhất
        posts.sort(Comparator.comparing(Post::getCreatedAt).reversed());
        return posts;
    }

    // Lấy tất cả bài viết chưa bị xóa (cho admin)
    public List<Post> getAllNotDeletedPosts() {
        List<Post> posts = postRepository.findByDeletedAtIsNull();
        // Sắp xếp bài viết theo thời gian tạo mới nhất
        posts.sort(Comparator.comparing(Post::getCreatedAt).reversed());
        return posts;
    }

    // Lấy tất cả bài viết có visible=true và chưa bị xóa (cho người dùng thông
    // thường)
    public List<Post> getAllVisiblePosts() {
        List<Post> result = new ArrayList<>();

        // Lấy tất cả bài viết gốc
        List<Post> originalPosts = postRepository.findByVisibleTrueAndDeletedAtIsNull();
        result.addAll(originalPosts);

        // Lấy tất cả bài viết đã chia sẻ
        List<Share> shares = shareRepository.findAll();
        shares.stream()
                .map(share -> {
                    Post post = share.getPost();
                    if (post.getVisible() != null && post.getVisible() && post.getDeletedAt() == null) {
                        // Tạo bản sao của bài viết
                        Post sharedPost = new Post();
                        sharedPost.setId(post.getId());
                        sharedPost.setUser(post.getUser());
                        sharedPost.setContent(post.getContent());
                        sharedPost.setImageUrl(post.getImageUrl());
                        sharedPost.setVideoUrl(post.getVideoUrl());
                        sharedPost.setVisible(post.getVisible());
                        sharedPost.setCreatedAt(post.getCreatedAt());
                        sharedPost.setUpdatedAt(post.getUpdatedAt());
                        sharedPost.setDeletedAt(post.getDeletedAt());
                        // Thêm thông tin share
                        sharedPost.setShareId(share.getId());
                        sharedPost.setSharedAt(share.getSharedAt());
                        return sharedPost;
                    }
                    return null;
                })
                .filter(post -> post != null)
                .forEach(result::add);

        // Sắp xếp tất cả bài viết theo thời gian mới nhất
        result.sort((p1, p2) -> {
            LocalDateTime time1 = p1.getSharedAt() != null ? p1.getSharedAt() : p1.getCreatedAt();
            LocalDateTime time2 = p2.getSharedAt() != null ? p2.getSharedAt() : p2.getCreatedAt();
            return time2.compareTo(time1);
        });

        return result;
    }

    // Lấy bài viết theo id
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    // Lấy bài viết chưa bị xóa theo id
    public Optional<Post> getNotDeletedPostById(Long id) {
        Optional<Post> post = postRepository.findById(id);
        if (post.isPresent() && post.get().getDeletedAt() == null) {
            return post;
        }
        return Optional.empty();
    }

    // Lấy bài viết của 1 user và sắp xếp theo thời gian tạo mới nhất (cho admin) -
    // bao gồm cả bài viết đã xóa
    public List<Post> getPostsByUser(User user) {
        return postRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // Lấy bài viết chưa bị xóa của 1 user (cho admin)
    public List<Post> getNotDeletedPostsByUser(User user) {
        return postRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);
    }

    // Lấy bài viết có visible=true và chưa bị xóa của 1 user (cho người dùng thông
    // thường)
    public List<Post> getVisiblePostsByUser(User user) {
        return postRepository.findByUserAndVisibleTrueAndDeletedAtIsNullOrderByCreatedAtDesc(user);
    }

    // Lấy danh sách bài viết có phân trang và tìm kiếm (bao gồm cả bài viết đã xóa
    // - chỉ dùng cho admin cấp cao)
    public Page<Post> getPosts(Long userId, String searchTerm, int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        if (userId != null && searchTerm != null && !searchTerm.isEmpty()) {
            return postRepository.findByUserIdAndContentContaining(userId, searchTerm, pageable);
        } else if (userId != null) {
            return postRepository.findByUserId(userId, pageable);
        } else if (searchTerm != null && !searchTerm.isEmpty()) {
            return postRepository.findByContentContaining(searchTerm, pageable);
        } else {
            return postRepository.findAll(pageable);
        }
    }

    // Lấy danh sách bài viết chưa bị xóa mềm có phân trang và tìm kiếm
    public Page<Post> getNotDeletedPosts(Long userId, String searchTerm, int page, int size, String sortBy,
            String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        if (userId != null && searchTerm != null && !searchTerm.isEmpty()) {
            // Tìm kiếm theo userId và (nội dung hoặc thông tin người dùng)
            return postRepository.findByUserIdAndContentOrUserInfo(userId, searchTerm, pageable);
        } else if (userId != null) {
            return postRepository.findByUserId(userId, pageable);
        } else if (searchTerm != null && !searchTerm.isEmpty()) {
            // Tìm kiếm theo nội dung hoặc thông tin người dùng
            return postRepository.findByContentOrUserInfo(searchTerm, pageable);
        } else {
            return postRepository.findAllNotDeleted(pageable);
        }
    }

    // Cập nhật trạng thái hiển thị của bài viết
    public Post updatePostVisibility(Long id, boolean visible) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));

        post.setVisible(visible);
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // Lấy bài viết đã chia sẻ của 1 user (bao gồm cả bài viết đã ẩn và đã xóa)
    public List<Post> getSharedPostsByUser(User user) {
        List<Share> shares = shareRepository.findByUser(user);

        // Sắp xếp bài viết theo thời gian chia sẻ mới nhất
        shares.sort(Comparator.comparing(Share::getSharedAt).reversed());

        // Thêm shareId và sharedAt vào mỗi bài viết
        return shares.stream()
                .map(share -> {
                    Post post = share.getPost();
                    // Tạo một bản sao của bài viết để tránh ảnh hưởng đến bài viết gốc
                    Post sharedPost = new Post();
                    sharedPost.setId(post.getId());
                    sharedPost.setUser(post.getUser());
                    sharedPost.setContent(post.getContent());
                    sharedPost.setImageUrl(post.getImageUrl());
                    sharedPost.setVideoUrl(post.getVideoUrl());
                    sharedPost.setVisible(post.getVisible());
                    sharedPost.setCreatedAt(post.getCreatedAt());
                    sharedPost.setUpdatedAt(post.getUpdatedAt());
                    sharedPost.setDeletedAt(post.getDeletedAt());
                    // Thêm thông tin share
                    sharedPost.setShareId(share.getId());
                    sharedPost.setSharedAt(share.getSharedAt());
                    return sharedPost;
                })
                .collect(Collectors.toList());
    }

    // Lấy bài viết đã chia sẻ của 1 user (chỉ lấy bài viết có visible=true và chưa
    // bị xóa)
    public List<Post> getVisibleSharedPostsByUser(User user) {
        List<Share> shares = shareRepository.findByUser(user);

        // Sắp xếp bài viết theo thời gian chia sẻ mới nhất
        shares.sort(Comparator.comparing(Share::getSharedAt).reversed());

        // Thêm shareId và sharedAt vào mỗi bài viết và lọc theo điều kiện
        return shares.stream()
                .map(share -> {
                    Post post = share.getPost();
                    // Tạo một bản sao của bài viết để tránh ảnh hưởng đến bài viết gốc
                    Post sharedPost = new Post();
                    sharedPost.setId(post.getId());
                    sharedPost.setUser(post.getUser());
                    sharedPost.setContent(post.getContent());
                    sharedPost.setImageUrl(post.getImageUrl());
                    sharedPost.setVideoUrl(post.getVideoUrl());
                    sharedPost.setVisible(post.getVisible());
                    sharedPost.setCreatedAt(post.getCreatedAt());
                    sharedPost.setUpdatedAt(post.getUpdatedAt());
                    sharedPost.setDeletedAt(post.getDeletedAt());
                    // Thêm thông tin share
                    sharedPost.setShareId(share.getId());
                    sharedPost.setSharedAt(share.getSharedAt());
                    return sharedPost;
                })
                .filter(post -> post.getVisible() != null && post.getVisible() && post.getDeletedAt() == null)
                .collect(Collectors.toList());
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

    // Xoá mềm bài viết
    public boolean deletePost(Long id) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            post.setDeletedAt(LocalDateTime.now());
            postRepository.save(post);
            return true;
        }
        return false;
    }

    // Khôi phục bài viết đã xóa
    public boolean restorePost(Long id) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            post.setDeletedAt(null);
            postRepository.save(post);
            return true;
        }
        return false;
    }

    // Xóa vĩnh viễn bài viết (hard delete - chỉ dành cho admin)
    public boolean permanentDeletePost(Long id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Đếm tổng số bài viết (bao gồm cả bài viết đã xóa)
    public long countAllPosts() {
        return postRepository.count();
    }

    // Đếm tổng số bài viết chưa bị xóa
    public long countAllNotDeletedPosts() {
        return postRepository.countByDeletedAtIsNull();
    }

    // Đếm số bài viết được tạo trong n ngày qua (chỉ đếm bài viết chưa bị xóa)
    public int countPostsInLastDays(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return postRepository.countByCreatedAtAfterAndDeletedAtIsNull(startDate);
    }

    // Lấy danh sách bài viết đã bị xóa có phân trang
    public Page<Post> getDeletedPosts(Pageable pageable) {
        return postRepository.findByDeletedAtIsNotNull(pageable);
    }

    /**
     * Đếm số lượng bài viết của một người dùng
     */
    public long countPostsByUser(User user) {
        return postRepository.countByUserAndDeletedAtIsNull(user);
    }

    /**
     * Lấy các bài viết gần đây của một người dùng
     */
    public List<Post> getRecentPostsByUser(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findByUserAndDeletedAtIsNull(user, pageable);
        return postPage.getContent();
    }

    public List<Post> getPostsByUsers(List<User> users) {
        return postRepository.findByUserInAndVisibleTrueAndDeletedAtIsNullOrderByCreatedAtDesc(users);
    }
}