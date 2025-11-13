package com.nested.app.services.mapper;

import com.nested.app.client.mf.dto.CreateKYCRequest;
import com.nested.app.entity.User;
import lombok.experimental.UtilityClass;

/**
 * Mapper for converting User entity to CreateKYCRequest. Handles all field mappings specific to KYC
 * requests.
 */
@UtilityClass
public class CreateKYCRequestMapper {

  /**
   * Maps User entity to CreateKYCRequest. This method populates all base KYC fields plus
   * Aadhaar-specific fields.
   *
   * @param user the User entity to map from
   * @return CreateKYCRequest populated with user data
   */
  public static CreateKYCRequest mapUserToCreateKYCRequest(User user) {
    CreateKYCRequest request = new CreateKYCRequest();

    // Map common base fields using BaseKYCRequestMapper
    BaseKYCRequestMapper.mapUserToBaseKYCRequest(user, request);

    // Map CreateKYCRequest-specific fields
    request.setAadhaarNumber(user.getAadhaarLast4());

    return request;
  }
}
