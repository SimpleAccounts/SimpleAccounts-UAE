package com.simplevat.rest.CorporateTax;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorporateTaxFilingRepository extends JpaRepository<CorporateTaxFiling, Integer> {
    List<CorporateTaxFiling> findByDeleteFlag(boolean deleteFlag);
    Page<CorporateTaxFiling> findByDeleteFlag(boolean deleteFlag, Pageable paging);

}
