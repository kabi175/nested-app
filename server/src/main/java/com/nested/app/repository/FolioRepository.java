package com.nested.app.repository;

import com.nested.app.entity.Folio;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolioRepository extends JpaRepository<Folio, Long> {
  Optional<Folio> findByFundId(Long fundId);

  Optional<Folio> findByRef(String ref);
}
