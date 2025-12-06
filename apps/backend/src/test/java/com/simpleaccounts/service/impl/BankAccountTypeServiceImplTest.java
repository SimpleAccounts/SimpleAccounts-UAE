package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.BankAccountTypeDao;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import com.simpleaccounts.exceptions.ServiceException;
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
class BankAccountTypeServiceImplTest {

    @Mock
    private BankAccountTypeDao bankAccountTypeDao;

    @InjectMocks
    private BankAccountTypeServiceImpl bankAccountTypeService;

    private BankAccountType testBankAccountType;

    @BeforeEach
    void setUp() {
        testBankAccountType = new BankAccountType();
        testBankAccountType.setBankAccountTypeId(1);
        testBankAccountType.setAccountTypeCode("SAVINGS");
        testBankAccountType.setAccountTypeDescription("Savings Account");
        testBankAccountType.setIsDefault(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnBankAccountTypeDaoWhenGetDaoCalled() {
        assertThat(bankAccountTypeService.getDao()).isEqualTo(bankAccountTypeDao);
    }

    // ========== getBankAccountTypeList Tests ==========

    @Test
    void shouldReturnBankAccountTypeListWhenTypesExist() {
        BankAccountType checkingType = new BankAccountType();
        checkingType.setBankAccountTypeId(2);
        checkingType.setAccountTypeCode("CHECKING");
        checkingType.setAccountTypeDescription("Checking Account");

        List<BankAccountType> expectedList = Arrays.asList(testBankAccountType, checkingType);
        when(bankAccountTypeDao.getBankAccountTypeList()).thenReturn(expectedList);

        List<BankAccountType> result = bankAccountTypeService.getBankAccountTypeList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testBankAccountType, checkingType);
        assertThat(result.get(0).getAccountTypeCode()).isEqualTo("SAVINGS");
        assertThat(result.get(1).getAccountTypeCode()).isEqualTo("CHECKING");
        verify(bankAccountTypeDao, times(1)).getBankAccountTypeList();
    }

    @Test
    void shouldReturnEmptyListWhenNoTypesExist() {
        when(bankAccountTypeDao.getBankAccountTypeList()).thenReturn(Collections.emptyList());

        List<BankAccountType> result = bankAccountTypeService.getBankAccountTypeList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(bankAccountTypeDao, times(1)).getBankAccountTypeList();
    }

    @Test
    void shouldReturnSingleBankAccountType() {
        List<BankAccountType> expectedList = Collections.singletonList(testBankAccountType);
        when(bankAccountTypeDao.getBankAccountTypeList()).thenReturn(expectedList);

        List<BankAccountType> result = bankAccountTypeService.getBankAccountTypeList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getBankAccountTypeId()).isEqualTo(1);
        verify(bankAccountTypeDao, times(1)).getBankAccountTypeList();
    }

    @Test
    void shouldReturnMultipleBankAccountTypes() {
        List<BankAccountType> expectedList = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            BankAccountType type = new BankAccountType();
            type.setBankAccountTypeId(i);
            type.setAccountTypeCode("TYPE" + i);
            type.setAccountTypeDescription("Account Type " + i);
            expectedList.add(type);
        }

        when(bankAccountTypeDao.getBankAccountTypeList()).thenReturn(expectedList);

        List<BankAccountType> result = bankAccountTypeService.getBankAccountTypeList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result.get(0).getAccountTypeCode()).isEqualTo("TYPE1");
        assertThat(result.get(4).getAccountTypeCode()).isEqualTo("TYPE5");
        verify(bankAccountTypeDao, times(1)).getBankAccountTypeList();
    }

    @Test
    void shouldHandleMultipleCallsToGetBankAccountTypeList() {
        List<BankAccountType> expectedList = Arrays.asList(testBankAccountType);
        when(bankAccountTypeDao.getBankAccountTypeList()).thenReturn(expectedList);

        bankAccountTypeService.getBankAccountTypeList();
        bankAccountTypeService.getBankAccountTypeList();

        verify(bankAccountTypeDao, times(2)).getBankAccountTypeList();
    }

    // ========== getBankAccountType Tests ==========

    @Test
    void shouldReturnBankAccountTypeWhenValidIdProvided() {
        when(bankAccountTypeDao.getBankAccountType(1)).thenReturn(testBankAccountType);

        BankAccountType result = bankAccountTypeService.getBankAccountType(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testBankAccountType);
        assertThat(result.getBankAccountTypeId()).isEqualTo(1);
        assertThat(result.getAccountTypeCode()).isEqualTo("SAVINGS");
        verify(bankAccountTypeDao, times(1)).getBankAccountType(1);
    }

    @Test
    void shouldReturnNullWhenBankAccountTypeNotFound() {
        when(bankAccountTypeDao.getBankAccountType(999)).thenReturn(null);

        BankAccountType result = bankAccountTypeService.getBankAccountType(999);

        assertThat(result).isNull();
        verify(bankAccountTypeDao, times(1)).getBankAccountType(999);
    }

    @Test
    void shouldReturnBankAccountTypeWithAllFieldsPopulated() {
        testBankAccountType.setAccountTypeCode("CURRENT");
        testBankAccountType.setAccountTypeDescription("Current Account");
        testBankAccountType.setIsDefault(true);

        when(bankAccountTypeDao.getBankAccountType(1)).thenReturn(testBankAccountType);

        BankAccountType result = bankAccountTypeService.getBankAccountType(1);

        assertThat(result).isNotNull();
        assertThat(result.getAccountTypeCode()).isEqualTo("CURRENT");
        assertThat(result.getAccountTypeDescription()).isEqualTo("Current Account");
        assertThat(result.getIsDefault()).isTrue();
        verify(bankAccountTypeDao, times(1)).getBankAccountType(1);
    }

    @Test
    void shouldHandleDifferentBankAccountTypeIds() {
        BankAccountType type1 = new BankAccountType();
        type1.setBankAccountTypeId(1);
        type1.setAccountTypeCode("SAVINGS");

        BankAccountType type2 = new BankAccountType();
        type2.setBankAccountTypeId(2);
        type2.setAccountTypeCode("CHECKING");

        when(bankAccountTypeDao.getBankAccountType(1)).thenReturn(type1);
        when(bankAccountTypeDao.getBankAccountType(2)).thenReturn(type2);

        BankAccountType result1 = bankAccountTypeService.getBankAccountType(1);
        BankAccountType result2 = bankAccountTypeService.getBankAccountType(2);

        assertThat(result1.getBankAccountTypeId()).isEqualTo(1);
        assertThat(result2.getBankAccountTypeId()).isEqualTo(2);
        verify(bankAccountTypeDao, times(1)).getBankAccountType(1);
        verify(bankAccountTypeDao, times(1)).getBankAccountType(2);
    }

    @Test
    void shouldHandleZeroId() {
        when(bankAccountTypeDao.getBankAccountType(0)).thenReturn(null);

        BankAccountType result = bankAccountTypeService.getBankAccountType(0);

        assertThat(result).isNull();
        verify(bankAccountTypeDao, times(1)).getBankAccountType(0);
    }

    @Test
    void shouldHandleNegativeId() {
        when(bankAccountTypeDao.getBankAccountType(-1)).thenReturn(null);

        BankAccountType result = bankAccountTypeService.getBankAccountType(-1);

        assertThat(result).isNull();
        verify(bankAccountTypeDao, times(1)).getBankAccountType(-1);
    }

    // ========== getDefaultBankAccountType Tests ==========

    @Test
    void shouldReturnDefaultBankAccountTypeWhenExists() {
        testBankAccountType.setIsDefault(true);
        when(bankAccountTypeDao.getDefaultBankAccountType()).thenReturn(testBankAccountType);

        BankAccountType result = bankAccountTypeService.getDefaultBankAccountType();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testBankAccountType);
        assertThat(result.getIsDefault()).isTrue();
        assertThat(result.getBankAccountTypeId()).isEqualTo(1);
        verify(bankAccountTypeDao, times(1)).getDefaultBankAccountType();
    }

    @Test
    void shouldReturnNullWhenNoDefaultBankAccountTypeExists() {
        when(bankAccountTypeDao.getDefaultBankAccountType()).thenReturn(null);

        BankAccountType result = bankAccountTypeService.getDefaultBankAccountType();

        assertThat(result).isNull();
        verify(bankAccountTypeDao, times(1)).getDefaultBankAccountType();
    }

    @Test
    void shouldReturnDefaultBankAccountTypeWithCompleteData() {
        BankAccountType defaultType = new BankAccountType();
        defaultType.setBankAccountTypeId(3);
        defaultType.setAccountTypeCode("DEFAULT");
        defaultType.setAccountTypeDescription("Default Account Type");
        defaultType.setIsDefault(true);

        when(bankAccountTypeDao.getDefaultBankAccountType()).thenReturn(defaultType);

        BankAccountType result = bankAccountTypeService.getDefaultBankAccountType();

        assertThat(result).isNotNull();
        assertThat(result.getAccountTypeCode()).isEqualTo("DEFAULT");
        assertThat(result.getAccountTypeDescription()).isEqualTo("Default Account Type");
        assertThat(result.getIsDefault()).isTrue();
        verify(bankAccountTypeDao, times(1)).getDefaultBankAccountType();
    }

    @Test
    void shouldCallGetDefaultMultipleTimes() {
        testBankAccountType.setIsDefault(true);
        when(bankAccountTypeDao.getDefaultBankAccountType()).thenReturn(testBankAccountType);

        bankAccountTypeService.getDefaultBankAccountType();
        bankAccountTypeService.getDefaultBankAccountType();
        bankAccountTypeService.getDefaultBankAccountType();

        verify(bankAccountTypeDao, times(3)).getDefaultBankAccountType();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindBankAccountTypeByPrimaryKey() {
        when(bankAccountTypeDao.findByPK(1)).thenReturn(testBankAccountType);

        BankAccountType result = bankAccountTypeService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testBankAccountType);
        assertThat(result.getBankAccountTypeId()).isEqualTo(1);
        verify(bankAccountTypeDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenBankAccountTypeNotFoundByPK() {
        when(bankAccountTypeDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> bankAccountTypeService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(bankAccountTypeDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewBankAccountType() {
        bankAccountTypeService.persist(testBankAccountType);

        verify(bankAccountTypeDao, times(1)).persist(testBankAccountType);
    }

    @Test
    void shouldUpdateExistingBankAccountType() {
        when(bankAccountTypeDao.update(testBankAccountType)).thenReturn(testBankAccountType);

        BankAccountType result = bankAccountTypeService.update(testBankAccountType);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testBankAccountType);
        verify(bankAccountTypeDao, times(1)).update(testBankAccountType);
    }

    @Test
    void shouldUpdateBankAccountTypeAndReturnUpdatedEntity() {
        testBankAccountType.setAccountTypeDescription("Updated Description");
        when(bankAccountTypeDao.update(testBankAccountType)).thenReturn(testBankAccountType);

        BankAccountType result = bankAccountTypeService.update(testBankAccountType);

        assertThat(result).isNotNull();
        assertThat(result.getAccountTypeDescription()).isEqualTo("Updated Description");
        verify(bankAccountTypeDao, times(1)).update(testBankAccountType);
    }

    @Test
    void shouldDeleteBankAccountType() {
        bankAccountTypeService.delete(testBankAccountType);

        verify(bankAccountTypeDao, times(1)).delete(testBankAccountType);
    }

    @Test
    void shouldFindBankAccountTypesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("accountTypeCode", "SAVINGS");
        attributes.put("isDefault", false);

        List<BankAccountType> expectedList = Arrays.asList(testBankAccountType);
        when(bankAccountTypeDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<BankAccountType> result = bankAccountTypeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testBankAccountType);
        verify(bankAccountTypeDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("accountTypeCode", "NONEXISTENT");

        when(bankAccountTypeDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<BankAccountType> result = bankAccountTypeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(bankAccountTypeDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<BankAccountType> result = bankAccountTypeService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(bankAccountTypeDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<BankAccountType> result = bankAccountTypeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(bankAccountTypeDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleBankAccountTypeWithMinimalData() {
        BankAccountType minimalType = new BankAccountType();
        minimalType.setBankAccountTypeId(99);

        when(bankAccountTypeDao.getBankAccountType(99)).thenReturn(minimalType);

        BankAccountType result = bankAccountTypeService.getBankAccountType(99);

        assertThat(result).isNotNull();
        assertThat(result.getBankAccountTypeId()).isEqualTo(99);
        assertThat(result.getAccountTypeCode()).isNull();
        assertThat(result.getAccountTypeDescription()).isNull();
        verify(bankAccountTypeDao, times(1)).getBankAccountType(99);
    }

    @Test
    void shouldHandleBankAccountTypeWithNullDescription() {
        testBankAccountType.setAccountTypeDescription(null);
        when(bankAccountTypeDao.getBankAccountType(1)).thenReturn(testBankAccountType);

        BankAccountType result = bankAccountTypeService.getBankAccountType(1);

        assertThat(result).isNotNull();
        assertThat(result.getAccountTypeDescription()).isNull();
        verify(bankAccountTypeDao, times(1)).getBankAccountType(1);
    }

    @Test
    void shouldHandleDefaultFlagChanges() {
        testBankAccountType.setIsDefault(false);
        when(bankAccountTypeDao.update(testBankAccountType)).thenReturn(testBankAccountType);

        testBankAccountType.setIsDefault(true);
        BankAccountType result = bankAccountTypeService.update(testBankAccountType);

        assertThat(result.getIsDefault()).isTrue();
        verify(bankAccountTypeDao, times(1)).update(testBankAccountType);
    }

    @Test
    void shouldHandleListWithDefaultAndNonDefaultTypes() {
        BankAccountType defaultType = new BankAccountType();
        defaultType.setBankAccountTypeId(1);
        defaultType.setIsDefault(true);

        BankAccountType nonDefaultType = new BankAccountType();
        nonDefaultType.setBankAccountTypeId(2);
        nonDefaultType.setIsDefault(false);

        List<BankAccountType> types = Arrays.asList(defaultType, nonDefaultType);
        when(bankAccountTypeDao.getBankAccountTypeList()).thenReturn(types);

        List<BankAccountType> result = bankAccountTypeService.getBankAccountTypeList();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getIsDefault()).isTrue();
        assertThat(result.get(1).getIsDefault()).isFalse();
        verify(bankAccountTypeDao, times(1)).getBankAccountTypeList();
    }
}
