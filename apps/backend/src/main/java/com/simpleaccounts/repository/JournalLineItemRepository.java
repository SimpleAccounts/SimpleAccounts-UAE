package com.simpleaccounts.repository;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.invoicecontroller.InvoiceDueAmountResultSet;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalLineItemRepository extends JpaRepository<JournalLineItem,Integer>{

    List<JournalLineItem> findAllByReferenceIdAndReferenceType(Integer referenceId, PostingReferenceTypeEnum referenceType);

    @Query(value="select * from journal_line_item where REFERENCE_ID =:referenceId and REFERENCE_TYPE =:referenceType and delete_flag=false and (CREDIT_AMOUNT=:amount OR DEBIT_AMOUNT=:amount) ", nativeQuery=true)
    List<JournalLineItem>
    findAllByReferenceIdAndReferenceTypeAndAmount(@Param("referenceId")Integer referenceId, @Param("referenceType")String referenceType, @Param("amount") BigDecimal amount);

    @Query(value="select * from journal_line_item where reference_type in('INVOICE','RECEIPT','CREDIT_NOTE','REFUND','BANK_RECEIPT') and reversal_flag = false " +
            "and transaction_category_code not in (84,94,47,49,88) ", nativeQuery=true)
    List<JournalLineItem> findAllForCustomerAccountsStatement();

    @Query(value="select * from journal_line_item where reference_type in('INVOICE','PAYMENT','DEBIT_NOTE','REFUND','BANK_PAYMENT') and reversal_flag = false " +
            "and transaction_category_code not in (84,94,47,49,88) ", nativeQuery=true)
    List<JournalLineItem> findAllForSupplierAccountsStatement();

    @Query(name = "CustomerInv", nativeQuery = true)
    InvoiceDueAmountResultSet geCustomerDueAmount();

    @Query(name = "SupplierInvoiceDueAmount", nativeQuery = true)
    InvoiceDueAmountResultSet getSupplierDueAmount();

    List<JournalLineItem> findAllByTransactionCategory(TransactionCategory transactionCategory);
    @Query(value="select * from journal_line_item where transaction_category_code in (:employeeTransactionCategoryRelationList) and delete_flag=false ", nativeQuery=true)
    List<JournalLineItem>
    findAllByTransactionCategoryList(@Param("employeeTransactionCategoryRelationList")List<Integer> employeeTransactionCategoryRelationList);

}
