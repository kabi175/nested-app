package com.nested.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nested.app.entity.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    List<Document> findByUserId(String userid);

    Page<Document> findByUserId(String userid, Pageable pageable);

    Optional<Document> findByIdAndUserId(Long id, String userid);

}
