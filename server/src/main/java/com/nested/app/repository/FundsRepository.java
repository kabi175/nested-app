package com.nested.app.repository;

import com.nested.app.entity.Fund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundsRepository extends JpaRepository<Fund, Long> {
    List<Fund> findAllBySchemeCodeIn(List<String> schemeCodes);
}
