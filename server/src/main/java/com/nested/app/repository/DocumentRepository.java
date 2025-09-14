package com.nested.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nested.app.entity.DocumentEntity;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {
    
    List<DocumentEntity> findByUserId(String userid);

    Page<DocumentEntity> findByUserId(String userid, Pageable pageable);

    Optional<DocumentEntity> findByIdAndUserId(Long id, String userid);

}
