package com.nested.app.services.mapper;

import com.nested.app.client.mf.dto.Address;
import com.nested.app.entity.Nominee;
import lombok.extern.slf4j.Slf4j;

/**
 * Mapper for converting internal Nominee entity to external Nominee DTO
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
public class NomineeMapper {

  /**
   * Maps internal Nominee entity to external Nominee DTO for API communication
   *
   * @param nomineeEntity Internal nominee entity
   * @param investorRef External investor reference ID
   * @return Mapped nominee DTO ready for external API
   */
  public static com.nested.app.client.mf.dto.Nominee mapToClientNominee(
      Nominee nomineeEntity, String investorRef) {
    com.nested.app.client.mf.dto.Nominee clientNominee = new com.nested.app.client.mf.dto.Nominee();

    // Set external ID if nominee already synced
    if (nomineeEntity.getRef() != null) {
      clientNominee.setId(nomineeEntity.getRef());
    }

    // Set investor profile reference
    clientNominee.setInvestorID(investorRef);

    // Map basic fields
    clientNominee.setName(nomineeEntity.getName());
    clientNominee.setRelationship(nomineeEntity.getRelationship());
    clientNominee.setDob(nomineeEntity.getDob());
    if (nomineeEntity.isMinor()) {
      // Map guardian fields
      clientNominee.setGuardianName(nomineeEntity.getGuardianName());
      clientNominee.setGuardianPan(nomineeEntity.getPan());
      clientNominee.setGuardianEmail(nomineeEntity.getEmail());
      clientNominee.setGuardianMobileNumber(nomineeEntity.getMobileNumber());
      clientNominee.setGuardianAddress(convertToClientAddress(nomineeEntity.getAddress()));
    } else {
      clientNominee.setPan(nomineeEntity.getPan());
      clientNominee.setEmail(nomineeEntity.getEmail());
      clientNominee.setMobileNumber(nomineeEntity.getMobileNumber());
      clientNominee.setAddress(convertToClientAddress(nomineeEntity.getAddress()));
    }

    clientNominee.setAllocation(nomineeEntity.getAllocation());

    // Note: allocation is not sent to external API during create/update
    // It's only used when associating nominees to accounts

    log.debug(
        "Mapped nominee {} to client DTO for investor {}", nomineeEntity.getId(), investorRef);

    return clientNominee;
  }

  /**
   * Convert internal Address entity to client Address DTO
   *
   * @param address Internal Address entity
   * @return Client Address DTO
   */
  private static Address convertToClientAddress(com.nested.app.entity.Address address) {
    if (address == null) {
      return null;
    }
    Address clientAddress = new Address();
    clientAddress.setAddressLine1(address.getAddressLine());
    clientAddress.setCity(address.getCity());
    clientAddress.setState(address.getState());
    clientAddress.setCountry(address.getCountry());
    clientAddress.setPinCode(address.getPinCode());
    return clientAddress;
  }

  /**
   * Format Address entity to string format for external API (for guardian address which is String)
   *
   * @param address Address entity
   * @return Formatted address string
   */
  private static String formatAddressForExternalAPI(com.nested.app.entity.Address address) {
    if (address == null) {
      return null;
    }
    return String.format(
        "%s, %s, %s, %s %s",
        address.getAddressLine(),
        address.getCity(),
        address.getState(),
        address.getCountry(),
        address.getPinCode());
  }
}
