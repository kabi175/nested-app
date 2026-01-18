package com.nested.app.repository;

import com.nested.app.entity.User;
import com.nested.app.entity.UserVerification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserVerificationRepository extends JpaRepository<UserVerification, Long> {
  List<UserVerification> findByUser(User user);

  void deleteByUser(User user);
}
