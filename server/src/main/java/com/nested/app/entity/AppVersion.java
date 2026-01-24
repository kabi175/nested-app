package com.nested.app.entity;

import com.nested.app.enums.Platform;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "app_versions")
public class AppVersion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, unique = true)
  private Platform platform;

  @Column(nullable = false)
  private String minSupportedVersion;

  @Column(nullable = false)
  private String latestVersion;

  @Column(columnDefinition = "TEXT")
  private String message;

  @Column(nullable = false)
  private String storeUrl;

  @Column(columnDefinition = "TEXT")
  private String releaseNotes;

  @Builder.Default
  @Column(nullable = false)
  private Integer minBuildNumber = 0;

  @Builder.Default
  @Column(nullable = false)
  private Integer rolloutPercentage = 100;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;
}
