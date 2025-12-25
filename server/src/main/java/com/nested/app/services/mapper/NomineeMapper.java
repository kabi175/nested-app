package com.nested.app.services.mapper;

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
      com.nested.app.entity.Nominee nomineeEntity, String investorRef) {
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
    clientNominee.setPan(nomineeEntity.getPan());
    clientNominee.setEmail(nomineeEntity.getEmail());
    clientNominee.setAddress(nomineeEntity.getAddress());

    // Map guardian fields
    clientNominee.setGuardianName(nomineeEntity.getGuardianName());
    clientNominee.setGuardianEmail(nomineeEntity.getGuardianEmail());
    clientNominee.setGuardianPan(nomineeEntity.getGuardianPan());
    clientNominee.setGuardianAddress(nomineeEntity.getGuardianAddress());
    clientNominee.setAllocation(nomineeEntity.getAllocation());

    // Note: allocation is not sent to external API during create/update
    // It's only used when associating nominees to accounts

    log.debug(
        "Mapped nominee {} to client DTO for investor {}", nomineeEntity.getId(), investorRef);

    return clientNominee;
  }
}
