package backend.backend.service;

import backend.backend.model.Post;
import backend.backend.model.Share;
import backend.backend.model.User;
import backend.backend.repository.ShareRepository;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Service
public class ShareService {

    @Autowired
    private ShareRepository shareRepository;

    // Thêm lượt chia sẻ cho bài viết
    public Share addShare(Share share) {
        return shareRepository.save(share);
    }

    // Lấy danh sách share theo bài viết
    public List<Share> getSharesByPost(Post post) {
        return shareRepository.findByPost(post);
    }

    // Lấy danh sách share của 1 user
    public List<Share> getSharesByUser(User user) {
        return shareRepository.findByUser(user);
    }

    // Xoá lượt share
    public boolean removeShare(Long id) {
        if(shareRepository.existsById(id)) {
            shareRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Đếm số lượng share của một bài viết
    public int countSharesByPost(Post post) {
        return shareRepository.findByPost(post).size();
    }

    // Đếm số lượng share của một bài viết theo postId
    public int countSharesByPostId(Long postId) {
        Post post = new Post();
        post.setId(postId);
        return countSharesByPost(post);
    }

    /**
     * Đếm số lượng chia sẻ của một người dùng
     */
    public long countSharesByUser(User user) {
        return shareRepository.countByUser(user);
    }
}
