package com.nested.app.services;

import com.nested.app.dto.ChildDTO;
import com.nested.app.entity.User;
import java.util.List;

/**
 * Service interface for managing Child entities
 * Provides business logic for child-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
public interface ChildService {

  /**
   * Retrieves all children from the system
   *
   * @param user Current user context
   * @return List of all children
   */
  List<ChildDTO> getAllChildren(User user);

  /**
   * Creates a new child
   *
   * @param childDTO Child data to create
   * @param user Current user context
   * @return Created child data
   */
  ChildDTO createChild(ChildDTO childDTO, User user);

  /**
   * Updates an existing child
   *
   * @param childDTO Child data to update
   * @param user Current user context
   * @return Updated child data
   */
  ChildDTO updateChild(ChildDTO childDTO, User user);

  /**
   * Creates multiple children
   *
   * @param children List of child data to create
   * @param user Current user context
   * @return List of created children
   */
  List<ChildDTO> createChildren(List<ChildDTO> children, User user);

  /**
   * Updates multiple children
   *
   * @param children List of child data to update
   * @param user Current user context
   * @return List of updated children
   */
  List<ChildDTO> updateChildren(List<ChildDTO> children, User user);
}
