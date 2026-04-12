package com.nested.app.repository;

import com.nested.app.entity.SipModification;
import com.nested.app.entity.SipModificationItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SipModificationItemRepository extends JpaRepository<SipModificationItem, Long> {

  List<SipModificationItem> findByModification(SipModification modification);
}
