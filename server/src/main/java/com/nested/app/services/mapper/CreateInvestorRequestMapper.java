package com.nested.app.services.mapper;

import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.entity.User;
import lombok.experimental.UtilityClass;

/**
 * Mapper for converting User entity to CreateInvestorRequest. Handles all field mappings specific
 * to investor creation requests.
 */
@UtilityClass
public class CreateInvestorRequestMapper {

  /**
   * Maps User entity to CreateInvestorRequest. This method populates all base KYC fields plus
   * investor-specific fields.
   *
   * @param user the User entity to map from
   * @return CreateInvestorRequest populated with user data
   */
  public static CreateInvestorRequest mapUserToCreateInvestorRequest(User user) {
    CreateInvestorRequest request = new CreateInvestorRequest();

    // Map common base fields using BaseKYCRequestMapper
    BaseKYCRequestMapper.mapUserToBaseKYCRequest(user, request);

    // Map CreateInvestorRequest-specific fields
    request.setIncomeSource(mapUserIncomeSourceToFATCA(user.getIncomeSource()));
    request.setInvestorType(CreateInvestorRequest.InvestorType.INDIVIDUAL);

    return request;
  }

  /**
   * Maps User IncomeSource enum to FATCAUploadRequest.IncomeSource enum.
   *
   * @param incomeSource the User income source to map
   * @return the mapped FATCA IncomeSource
   */
  private static FATCAUploadRequest.IncomeSource mapUserIncomeSourceToFATCA(
      com.nested.app.enums.IncomeSource incomeSource) {
    return switch (incomeSource) {
      case SALARY -> FATCAUploadRequest.IncomeSource.SALARY;
      case BUSINESS_INCOME -> FATCAUploadRequest.IncomeSource.BUSINESS;
      case RENTAL_INCOME -> FATCAUploadRequest.IncomeSource.RENTAL_INCOME;
      case ROYALTY -> FATCAUploadRequest.IncomeSource.ROYALTY;
      case ANCESTRAL_PROPERTY -> FATCAUploadRequest.IncomeSource.ANCESTRAL_PROPERTY;
      case PRIZE_MONEY -> FATCAUploadRequest.IncomeSource.PRIZE_MONEY;
      case OTHERS -> FATCAUploadRequest.IncomeSource.OTHERS;
    };
  }
}
