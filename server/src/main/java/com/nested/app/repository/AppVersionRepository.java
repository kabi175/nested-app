package com.nested.app.repository;

import com.nested.app.entity.AppVersion;
import com.nested.app.enums.Platform;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppVersionRepository extends JpaRepository<AppVersion, Long> {
  Optional<AppVersion> findByPlatform(Platform platform);
}
