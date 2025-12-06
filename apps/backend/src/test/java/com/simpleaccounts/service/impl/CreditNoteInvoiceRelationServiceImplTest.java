package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CreditNoteInvoiceRelationDao;
import com.simpleaccounts.entity.CreditNoteInvoiceRelation;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreditNoteInvoiceRelationServiceImplTest {

    @Mock
    private CreditNoteInvoiceRelationDao creditNoteInvoiceRelationDao;

    @InjectMocks
    private CreditNoteInvoiceRelationServiceImpl creditNoteInvoiceRelationService;

    private CreditNoteInvoiceRelation testRelation;

    @BeforeEach
    void setUp() {
        testRelation = new CreditNoteInvoiceRelation();
        testRelation.setCreditNoteInvoiceRelationId(1);
        testRelation.setCreditNoteId(100);
        testRelation.setInvoiceId(200);
        testRelation.setAmount(BigDecimal.valueOf(500.00));
        testRelation.setCreatedBy(1);
        testRelation.setCreatedDate(LocalDateTime.now());
        testRelation.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnCreditNoteInvoiceRelationDaoWhenGetDaoCalled() {
        assertThat(creditNoteInvoiceRelationService.getDao()).isEqualTo(creditNoteInvoiceRelationDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(creditNoteInvoiceRelationService.getDao()).isNotNull();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindRelationByPrimaryKey() {
        when(creditNoteInvoiceRelationDao.findByPK(1)).thenReturn(testRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        assertThat(result.getCreditNoteInvoiceRelationId()).isEqualTo(1);
        assertThat(result.getCreditNoteId()).isEqualTo(100);
        assertThat(result.getInvoiceId()).isEqualTo(200);
        verify(creditNoteInvoiceRelationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenRelationNotFoundByPK() {
        when(creditNoteInvoiceRelationDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> creditNoteInvoiceRelationService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(creditNoteInvoiceRelationDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindRelationByZeroId() {
        when(creditNoteInvoiceRelationDao.findByPK(0)).thenReturn(null);

        assertThatThrownBy(() -> creditNoteInvoiceRelationService.findByPK(0))
                .isInstanceOf(ServiceException.class);

        verify(creditNoteInvoiceRelationDao, times(1)).findByPK(0);
    }

    @Test
    void shouldFindRelationByLargeId() {
        CreditNoteInvoiceRelation largeIdRelation = new CreditNoteInvoiceRelation();
        largeIdRelation.setCreditNoteInvoiceRelationId(Integer.MAX_VALUE);

        when(creditNoteInvoiceRelationDao.findByPK(Integer.MAX_VALUE)).thenReturn(largeIdRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.findByPK(Integer.MAX_VALUE);

        assertThat(result).isNotNull();
        assertThat(result.getCreditNoteInvoiceRelationId()).isEqualTo(Integer.MAX_VALUE);
        verify(creditNoteInvoiceRelationDao, times(1)).findByPK(Integer.MAX_VALUE);
    }

    // ========== Persist Tests ==========

    @Test
    void shouldPersistNewRelation() {
        creditNoteInvoiceRelationService.persist(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldPersistRelationWithMinimalData() {
        CreditNoteInvoiceRelation minimalRelation = new CreditNoteInvoiceRelation();
        minimalRelation.setCreditNoteId(100);
        minimalRelation.setInvoiceId(200);

        creditNoteInvoiceRelationService.persist(minimalRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(minimalRelation);
    }

    @Test
    void shouldPersistRelationWithNullAmount() {
        testRelation.setAmount(null);

        creditNoteInvoiceRelationService.persist(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldPersistRelationWithZeroAmount() {
        testRelation.setAmount(BigDecimal.ZERO);

        creditNoteInvoiceRelationService.persist(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldPersistRelationWithLargeAmount() {
        testRelation.setAmount(BigDecimal.valueOf(999999999.99));

        creditNoteInvoiceRelationService.persist(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldPersistMultipleRelations() {
        CreditNoteInvoiceRelation relation1 = new CreditNoteInvoiceRelation();
        CreditNoteInvoiceRelation relation2 = new CreditNoteInvoiceRelation();
        CreditNoteInvoiceRelation relation3 = new CreditNoteInvoiceRelation();

        creditNoteInvoiceRelationService.persist(relation1);
        creditNoteInvoiceRelationService.persist(relation2);
        creditNoteInvoiceRelationService.persist(relation3);

        verify(creditNoteInvoiceRelationDao, times(3)).persist(any(CreditNoteInvoiceRelation.class));
    }

    // ========== Update Tests ==========

    @Test
    void shouldUpdateExistingRelation() {
        when(creditNoteInvoiceRelationDao.update(testRelation)).thenReturn(testRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        verify(creditNoteInvoiceRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRelationAndReturnUpdatedEntity() {
        testRelation.setAmount(BigDecimal.valueOf(750.00));
        when(creditNoteInvoiceRelationDao.update(testRelation)).thenReturn(testRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(BigDecimal.valueOf(750.00));
        verify(creditNoteInvoiceRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRelationWithNewInvoiceId() {
        testRelation.setInvoiceId(300);
        when(creditNoteInvoiceRelationDao.update(testRelation)).thenReturn(testRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getInvoiceId()).isEqualTo(300);
        verify(creditNoteInvoiceRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRelationWithNewCreditNoteId() {
        testRelation.setCreditNoteId(150);
        when(creditNoteInvoiceRelationDao.update(testRelation)).thenReturn(testRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getCreditNoteId()).isEqualTo(150);
        verify(creditNoteInvoiceRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(creditNoteInvoiceRelationDao.update(any(CreditNoteInvoiceRelation.class))).thenReturn(testRelation);

        creditNoteInvoiceRelationService.update(testRelation);
        creditNoteInvoiceRelationService.update(testRelation);
        creditNoteInvoiceRelationService.update(testRelation);

        verify(creditNoteInvoiceRelationDao, times(3)).update(testRelation);
    }

    // ========== Delete Tests ==========

    @Test
    void shouldDeleteRelation() {
        creditNoteInvoiceRelationService.delete(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldDeleteRelationWithNullAmount() {
        testRelation.setAmount(null);

        creditNoteInvoiceRelationService.delete(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldHandleMultipleDeleteOperations() {
        CreditNoteInvoiceRelation relation1 = new CreditNoteInvoiceRelation();
        CreditNoteInvoiceRelation relation2 = new CreditNoteInvoiceRelation();

        creditNoteInvoiceRelationService.delete(relation1);
        creditNoteInvoiceRelationService.delete(relation2);

        verify(creditNoteInvoiceRelationDao, times(1)).delete(relation1);
        verify(creditNoteInvoiceRelationDao, times(1)).delete(relation2);
    }

    @Test
    void shouldDeleteSameRelationMultipleTimes() {
        creditNoteInvoiceRelationService.delete(testRelation);
        creditNoteInvoiceRelationService.delete(testRelation);

        verify(creditNoteInvoiceRelationDao, times(2)).delete(testRelation);
    }

    // ========== Find By Attributes Tests ==========

    @Test
    void shouldFindRelationsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("creditNoteId", 100);

        List<CreditNoteInvoiceRelation> expectedList = Arrays.asList(testRelation);
        when(creditNoteInvoiceRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testRelation);
        verify(creditNoteInvoiceRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("creditNoteId", 999);

        when(creditNoteInvoiceRelationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(creditNoteInvoiceRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(creditNoteInvoiceRelationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(creditNoteInvoiceRelationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleRelationsByAttributes() {
        CreditNoteInvoiceRelation relation2 = new CreditNoteInvoiceRelation();
        relation2.setCreditNoteInvoiceRelationId(2);
        relation2.setCreditNoteId(100);
        relation2.setInvoiceId(201);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("creditNoteId", 100);

        List<CreditNoteInvoiceRelation> expectedList = Arrays.asList(testRelation, relation2);
        when(creditNoteInvoiceRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(creditNoteInvoiceRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindRelationsByInvoiceId() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("invoiceId", 200);

        List<CreditNoteInvoiceRelation> expectedList = Arrays.asList(testRelation);
        when(creditNoteInvoiceRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getInvoiceId()).isEqualTo(200);
        verify(creditNoteInvoiceRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindRelationsByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("creditNoteId", 100);
        attributes.put("invoiceId", 200);
        attributes.put("deleteFlag", false);

        List<CreditNoteInvoiceRelation> expectedList = Arrays.asList(testRelation);
        when(creditNoteInvoiceRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(creditNoteInvoiceRelationDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleRelationWithNullCreditNoteId() {
        CreditNoteInvoiceRelation relationWithNullCreditNote = new CreditNoteInvoiceRelation();
        relationWithNullCreditNote.setCreditNoteInvoiceRelationId(2);
        relationWithNullCreditNote.setCreditNoteId(null);
        relationWithNullCreditNote.setInvoiceId(200);

        when(creditNoteInvoiceRelationDao.findByPK(2)).thenReturn(relationWithNullCreditNote);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getCreditNoteId()).isNull();
        verify(creditNoteInvoiceRelationDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleRelationWithNullInvoiceId() {
        CreditNoteInvoiceRelation relationWithNullInvoice = new CreditNoteInvoiceRelation();
        relationWithNullInvoice.setCreditNoteInvoiceRelationId(3);
        relationWithNullInvoice.setCreditNoteId(100);
        relationWithNullInvoice.setInvoiceId(null);

        when(creditNoteInvoiceRelationDao.findByPK(3)).thenReturn(relationWithNullInvoice);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.findByPK(3);

        assertThat(result).isNotNull();
        assertThat(result.getInvoiceId()).isNull();
        verify(creditNoteInvoiceRelationDao, times(1)).findByPK(3);
    }

    @Test
    void shouldHandleRelationWithNegativeAmount() {
        testRelation.setAmount(BigDecimal.valueOf(-100.00));
        when(creditNoteInvoiceRelationDao.update(testRelation)).thenReturn(testRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(BigDecimal.valueOf(-100.00));
        verify(creditNoteInvoiceRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldHandleRelationWithVerySmallAmount() {
        testRelation.setAmount(BigDecimal.valueOf(0.01));
        when(creditNoteInvoiceRelationDao.update(testRelation)).thenReturn(testRelation);

        CreditNoteInvoiceRelation result = creditNoteInvoiceRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(BigDecimal.valueOf(0.01));
        verify(creditNoteInvoiceRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldHandleRelationWithDeleteFlag() {
        testRelation.setDeleteFlag(true);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("deleteFlag", true);

        List<CreditNoteInvoiceRelation> expectedList = Arrays.asList(testRelation);
        when(creditNoteInvoiceRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).isDeleteFlag()).isTrue();
        verify(creditNoteInvoiceRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleLargeListOfRelations() {
        List<CreditNoteInvoiceRelation> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            CreditNoteInvoiceRelation relation = new CreditNoteInvoiceRelation();
            relation.setCreditNoteInvoiceRelationId(i);
            relation.setCreditNoteId(100);
            relation.setInvoiceId(200 + i);
            largeList.add(relation);
        }

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("creditNoteId", 100);

        when(creditNoteInvoiceRelationDao.findByAttributes(attributes)).thenReturn(largeList);

        List<CreditNoteInvoiceRelation> result = creditNoteInvoiceRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getCreditNoteInvoiceRelationId()).isEqualTo(1);
        assertThat(result.get(99).getCreditNoteInvoiceRelationId()).isEqualTo(100);
        verify(creditNoteInvoiceRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleRelationWithAllFieldsNull() {
        CreditNoteInvoiceRelation relationWithNulls = new CreditNoteInvoiceRelation();

        creditNoteInvoiceRelationService.persist(relationWithNulls);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(relationWithNulls);
    }

    @Test
    void shouldVerifyDaoInteractionForFindByPK() {
        when(creditNoteInvoiceRelationDao.findByPK(1)).thenReturn(testRelation);

        creditNoteInvoiceRelationService.findByPK(1);
        creditNoteInvoiceRelationService.findByPK(1);
        creditNoteInvoiceRelationService.findByPK(1);

        verify(creditNoteInvoiceRelationDao, times(3)).findByPK(1);
    }

    @Test
    void shouldHandleRelationWithZeroCreditNoteId() {
        testRelation.setCreditNoteId(0);

        creditNoteInvoiceRelationService.persist(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldHandleRelationWithZeroInvoiceId() {
        testRelation.setInvoiceId(0);

        creditNoteInvoiceRelationService.persist(testRelation);

        verify(creditNoteInvoiceRelationDao, times(1)).persist(testRelation);
    }
}
