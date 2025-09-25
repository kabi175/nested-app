package com.nested.app.repository;

import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Fund;
import com.nested.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByFirebaseUid(String firebaseUid);
}
