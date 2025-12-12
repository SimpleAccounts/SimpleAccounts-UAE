package com.simpleaccounts.rest.creditnotecontroller;

import com.simpleaccounts.entity.CreditNote;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
@Repository
public interface CreditNoteRepository extends JpaRepository<CreditNote, Integer> {

    @Query(value = "select * from credit_note where credit_note_number = :creditNoteNumber and delete_flag = false", nativeQuery = true)
    List<CreditNote> findAllByCreditNoteNumber(@Param("creditNoteNumber") String creditNoteNumber);

    List<CreditNote> findByDeleteFlag(boolean deleteFlag);

    Page<CreditNote> findByDeleteFlagAndType(boolean deleteFlag,Integer type, Pageable paging);

    @Query(value="select * from credit_note where contact_id =:contact and type=:type and delete_flag = false", nativeQuery=true)
    Page<CreditNote>
    findAllByContact(@Param("contact")Integer contact, @Param("type")Integer type,Pageable paging);

    @Query(value="select * from credit_note where total_amount =:totalAmount and type=:type and delete_flag = false", nativeQuery=true)
    Page<CreditNote>
    findAllByTotalAmount(@Param("totalAmount")BigDecimal totalAmount,  @Param("type")Integer type,Pageable paging);

    CreditNote findByInvoiceIdAndDeleteFlag(Integer invoiceId,boolean deleteFlag);
}
