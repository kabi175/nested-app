package com.nested.app.repository;

import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SipModification;
import com.nested.app.entity.SipModification.Status;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SipModificationRepository extends JpaRepository<SipModification, Long> {

  boolean existsBySipOrderAndStatusIn(SIPOrder sipOrder, List<Status> statuses);

  Optional<SipModification> findByMandateId(Long mandateId);
}
