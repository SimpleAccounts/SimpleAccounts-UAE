package com.simpleaccounts.rfq_po;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PoQuatationRepository extends JpaRepository<PoQuatation, Integer> {

    List<PoQuatation> findByDeleteFlag(boolean deleteFlag);
}