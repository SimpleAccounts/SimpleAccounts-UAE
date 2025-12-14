package com.simpleaccounts.repository;

import com.simpleaccounts.entity.CreditNote;
import com.simpleaccounts.entity.CreditNoteLineItem;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CreditNoteLineItemRepository extends JpaRepository<CreditNoteLineItem,Integer> {
    public List<CreditNoteLineItem> findAllByCreditNote(CreditNote creditNote);

    public void deleteByCreditNote(CreditNote creditNote);
    @Query(value=" SELECT il.* FROM CREDIT_NOTE_LINE_ITEM il,CREDIT_NOTE i WHERE i.credit_note_id = il.credit_note_id AND i.delete_flag = false AND i.credit_note__date between :startDate and :endDate", nativeQuery=true)
    List<CreditNoteLineItem>findAllByDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
