package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeBankDetailsDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeBankDetails;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EmployeeBankDetailsServiceImpl Unit Tests")
class EmployeeBankDetailsServiceImplTest {

    @Mock
    private EmployeeBankDetailsDao employeeBankDetailsDao;

    @InjectMocks
    private EmployeeBankDetailsServiceImpl employeeBankDetailsService;

    private EmployeeBankDetails testBankDetails;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeBankDetailsService, "dao", employeeBankDetailsDao);
        testEmployee = createTestEmployee(1, "John", "Doe");
        testBankDetails = createTestBankDetails(1, "John Doe", "1234567890", "AE070331234567890123456");
        testBankDetails.setEmployee(testEmployee);
    }

    @Test
    @DisplayName("Should find bank details by primary key")
    void findByPKReturnsBankDetailsWhenExists() {
        Integer id = 1;
        when(employeeBankDetailsDao.findByPK(id)).thenReturn(testBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getAccountHolderName()).isEqualTo("John Doe");
        assertThat(result.getAccountNumber()).isEqualTo("1234567890");
        verify(employeeBankDetailsDao).findByPK(id);
    }

    @Test
    @DisplayName("Should return null when bank details not found")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(employeeBankDetailsDao.findByPK(id)).thenReturn(null);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(id);

        assertThat(result).isNull();
        verify(employeeBankDetailsDao).findByPK(id);
    }

    @Test
    @DisplayName("Should persist new bank details")
    void persistSavesNewBankDetails() {
        EmployeeBankDetails newBankDetails = createTestBankDetails(null, "Jane Smith", "9876543210", "AE070339876543210123456");

        employeeBankDetailsService.persist(newBankDetails);

        verify(employeeBankDetailsDao).persist(newBankDetails);
    }

    @Test
    @DisplayName("Should update existing bank details")
    void updateModifiesExistingBankDetails() {
        testBankDetails.setAccountHolderName("John Updated");
        when(employeeBankDetailsDao.update(testBankDetails)).thenReturn(testBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.update(testBankDetails);

        assertThat(result).isNotNull();
        assertThat(result.getAccountHolderName()).isEqualTo("John Updated");
        verify(employeeBankDetailsDao).update(testBankDetails);
    }

    @Test
    @DisplayName("Should update bank details with ID")
    void updateWithIdModifiesExistingBankDetails() {
        Integer id = 1;
        testBankDetails.setAccountNumber("5555555555");
        when(employeeBankDetailsDao.update(testBankDetails, id)).thenReturn(testBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.update(testBankDetails, id);

        assertThat(result).isNotNull();
        assertThat(result.getAccountNumber()).isEqualTo("5555555555");
        verify(employeeBankDetailsDao).update(testBankDetails, id);
    }

    @Test
    @DisplayName("Should delete bank details")
    void deleteRemovesBankDetails() {
        employeeBankDetailsService.delete(testBankDetails);

        verify(employeeBankDetailsDao).delete(testBankDetails);
    }

    @Test
    @DisplayName("Should find bank details by attributes")
    void findByAttributesReturnsBankDetails() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);
        List<EmployeeBankDetails> expectedList = Arrays.asList(testBankDetails);

        when(employeeBankDetailsDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getEmployee()).isEqualTo(testEmployee);
        verify(employeeBankDetailsDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return empty list when no bank details found by attributes")
    void findByAttributesReturnsEmptyListWhenNotFound() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);

        when(employeeBankDetailsDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeBankDetails> result = employeeBankDetailsService.findByAttributes(attributes);

        assertThat(result).isNotNull().isEmpty();
        verify(employeeBankDetailsDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsCorrectDao() {
        // Test by calling a method that uses the DAO
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testBankDetails);

        employeeBankDetailsService.findByPK(1);

        verify(employeeBankDetailsDao).findByPK(1);
    }

    @Test
    @DisplayName("Should handle bank details with all fields populated")
    void handlesBankDetailsWithAllFields() {
        EmployeeBankDetails completeDetails = createTestBankDetails(1, "Complete User", "1111111111", "AE070331111111111111111");
        completeDetails.setBankName("Emirates NBD");
        completeDetails.setBranch("Dubai Main");
        completeDetails.setSwiftCode("EBILAEAD");
        completeDetails.setRoutingCode("033");
        completeDetails.setBankId(1);

        when(employeeBankDetailsDao.findByPK(1)).thenReturn(completeDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getBankName()).isEqualTo("Emirates NBD");
        assertThat(result.getBranch()).isEqualTo("Dubai Main");
        assertThat(result.getSwiftCode()).isEqualTo("EBILAEAD");
        assertThat(result.getRoutingCode()).isEqualTo("033");
    }

    @Test
    @DisplayName("Should handle IBAN validation format")
    void handlesIbanFormat() {
        String validIban = "AE070331234567890123456";
        testBankDetails.setIban(validIban);
        when(employeeBankDetailsDao.findByPK(1)).thenReturn(testBankDetails);

        EmployeeBankDetails result = employeeBankDetailsService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getIban()).isEqualTo(validIban);
        assertThat(result.getIban()).startsWith("AE");
    }

    private Employee createTestEmployee(Integer id, String firstName, String lastName) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setIsActive(true);
        employee.setDeleteFlag(false);
        return employee;
    }

    private EmployeeBankDetails createTestBankDetails(Integer id, String accountHolderName, String accountNumber, String iban) {
        EmployeeBankDetails bankDetails = new EmployeeBankDetails();
        bankDetails.setId(id);
        bankDetails.setAccountHolderName(accountHolderName);
        bankDetails.setAccountNumber(accountNumber);
        bankDetails.setIban(iban);
        bankDetails.setIsActive(true);
        bankDetails.setDeleteFlag(false);
        bankDetails.setCreatedBy(1);
        bankDetails.setCreatedDate(LocalDateTime.now());
        return bankDetails;
    }
}
