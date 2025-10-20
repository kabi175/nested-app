package com.nested.app.services;

import com.nested.app.dto.EducationDTO;
import com.nested.app.entity.Education;
import com.nested.app.repository.EducationRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of EducationService Handles business logic for education management
 *
 * @author Nested App Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EducationServiceImpl implements EducationService {

  private final EducationRepository educationRepository;

  @Override
  public List<EducationDTO> getAllEducation(Education.Type type) {
    log.info("Fetching all education records");
    List<Education> educationList =
        type == null ? educationRepository.findAll() : educationRepository.findByType(type);
    return educationList.stream().map(this::convertToDTO).collect(Collectors.toList());
  }

  @Override
  public EducationDTO getEducationById(Long id) {
    log.info("Fetching education record with id: {}", id);
    Education education =
        educationRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Education not found with id: " + id));
    return convertToDTO(education);
  }

  @Override
  public List<EducationDTO> createEducation(List<EducationDTO> educationList) {
    log.info("Creating {} education records", educationList.size());

    List<Education> entities =
        educationList.stream().map(this::convertToEntity).collect(Collectors.toList());

    List<Education> savedEntities = educationRepository.saveAll(entities);

    return savedEntities.stream().map(this::convertToDTO).collect(Collectors.toList());
  }

  @Override
  public List<EducationDTO> updateEducation(List<EducationDTO> educationList) {
    log.info("Updating {} education records", educationList.size());

    List<Education> updatedEntities =
        educationList.stream()
            .map(
                dto -> {
                  Education existing =
                      educationRepository
                          .findById(dto.getId())
                          .orElseThrow(
                              () ->
                                  new IllegalArgumentException(
                                      "Education not found with id: " + dto.getId()));

                  // Update fields
                  existing.setName(dto.getName());
                  existing.setCountry(dto.getCountry());
                  existing.setLastYearFee(dto.getLastYearFee());
                  // Set expectedFee to lastYearFee if not provided
                  existing.setExpectedFee(
                      dto.getExpectedFee() != null ? dto.getExpectedFee() : dto.getLastYearFee());
                  existing.setExpectedIncreasePercentLt10Yr(dto.getExpectedIncreasePercentLt10Yr());
                  existing.setExpectedIncreasePercentGt10Yr(dto.getExpectedIncreasePercentGt10Yr());
                  if (dto.getType() != null) {
                    existing.setType(Education.Type.valueOf(dto.getType()));
                  }

                  return existing;
                })
            .collect(Collectors.toList());

    List<Education> savedEntities = educationRepository.saveAll(updatedEntities);

    return savedEntities.stream().map(this::convertToDTO).collect(Collectors.toList());
  }

  @Override
  public List<EducationDTO> deleteEducation(List<Long> ids) {
    log.info("Deleting {} education records", ids.size());

    List<Education> educationToDelete =
        ids.stream()
            .map(
                id ->
                    educationRepository
                        .findById(id)
                        .orElseThrow(
                            () ->
                                new IllegalArgumentException("Education not found with id: " + id)))
            .collect(Collectors.toList());

    List<EducationDTO> deletedDTOs =
        educationToDelete.stream().map(this::convertToDTO).collect(Collectors.toList());

    educationRepository.deleteAll(educationToDelete);

    return deletedDTOs;
  }

  /** Convert Education entity to DTO */
  private EducationDTO convertToDTO(Education education) {
    EducationDTO dto = new EducationDTO();
    dto.setId(education.getId());
    dto.setName(education.getName());
    dto.setType(education.getType().name());
    dto.setCountry(education.getCountry());
    dto.setLastYearFee(education.getLastYearFee());
    dto.setExpectedFee(education.getExpectedFee());
    dto.setExpectedIncreasePercentLt10Yr(education.getExpectedIncreasePercentLt10Yr());
    dto.setExpectedIncreasePercentGt10Yr(education.getExpectedIncreasePercentGt10Yr());
    return dto;
  }

  /** Convert EducationDTO to entity */
  private Education convertToEntity(EducationDTO dto) {
    Education education = new Education();
    if (dto.getId() != null) {
      education.setId(dto.getId());
    }
    education.setName(dto.getName());
    education.setCountry(dto.getCountry() != null ? dto.getCountry() : "India");
    education.setLastYearFee(dto.getLastYearFee());
    // Set expectedFee to lastYearFee if not provided
    education.setExpectedFee(
        dto.getExpectedFee() != null ? dto.getExpectedFee() : dto.getLastYearFee());
    education.setExpectedIncreasePercentLt10Yr(dto.getExpectedIncreasePercentLt10Yr());
    education.setExpectedIncreasePercentGt10Yr(dto.getExpectedIncreasePercentGt10Yr());
    if (dto.getType() != null) {
      education.setType(Education.Type.valueOf(dto.getType()));
    } else {
      education.setType(Education.Type.INSTITUTION);
    }
    return education;
  }
}
