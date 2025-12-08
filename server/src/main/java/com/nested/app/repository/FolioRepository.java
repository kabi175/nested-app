package com.nested.app.repository;

import com.nested.app.entity.Folio;
import com.nested.app.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolioRepository extends JpaRepository<Folio, Long> {
  Optional<Folio> findFirstByFundIdAndUser(Long fundId, User user);

  Optional<Folio> findByRef(String ref);
}
