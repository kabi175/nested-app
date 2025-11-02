package com.nested.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nested.app.entity.Education;

/**
 * Repository interface for Education entity
 * Provides database access methods for education records
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
  List<Education> findByType(Education.Type type);

  /**
   * Search education records by name or country (case-insensitive)
   * @param searchTerm Search term to match against name or country
   * @return List of matching Education entities
   */
  @Query("SELECT e FROM Education e WHERE " +
         "LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
         "LOWER(e.country) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
  List<Education> searchByNameOrCountry(@Param("searchTerm") String searchTerm);

  /**
   * Search education records by name or country with type filter (case-insensitive)
   * @param searchTerm Search term to match against name or country
   * @param type Education type filter
   * @return List of matching Education entities
   */
  @Query("SELECT e FROM Education e WHERE " +
         "e.type = :type AND " +
         "(LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
         "LOWER(e.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
  List<Education> searchByNameOrCountryAndType(@Param("searchTerm") String searchTerm, 
                                                 @Param("type") Education.Type type);
}

