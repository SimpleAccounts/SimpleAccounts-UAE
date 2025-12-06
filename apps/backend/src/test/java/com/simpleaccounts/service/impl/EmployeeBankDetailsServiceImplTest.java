package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeBankDetailsDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
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
class EmployeeBankDetailsServiceImplTest {

    @Mock
    private EmployeeBankDetailsDao employeeBankDetailsDao;

    @InjectMocks
    private EmployeeBankDetailsServiceImpl employeeBankDetailsService;

    private EmployeeBankDetails testEmployeeBankDetails;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setEmployeeFirstName("John");
        testEmployee.setEmployeeLastName("Doe");

        testEmployeeBankDetails = new EmployeeBankDetails();
        testEmployeeBankDetails.setEmployeeBankDetailsId(1);
        testEmployeeBankDetails.setEmployeeId(testEmployee);
        testEmployeeBankDetails.setBankName("Emirates NBD");
        testEmployeeBankDetails.setBankAccountNumber("1234567890");
        testEmployeeBankDetails.setBankAccountName("John Doe");
        testEmployeeBankDetails.setIbanNumber("AE070331234567890123456");
        testEmployeeBankDetails.setSwiftCode("EBILAEAD");
        testEmployeeBankDetails.setBranchName("Dubai Main Branch");
        testEmployeeBankDetails.setCreatedBy(1);
        testEmployeeBankDetails.setCreatedDate(LocalDateTime.now());
        testEmployeeBankDetails.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnEmployeeBankDetailsDaoWhenGetDaoCalled() {
        assertThat(employeeBankDetailsService.getDao()).isEqualTo(employeeBankDetailsDao);
    }

    // ========== findByPK Tests ==========

    @Test
    void shouldReturnEmployeeBankDetailsWhenFoundByPK() {
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmployeeBankDetailsId()).isEqualTo(1);
        assertThat(result.getBankName()).isEqualTo("Emirates NBD");
        assertThat(result.getBankAccountNumber()).isEqualTo("1234567890");
        assertThat(result.getIbanNumber()).isEqualTo("AE070331234567890123456");
        assertThat(result.getSwiftCode()).isEqualTo("EBILAEAD");
        verify(employeeBankDetailsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenEmployeeBankDetailsNotFoundByPK() {
        when(employeeBankDetailsDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employeeBankDetailsService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(employeeBankDetailsDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindEmployeeBankDetailsByDifferentIds() {
        EmployeeBankDetails bankDetails2 = new EmployeeBankDetails();
        bankDetails2.setEmployeeBankDetailsId(2);
        bankDetails2.setBankName("ADCB");
        bankDetails2.setBankAccountNumber("9876543210");

        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);
        when(employeeBankDetailsDao.findByPK(2)).thenReturn(bankDetails2);

        EmployeeBankDetails result1 = employeeBankDetailsService.findByPK(1);
        EmployeeBankDetails result2 = employeeBankDetailsService.findByPK(2);

        assertThat(result1.getBankName()).isEqualTo("Emirates NBD");
        assertThat(result2.getBankName()).isEqualTo("ADCB");
        verify(employeeBankDetailsDao, times(1)).findByPK(1);
        verify(employeeBankDetailsDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleMultipleCallsForSameId() {
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result1 = employeeBankDetailsService.findByPK(1);
        EmployeeBankDetails result2 = employeeBankDetailsService.findByPK(1);

        assertThat(result1).isEqualTo(testEmployeeBankDetails);
        assertThat(result2).isEqualTo(testEmployeeBankDetails);
        verify(employeeBankDetailsDao, times(2)).findByPK(1);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistNewEmployeeBankDetails() {
        employeeBankDetailsService.persist(testEmployeeBankDetails);

        verify(employeeBankDetailsDao, times(1)).persist(testEmployeeBankDetails);
    }

    @Test
    void shouldPersistEmployeeBankDetailsWithAllFields() {
        testEmployeeBankDetails.setBankAddress("Sheikh Zayed Road, Dubai");
        testEmployeeBankDetails.setBranchCode("001");
        testEmployeeBankDetails.setRoutingNumber("123456789");

        employeeBankDetailsService.persist(testEmployeeBankDetails);

        verify(employeeBankDetailsDao, times(1)).persist(testEmployeeBankDetails);
    }

    @Test
    void shouldPersistMultipleEmployeeBankDetails() {
        EmployeeBankDetails bankDetails2 = new EmployeeBankDetails();
        bankDetails2.setEmployeeBankDetailsId(2);
        bankDetails2.setBankName("ADCB");

        employeeBankDetailsService.persist(testEmployeeBankDetails);
        employeeBankDetailsService.persist(bankDetails2);

        verify(employeeBankDetailsDao, times(1)).persist(testEmployeeBankDetails);
        verify(employeeBankDetailsDao, times(1)).persist(bankDetails2);
    }

    @Test
    void shouldPersistEmployeeBankDetailsWithMinimalData() {
        EmployeeBankDetails minimalDetails = new EmployeeBankDetails();
        minimalDetails.setEmployeeId(testEmployee);
        minimalDetails.setBankAccountNumber("1234567890");

        employeeBankDetailsService.persist(minimalDetails);

        verify(employeeBankDetailsDao, times(1)).persist(minimalDetails);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateExistingEmployeeBankDetails() {
        when(employeeBankDetailsDao.update(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.update(testEmployeeBankDetails);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testEmployeeBankDetails);
        verify(employeeBankDetailsDao, times(1)).update(testEmployeeBankDetails);
    }

    @Test
    void shouldUpdateBankAccountNumber() {
        testEmployeeBankDetails.setBankAccountNumber("0987654321");
        when(employeeBankDetailsDao.update(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.update(testEmployeeBankDetails);

        assertThat(result).isNotNull();
        assertThat(result.getBankAccountNumber()).isEqualTo("0987654321");
        verify(employeeBankDetailsDao, times(1)).update(testEmployeeBankDetails);
    }

    @Test
    void shouldUpdateIbanNumber() {
        testEmployeeBankDetails.setIbanNumber("AE070331234567890999999");
        when(employeeBankDetailsDao.update(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.update(testEmployeeBankDetails);

        assertThat(result).isNotNull();
        assertThat(result.getIbanNumber()).isEqualTo("AE070331234567890999999");
        verify(employeeBankDetailsDao, times(1)).update(testEmployeeBankDetails);
    }

    @Test
    void shouldUpdateBankName() {
        testEmployeeBankDetails.setBankName("Abu Dhabi Commercial Bank");
        when(employeeBankDetailsDao.update(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.update(testEmployeeBankDetails);

        assertThat(result).isNotNull();
        assertThat(result.getBankName()).isEqualTo("Abu Dhabi Commercial Bank");
        verify(employeeBankDetailsDao, times(1)).update(testEmployeeBankDetails);
    }

    @Test
    void shouldUpdateSwiftCode() {
        testEmployeeBankDetails.setSwiftCode("ADCBAEAA");
        when(employeeBankDetailsDao.update(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.update(testEmployeeBankDetails);

        assertThat(result).isNotNull();
        assertThat(result.getSwiftCode()).isEqualTo("ADCBAEAA");
        verify(employeeBankDetailsDao, times(1)).update(testEmployeeBankDetails);
    }

    // ========== delete Tests ==========

    @Test
    void shouldDeleteEmployeeBankDetails() {
        employeeBankDetailsService.delete(testEmployeeBankDetails);

        verify(employeeBankDetailsDao, times(1)).delete(testEmployeeBankDetails);
    }

    @Test
    void shouldDeleteMultipleEmployeeBankDetails() {
        EmployeeBankDetails bankDetails2 = new EmployeeBankDetails();
        bankDetails2.setEmployeeBankDetailsId(2);

        employeeBankDetailsService.delete(testEmployeeBankDetails);
        employeeBankDetailsService.delete(bankDetails2);

        verify(employeeBankDetailsDao, times(1)).delete(testEmployeeBankDetails);
        verify(employeeBankDetailsDao, times(1)).delete(bankDetails2);
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldReturnEmployeeBankDetailsWhenValidAttributesProvided() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("bankName", "Emirates NBD");
        attributes.put("deleteFlag", false);

        List<EmployeeBankDetails> expectedList = Arrays.asList(testEmployeeBankDetails);
        when(employeeBankDetailsDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testEmployeeBankDetails);
        verify(employeeBankDetailsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("bankName", "Non-existent Bank");

        when(employeeBankDetailsDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeBankDetailsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnMultipleEmployeeBankDetailsWhenMultipleMatch() {
        EmployeeBankDetails bankDetails2 = new EmployeeBankDetails();
        bankDetails2.setEmployeeBankDetailsId(2);
        bankDetails2.setBankName("ADCB");

        EmployeeBankDetails bankDetails3 = new EmployeeBankDetails();
        bankDetails3.setEmployeeBankDetailsId(3);
        bankDetails3.setBankName("Mashreq Bank");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("deleteFlag", false);

        List<EmployeeBankDetails> expectedList = Arrays.asList(testEmployeeBankDetails, bankDetails2, bankDetails3);
        when(employeeBankDetailsDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testEmployeeBankDetails, bankDetails2, bankDetails3);
        verify(employeeBankDetailsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindEmployeeBankDetailsByEmployeeId() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", testEmployee);

        List<EmployeeBankDetails> expectedList = Arrays.asList(testEmployeeBankDetails);
        when(employeeBankDetailsDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmployeeId()).isEqualTo(testEmployee);
        verify(employeeBankDetailsDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeBankDetailsDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeBankDetailsDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleEmployeeBankDetailsWithNullOptionalFields() {
        EmployeeBankDetails minimalDetails = new EmployeeBankDetails();
        minimalDetails.setEmployeeBankDetailsId(2);
        minimalDetails.setBankAccountNumber("1234567890");
        when(employeeBankDetailsDao.findByPK(2)).thenReturn(minimalDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getBankName()).isNull();
        assertThat(result.getIbanNumber()).isNull();
        assertThat(result.getSwiftCode()).isNull();
        verify(employeeBankDetailsDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleIbanNumberWithSpaces() {
        testEmployeeBankDetails.setIbanNumber("AE07 0331 2345 6789 0123 456");
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getIbanNumber()).contains(" ");
        verify(employeeBankDetailsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleLongBankAccountNumbers() {
        testEmployeeBankDetails.setBankAccountNumber("12345678901234567890");
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getBankAccountNumber()).hasSize(20);
        verify(employeeBankDetailsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleBankNamesWithSpecialCharacters() {
        testEmployeeBankDetails.setBankName("Emirates NBD - PJSC");
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getBankName()).contains("-");
        verify(employeeBankDetailsDao, times(1)).findByPK(1);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);
        when(employeeBankDetailsDao.update(testEmployeeBankDetails)).thenReturn(testEmployeeBankDetails);

        employeeBankDetailsService.findByPK(1);
        employeeBankDetailsService.update(testEmployeeBankDetails);
        employeeBankDetailsService.persist(testEmployeeBankDetails);
        employeeBankDetailsService.delete(testEmployeeBankDetails);

        verify(employeeBankDetailsDao, times(1)).findByPK(1);
        verify(employeeBankDetailsDao, times(1)).update(testEmployeeBankDetails);
        verify(employeeBankDetailsDao, times(1)).persist(testEmployeeBankDetails);
        verify(employeeBankDetailsDao, times(1)).delete(testEmployeeBankDetails);
    }

    @Test
    void shouldHandleDifferentUAEBanks() {
        testEmployeeBankDetails.setBankName("First Abu Dhabi Bank");
        testEmployeeBankDetails.setSwiftCode("NBADAEAA");
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testEmployeeBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getBankName()).isEqualTo("First Abu Dhabi Bank");
        assertThat(result.getSwiftCode()).isEqualTo("NBADAEAA");
        verify(employeeBankDetailsDao, times(1)).findByPK(1);
    }
}
