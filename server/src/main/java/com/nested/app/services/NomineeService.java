package com.nested.app.services;

import com.nested.app.dto.NomineeRequestDTO;
import com.nested.app.dto.NomineeResponseDTO;
import com.nested.app.entity.User;
import java.util.List;

/**
 * Service interface for Nominee operations Defines business logic methods for managing nominees
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface NomineeService {

  /**
   * Upsert nominees for the current user (create or update all at once)
   *
   * <p>All nominees must be sent in each request for complete validation. Validates total
   * allocation = 100% across all nominees.
   *
   * <p>Validates: - Maximum 3 nominees per user - Total allocation equals exactly 100% - Guardian
   * info for minors (< 18 years) - Name and relationship immutability on updates - User ownership
   *
   * @param nomineeDTOs List of all nominees to save - Items without id field or with id=null:
   *     CREATE new - Items with existing id: UPDATE existing
   * @param user The current user
   * @return List of saved nominee responses
   * @throws IllegalArgumentException if validation fails
   */
  List<NomineeResponseDTO> upsertNominees(List<NomineeRequestDTO> nomineeDTOs, User user);

  /**
   * Get all nominees for the current user
   *
   * @param user The current user
   * @return List of nominee responses
   */
  List<NomineeResponseDTO> getNominees(User user);

  /**
   * Get a specific nominee for the current user
   *
   * @param nomineeId The nominee ID
   * @param user The current user
   * @return The nominee response
   * @throws IllegalArgumentException if nominee not found
   */
  NomineeResponseDTO getNominee(Long nomineeId, User user);

  /**
   * Opt out from nominee process Updates user's NomineeStatus to OPT_OUT
   *
   * @param user The current user
   */
  void optOutNominee(User user);
}
