package com.simplevat.rest.CorporateTax.Repositories;

import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.rest.CorporateTax.CorporateTaxPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorporateTaxPaymentRepository extends JpaRepository<CorporateTaxPayment, Integer> {

    CorporateTaxPayment findCorporateTaxPaymentByTransactionAndDeleteFlag(Transaction transaction, Boolean flag);

}
