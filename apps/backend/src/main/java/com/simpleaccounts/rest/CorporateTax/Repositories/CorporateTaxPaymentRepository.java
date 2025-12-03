package com.simpleaccounts.rest.CorporateTax.Repositories;

import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.rest.CorporateTax.CorporateTaxPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorporateTaxPaymentRepository extends JpaRepository<CorporateTaxPayment, Integer> {

    CorporateTaxPayment findCorporateTaxPaymentByTransactionAndDeleteFlag(Transaction transaction, Boolean flag);

}
