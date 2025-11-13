package com.nested.app.services.mapper;

import com.nested.app.client.mf.dto.BaseKYCRequest;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.Gender;
import com.nested.app.entity.User;
import lombok.experimental.UtilityClass;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting User entity to BaseKYCRequest DTOs. Handles common field mappings between
 * User and KYC request objects.
 */
@Component
@UtilityClass
public class BaseKYCRequestMapper {

  /**
   * Maps common User fields to a BaseKYCRequest instance. This should be called as a base for
   * populating KYC request objects.
   *
   * @param user the User entity to map from
   * @param request the BaseKYCRequest to populate
   * @return the populated BaseKYCRequest
   */
  public static <T extends BaseKYCRequest> T mapUserToBaseKYCRequest(User user, T request) {
    request.setFirstName(user.getFirstName());
    request.setLastName(user.getLastName());
    request.setGender(mapUserGenderToClientGender(user.getGender()));
    request.setPan(user.getPanNumber());
    request.setEmail(user.getEmail());
    request.setMobileNumber(user.getPhoneNumber());
    request.setFatherName(user.getFatherName());
    request.setOccupation(mapUserOccupationToFATCAOccupation(user.getOccupation()));
    request.setIncomeSlab(user.getIncomeSlab());
    request.setPep(user.isPep());

    return request;
  }

  /**
   * Maps User.Gender to client Gender enum.
   *
   * @param gender the User gender to map
   * @return the mapped Gender
   */
  private static Gender mapUserGenderToClientGender(User.Gender gender) {
    return switch (gender) {
      case MALE -> Gender.MALE;
      case FEMALE -> Gender.FEMALE;
      default -> Gender.TRANSGENDER;
    };
  }

  /**
   * Maps User Occupation to FATCAUploadRequest.Occupation enum.
   *
   * @param occupation the User occupation to map
   * @return the mapped FATCA Occupation
   */
  private static FATCAUploadRequest.Occupation mapUserOccupationToFATCAOccupation(
      com.nested.app.enums.Occupation occupation) {
    return switch (occupation) {
      case BUSINESS -> FATCAUploadRequest.Occupation.BUSINESS;
      case PROFESSIONAL -> FATCAUploadRequest.Occupation.PROFESSIONAL;
      case RETIRED -> FATCAUploadRequest.Occupation.RETIRED;
      case HOUSEWIFE -> FATCAUploadRequest.Occupation.HOUSEWIFE;
      case STUDENT -> FATCAUploadRequest.Occupation.STUDENT;
      case PUBLIC_SECTOR_SERVICE -> FATCAUploadRequest.Occupation.PUBLIC_SECTOR;
      case PRIVATE_SECTOR_SERVICE -> FATCAUploadRequest.Occupation.PRIVATE_SECTOR;
      case GOVERNMENT_SERVICE -> FATCAUploadRequest.Occupation.GOVERNMENT_SERVICE;
      case AGRICULTURE -> FATCAUploadRequest.Occupation.AGRICULTURE;
      case DOCTOR -> FATCAUploadRequest.Occupation.DOCTOR;
      case FOREX_DEALER -> FATCAUploadRequest.Occupation.FOREX_DEALER;
      case SERVICE -> FATCAUploadRequest.Occupation.OTHERS;
      case UNKNOWN_OR_NOT_APPLICABLE -> FATCAUploadRequest.Occupation.OTHERS;
      case OTHERS -> FATCAUploadRequest.Occupation.OTHERS;
    };
  }
}
