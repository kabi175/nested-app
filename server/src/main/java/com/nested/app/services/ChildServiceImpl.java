package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.ChildDTO;
import com.nested.app.entity.Child;
import com.nested.app.entity.User;
import com.nested.app.repository.ChildRepository;
import com.nested.app.repository.UserRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for managing Child entities
 * Provides business logic for child-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChildServiceImpl implements ChildService {

    private final ChildRepository childRepository;
  private static final int MAX_CHILDREN_PER_USER = 3;
  private final UserRepository userRepository;
  private final UserContext userContext;

    /**
     * Retrieves all children from the system
     * 
     * @return List of all children
     */
    @Override
    @Transactional(readOnly = true)
    public List<ChildDTO> getAllChildren() {
        log.info("Retrieving all children from database");
        
        try {
            List<Child> children = childRepository.findAll();
            List<ChildDTO> childDTOs = children.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} children", childDTOs.size());
            return childDTOs;
            
        } catch (Exception e) {
            log.error("Error retrieving children: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve children", e);
        }
    }

    /**
     * Creates a new child
     * 
     * @param childDTO Child data to create
     * @return Created child data
     */
    @Override
    public ChildDTO createChild(ChildDTO childDTO) {
        log.info("Creating new child with name: {}", childDTO.getFirstName());
        
        try {
      // Validate child data
      validateChildData(childDTO);

      // Get current user
      User currentUser = getCurrentUser();

      // Check 3-child limit
      validateChildLimit(currentUser.getId());

            Child child = convertToEntity(childDTO);
      child.setUser(currentUser);

            Child savedChild = childRepository.save(child);
            ChildDTO savedChildDTO = convertToDTO(savedChild);
            
            log.info("Successfully created child with ID: {}", savedChild.getId());
            return savedChildDTO;
            
        } catch (Exception e) {
            log.error("Error creating child: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create child", e);
        }
    }

    /**
     * Updates an existing child
     * 
     * @param childDTO Child data to update
     * @return Updated child data
     */
    @Override
    public ChildDTO updateChild(ChildDTO childDTO) {
        log.info("Updating child with ID: {}", childDTO.getId());
        
        try {
            if (childDTO.getId() == null) {
                throw new IllegalArgumentException("Child ID cannot be null for update operation");
            }
            
            Child existingChild = childRepository.findById(childDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Child not found with ID: " + childDTO.getId()));
            
            // Update fields
            existingChild.setFirstName(childDTO.getFirstName());
            existingChild.setLastName(childDTO.getLastName());
            existingChild.setDateOfBirth(childDTO.getDateOfBirth());
            existingChild.setGender(childDTO.getGender());
            existingChild.setInvestUnderChild(childDTO.isInvestUnderChild());
            
            Child updatedChild = childRepository.save(existingChild);
            ChildDTO updatedChildDTO = convertToDTO(updatedChild);
            
            log.info("Successfully updated child with ID: {}", updatedChild.getId());
            return updatedChildDTO;
            
        } catch (Exception e) {
            log.error("Error updating child with ID {}: {}", childDTO.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update child", e);
        }
    }
    
    /**
     * Creates multiple children
     * 
     * @param children List of child data to create
     * @return List of created children
     */
    @Override
    public List<ChildDTO> createChildren(List<ChildDTO> children) {
        log.info("Creating {} children", children.size());
        
        try {
      // Get current user
      User currentUser = getCurrentUser();

      // Check 3-child limit for all children
      validateChildLimitForMultiple(currentUser.getId(), children.size());

      // Validate all children data
      for (ChildDTO childDTO : children) {
        validateChildData(childDTO);
      }

      List<Child> childEntities =
          children.stream()
              .map(
                  childDTO -> {
                    Child child = convertToEntity(childDTO);
                    child.setUser(currentUser);
                    return child;
                  })
              .collect(Collectors.toList());

            List<Child> savedChildren = childRepository.saveAll(childEntities);
            List<ChildDTO> savedChildDTOs = savedChildren.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully created {} children", savedChildDTOs.size());
            return savedChildDTOs;
            
        } catch (Exception e) {
            log.error("Error creating children: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create children", e);
        }
    }
    
    /**
     * Updates multiple children
     * 
     * @param children List of child data to update
     * @return List of updated children
     */
    @Override
    public List<ChildDTO> updateChildren(List<ChildDTO> children) {
        log.info("Updating {} children", children.size());
        
        try {
            List<ChildDTO> updatedChildren = children.stream()
                    .map(this::updateChild)
                    .collect(Collectors.toList());
            
            log.info("Successfully updated {} children", updatedChildren.size());
            return updatedChildren;
            
        } catch (Exception e) {
            log.error("Error updating children: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update children", e);
        }
    }

    /**
     * Converts Child entity to ChildDTO
     * 
     * @param child Child entity
     * @return ChildDTO
     */
    private ChildDTO convertToDTO(Child child) {
        log.debug("Converting Child entity to DTO for ID: {}", child.getId());
        
        ChildDTO dto = new ChildDTO();
        dto.setId(child.getId());
        dto.setFirstName(child.getFirstName());
        dto.setLastName(child.getLastName());
        dto.setDateOfBirth(child.getDateOfBirth());
        dto.setGender(child.getGender());
        dto.setInvestUnderChild(child.isInvestUnderChild());
        
        // Set user information if available
        if (child.getUser() != null) {
            dto.setUserId(child.getUser().getId());
        }
        
        return dto;
    }

    /**
     * Converts ChildDTO to Child entity
     * 
     * @param childDTO ChildDTO
     * @return Child entity
     */
    private Child convertToEntity(ChildDTO childDTO) {
        log.debug("Converting ChildDTO to entity for name: {}", childDTO.getFirstName());
        
        Child child = new Child();
        child.setId(childDTO.getId());
        child.setFirstName(childDTO.getFirstName());
        child.setLastName(childDTO.getLastName());
        child.setDateOfBirth(childDTO.getDateOfBirth());
        child.setGender(childDTO.getGender());
        child.setInvestUnderChild(childDTO.isInvestUnderChild());
        
        return child;
    }

  /**
   * Validates child data according to API requirements
   *
   * @param childDTO Child data to validate
   * @throws IllegalArgumentException if validation fails
   */
  private void validateChildData(ChildDTO childDTO) {
    if (childDTO.getFirstName() == null || childDTO.getFirstName().trim().isEmpty()) {
      throw new IllegalArgumentException("First name is required");
    }

    if (childDTO.getLastName() == null || childDTO.getLastName().trim().isEmpty()) {
      throw new IllegalArgumentException("Last name is required");
    }

    if (childDTO.getDateOfBirth() == null) {
      throw new IllegalArgumentException("Date of birth is required");
    }

    if (childDTO.getGender() == null || childDTO.getGender().trim().isEmpty()) {
      throw new IllegalArgumentException("Gender is required");
    }

    // Validate gender enum values
    if (!isValidGender(childDTO.getGender())) {
      throw new IllegalArgumentException("Gender must be one of: male, female, other");
    }

    // Validate date of birth is not in the future
    if (childDTO.getDateOfBirth().after(new Date())) {
      throw new IllegalArgumentException("Date of birth cannot be in the future");
    }

    // Validate that the child is a minor (under 18 years old)
    LocalDate eighteenYearsAgo = LocalDate.now().minusYears(18);
    LocalDate birthDate =
        childDTO.getDateOfBirth().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

    if (birthDate.isAfter(eighteenYearsAgo)) {
      throw new IllegalArgumentException("Child must be under 18 years old");
    }

    // Validate date of birth is reasonable (not more than 100 years ago)
    LocalDate hundredYearsAgo = LocalDate.now().minusYears(100);

    if (birthDate.isBefore(hundredYearsAgo)) {
      throw new IllegalArgumentException("Date of birth cannot be more than 100 years ago");
    }
  }

  /**
   * Validates gender value
   *
   * @param gender Gender to validate
   * @return true if valid, false otherwise
   */
  private boolean isValidGender(String gender) {
    return "male".equalsIgnoreCase(gender)
        || "female".equalsIgnoreCase(gender)
        || "other".equalsIgnoreCase(gender);
  }

  /**
   * Validates that user hasn't exceeded the 3-child limit
   *
   * @param userId User ID to check
   * @throws IllegalArgumentException if limit exceeded
   */
  private void validateChildLimit(Long userId) {
    long currentChildCount = childRepository.findByUserId(userId).size();

    if (currentChildCount >= MAX_CHILDREN_PER_USER) {
      throw new IllegalArgumentException(
          String.format(
              "Maximum of %d children allowed per user. Current count: %d",
              MAX_CHILDREN_PER_USER, currentChildCount));
    }
  }

  /**
   * Validates that user won't exceed the 3-child limit when adding multiple children
   *
   * @param userId User ID to check
   * @param newChildrenCount Number of new children to add
   * @throws IllegalArgumentException if limit would be exceeded
   */
  private void validateChildLimitForMultiple(Long userId, int newChildrenCount) {
    long currentChildCount = childRepository.findByUserId(userId).size();
    long totalAfterAddition = currentChildCount + newChildrenCount;

    if (totalAfterAddition > MAX_CHILDREN_PER_USER) {
      throw new IllegalArgumentException(
          String.format(
              "Adding %d children would exceed the maximum of %d children per user. "
                  + "Current count: %d, would become: %d",
              newChildrenCount, MAX_CHILDREN_PER_USER, currentChildCount, totalAfterAddition));
    }
  }

  /**
   * Gets the current user from UserContext
   *
   * @return Current user
   * @throws IllegalArgumentException if user not found
   */
  private User getCurrentUser() {
    User currentUser = userContext.getUser();
    if (currentUser == null) {
      throw new IllegalArgumentException("User not found in context");
    }
    return currentUser;
  }
}
