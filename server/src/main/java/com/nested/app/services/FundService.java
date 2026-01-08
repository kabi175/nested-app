package com.nested.app.services;

import com.nested.app.dto.FundDTO;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service interface for Fund operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Service
public interface FundService {

  /**
   * Retrieves all funds
   *
   * @param pageable Pagination information
   * @return List of all funds
   */
  List<FundDTO> getAllFunds(Pageable pageable);

  /**
   * Retrieves only active funds
   *
   * @param pageable Pagination information
   * @return List of active funds
   */
  List<FundDTO> getActiveFunds(Pageable pageable);

  /**
   * Retrieves fund by ID
   *
   * @param id Fund ID
   * @return Fund details
   */
  FundDTO getFundById(Long id);

  /**
   * Updates the label (display name) of a fund
   *
   * @param id Fund ID
   * @param label New label value
   * @return Updated fund details
   */
  FundDTO updateFundLabel(Long id, String label);
}

