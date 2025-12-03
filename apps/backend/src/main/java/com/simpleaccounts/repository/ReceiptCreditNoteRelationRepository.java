package com.simpleaccounts.repository;

import com.simpleaccounts.entity.ReceiptCreditNoteRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceiptCreditNoteRelationRepository extends JpaRepository<ReceiptCreditNoteRelation, Integer> {
}
