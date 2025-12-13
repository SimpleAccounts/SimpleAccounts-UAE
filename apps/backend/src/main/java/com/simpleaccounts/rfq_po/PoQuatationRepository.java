package com.simpleaccounts.rfq_po;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PoQuatationRepository extends JpaRepository<PoQuatation, Integer> {

    List<PoQuatation> findByDeleteFlag(boolean deleteFlag);
}