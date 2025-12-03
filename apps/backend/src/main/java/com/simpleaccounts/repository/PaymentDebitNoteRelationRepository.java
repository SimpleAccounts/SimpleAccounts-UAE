package com.simpleaccounts.repository;

import com.simpleaccounts.entity.PaymentDebitNoteRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentDebitNoteRelationRepository extends JpaRepository<PaymentDebitNoteRelation, Integer> {
}
