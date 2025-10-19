package com.nested.app.services;

import com.nested.app.dto.FundDTO;
import com.nested.app.entity.Fund;
import com.nested.app.repository.FundRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Fund operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FundServiceImpl implements FundService {

  private final FundRepository fundRepository;

  @Override
  @Transactional(readOnly = true)
  public List<FundDTO> getAllFunds(Pageable pageable) {
    log.info("Retrieving all funds with pagination: {}", pageable);
    
    try {
      List<Fund> funds = fundRepository.findAll(pageable).getContent();
      log.info("Successfully retrieved {} funds", funds.size());
      return funds.stream().map(this::convertToDTO).collect(Collectors.toList());
    } catch (Exception e) {
      log.error("Error retrieving funds: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve funds", e);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public List<FundDTO> getActiveFunds(Pageable pageable) {
    log.info("Retrieving active funds with pagination: {}", pageable);
    
    try {
      List<Fund> funds = fundRepository.findAll(pageable).getContent();
      List<FundDTO> activeFunds = funds.stream()
          .filter(Fund::isActive)
          .map(this::convertToDTO)
          .collect(Collectors.toList());
      
      log.info("Successfully retrieved {} active funds", activeFunds.size());
      return activeFunds;
    } catch (Exception e) {
      log.error("Error retrieving active funds: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve active funds", e);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public FundDTO getFundById(Long id) {
    log.info("Retrieving fund with ID: {}", id);
    
    try {
      Fund fund = fundRepository.findById(id)
          .orElseThrow(() -> new IllegalArgumentException("Fund not found with ID: " + id));
      
      log.info("Successfully retrieved fund: {}", fund.getName());
      return convertToDTO(fund);
    } catch (Exception e) {
      log.error("Error retrieving fund with ID {}: {}", id, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Converts Fund entity to FundDTO
   *
   * @param fund Fund entity
   * @return FundDTO
   */
  private FundDTO convertToDTO(Fund fund) {
    FundDTO dto = new FundDTO();
    dto.setId(fund.getId().toString());
    dto.setCode(fund.getAmcCode());
    dto.setName(fund.getName());
    dto.setDisplayName(fund.getLabel());
    dto.setDescription(fund.getDescription());
    dto.setMinAmount(fund.getMimPurchaseAmount());
    dto.setNav(fund.getNav());
    dto.setActive(fund.isActive());
    return dto;
  }
}

