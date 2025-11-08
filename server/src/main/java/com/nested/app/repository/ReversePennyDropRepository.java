package com.nested.app.repository;

import com.nested.app.entity.ReversePennyDrop;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReversePennyDropRepository extends JpaRepository<ReversePennyDrop, Long> {

    ReversePennyDrop findByReferenceId(String referenceId);
}
