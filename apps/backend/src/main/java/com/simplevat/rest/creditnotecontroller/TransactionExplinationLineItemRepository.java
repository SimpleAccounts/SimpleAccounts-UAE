package com.simplevat.rest.creditnotecontroller;


import com.simplevat.entity.TransactionExplinationLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionExplinationLineItemRepository extends JpaRepository<TransactionExplinationLineItem, Integer> {

    @Query(value="select * from transaction_explination_line_item tel where tel.reference_id =:referenceId and tel.reference_type =:referenceType", nativeQuery=true)
    List<TransactionExplinationLineItem>
    findByReferenceIdAndType(@Param("referenceId")Integer referenceId,@Param("referenceType") String referenceType);
}