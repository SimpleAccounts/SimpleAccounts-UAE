package com.simplevat.rest.CorporateTax.Repositories;

import com.simplevat.rest.CorporateTax.CorporateTaxPayment;
import com.simplevat.rest.CorporateTax.CorporateTaxPaymentHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CorporateTaxPaymentHistoryRepository extends JpaRepository<CorporateTaxPaymentHistory, Integer> {
    Page<CorporateTaxPaymentHistory> findAll( Pageable paging);

    CorporateTaxPaymentHistory findCorporateTaxPaymentHistoryByCorporateTaxPayment(CorporateTaxPayment corporateTaxPayment);



}
