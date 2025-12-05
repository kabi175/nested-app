package com.nested.app.repository;

import com.nested.app.entity.Fund;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundRepository extends JpaRepository<Fund, Long> {

  Optional<Fund> findFundByIsinCode(String isinCode);
}
