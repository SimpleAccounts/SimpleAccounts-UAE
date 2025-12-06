package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmploymentDao;
import com.simpleaccounts.entity.Employment;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
import java.time.LocalDate;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmploymentServiceImplTest {

    @Mock
    private EmploymentDao employmentDao;

    @InjectMocks
    private EmploymentServiceImpl employmentService;

    private Employment testEmployment;

    @BeforeEach
    void setUp() {
        testEmployment = new Employment();
        testEmployment.setEmploymentId(1);
        testEmployment.setDesignation("Software Engineer");
        testEmployment.setEmploymentType("Full-Time");
        testEmployment.setJoiningDate(LocalDate.of(2023, 1, 15));
        testEmployment.setSalary(BigDecimal.valueOf(75000.00));
        testEmployment.setCreatedDate(LocalDateTime.now());
        testEmployment.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnEmploymentDaoWhenGetDaoCalled() {
        assertThat(employmentService.getDao()).isEqualTo(employmentDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(employmentService.getDao()).isNotNull();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindEmploymentByPrimaryKey() {
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testEmployment);
        assertThat(result.getEmploymentId()).isEqualTo(1);
        assertThat(result.getDesignation()).isEqualTo("Software Engineer");
        verify(employmentDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenEmploymentNotFoundByPK() {
        when(employmentDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employmentService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(employmentDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindEmploymentWithAllFieldsPopulated() {
        testEmployment.setDepartment("Engineering");
        testEmployment.setLocation("Dubai");
        testEmployment.setReportingManager("John Manager");
        testEmployment.setEndDate(LocalDate.of(2024, 12, 31));

        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getDepartment()).isEqualTo("Engineering");
        assertThat(result.getLocation()).isEqualTo("Dubai");
        assertThat(result.getReportingManager()).isEqualTo("John Manager");
        assertThat(result.getEndDate()).isEqualTo(LocalDate.of(2024, 12, 31));
        verify(employmentDao, times(1)).findByPK(1);
    }

    @Test
    void shouldPersistNewEmployment() {
        employmentService.persist(testEmployment);

        verify(employmentDao, times(1)).persist(testEmployment);
    }

    @Test
    void shouldPersistEmploymentWithPrimaryKey() {
        when(employmentDao.findByPK(1)).thenReturn(null);

        employmentService.persist(testEmployment, 1);

        verify(employmentDao, times(1)).findByPK(1);
        verify(employmentDao, times(1)).persist(testEmployment);
    }

    @Test
    void shouldThrowExceptionWhenPersistingDuplicateEmployment() {
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        assertThatThrownBy(() -> employmentService.persist(testEmployment, 1))
                .isInstanceOf(ServiceException.class);

        verify(employmentDao, times(1)).findByPK(1);
        verify(employmentDao, never()).persist(any());
    }

    @Test
    void shouldUpdateExistingEmployment() {
        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testEmployment);
        verify(employmentDao, times(1)).update(testEmployment);
    }

    @Test
    void shouldUpdateEmploymentAndReturnUpdatedEntity() {
        testEmployment.setDesignation("Senior Software Engineer");
        testEmployment.setSalary(BigDecimal.valueOf(95000.00));
        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment);

        assertThat(result).isNotNull();
        assertThat(result.getDesignation()).isEqualTo("Senior Software Engineer");
        assertThat(result.getSalary()).isEqualTo(BigDecimal.valueOf(95000.00));
        verify(employmentDao, times(1)).update(testEmployment);
    }

    @Test
    void shouldUpdateEmploymentWithPrimaryKey() {
        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testEmployment);
        verify(employmentDao, times(1)).update(testEmployment);
    }

    @Test
    void shouldDeleteEmployment() {
        employmentService.delete(testEmployment);

        verify(employmentDao, times(1)).delete(testEmployment);
    }

    @Test
    void shouldDeleteEmploymentWithPrimaryKey() {
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        employmentService.delete(testEmployment, 1);

        verify(employmentDao, times(1)).findByPK(1);
        verify(employmentDao, times(1)).delete(testEmployment);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentEmployment() {
        when(employmentDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employmentService.delete(testEmployment, 999))
                .isInstanceOf(ServiceException.class);

        verify(employmentDao, times(1)).findByPK(999);
        verify(employmentDao, never()).delete(any());
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldFindEmploymentsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("designation", "Software Engineer");
        attributes.put("deleteFlag", false);

        List<Employment> expectedList = Arrays.asList(testEmployment);
        when(employmentDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testEmployment);
        verify(employmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("designation", "CEO");

        when(employmentDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<Employment> result = employmentService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employmentDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employmentDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleEmploymentsByAttributes() {
        Employment employment2 = new Employment();
        employment2.setEmploymentId(2);
        employment2.setDesignation("Software Engineer");
        employment2.setEmploymentType("Full-Time");

        Employment employment3 = new Employment();
        employment3.setEmploymentId(3);
        employment3.setDesignation("Software Engineer");
        employment3.setEmploymentType("Part-Time");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("designation", "Software Engineer");

        List<Employment> expectedList = Arrays.asList(testEmployment, employment2, employment3);
        when(employmentDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testEmployment, employment2, employment3);
        verify(employmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindEmploymentsByEmploymentType() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employmentType", "Full-Time");

        when(employmentDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testEmployment));

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmploymentType()).isEqualTo("Full-Time");
        verify(employmentDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleEmploymentWithMinimalData() {
        Employment minimalEmployment = new Employment();
        minimalEmployment.setEmploymentId(99);

        when(employmentDao.findByPK(99)).thenReturn(minimalEmployment);

        Employment result = employmentService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getEmploymentId()).isEqualTo(99);
        assertThat(result.getDesignation()).isNull();
        assertThat(result.getSalary()).isNull();
        verify(employmentDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        Employment employment1 = new Employment();
        Employment employment2 = new Employment();
        Employment employment3 = new Employment();

        employmentService.persist(employment1);
        employmentService.persist(employment2);
        employmentService.persist(employment3);

        verify(employmentDao, times(3)).persist(any(Employment.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(employmentDao.update(any(Employment.class))).thenReturn(testEmployment);

        employmentService.update(testEmployment);
        employmentService.update(testEmployment);
        employmentService.update(testEmployment);

        verify(employmentDao, times(3)).update(testEmployment);
    }

    @Test
    void shouldVerifyDaoInteractionForFindByPK() {
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        employmentService.findByPK(1);
        employmentService.findByPK(1);

        verify(employmentDao, times(2)).findByPK(1);
    }

    @Test
    void shouldHandleNullEmploymentInUpdate() {
        Employment nullEmployment = new Employment();
        when(employmentDao.update(any(Employment.class))).thenReturn(nullEmployment);

        Employment result = employmentService.update(nullEmployment);

        assertThat(result).isNotNull();
        verify(employmentDao, times(1)).update(nullEmployment);
    }

    @Test
    void shouldHandleComplexAttributeSearch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("designation", "Software Engineer");
        attributes.put("employmentType", "Full-Time");
        attributes.put("department", "Engineering");
        attributes.put("deleteFlag", false);

        when(employmentDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testEmployment));

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(employmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleEmploymentWithZeroSalary() {
        Employment zeroSalaryEmployment = new Employment();
        zeroSalaryEmployment.setEmploymentId(2);
        zeroSalaryEmployment.setDesignation("Intern");
        zeroSalaryEmployment.setSalary(BigDecimal.ZERO);

        when(employmentDao.findByPK(2)).thenReturn(zeroSalaryEmployment);

        Employment result = employmentService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getSalary()).isEqualTo(BigDecimal.ZERO);
        verify(employmentDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleEmploymentWithHighSalary() {
        Employment highSalaryEmployment = new Employment();
        highSalaryEmployment.setEmploymentId(3);
        highSalaryEmployment.setDesignation("CEO");
        highSalaryEmployment.setSalary(BigDecimal.valueOf(500000.00));

        when(employmentDao.update(highSalaryEmployment)).thenReturn(highSalaryEmployment);

        Employment result = employmentService.update(highSalaryEmployment);

        assertThat(result).isNotNull();
        assertThat(result.getSalary()).isEqualTo(BigDecimal.valueOf(500000.00));
        verify(employmentDao, times(1)).update(highSalaryEmployment);
    }

    @Test
    void shouldHandleEmploymentWithFutureJoiningDate() {
        testEmployment.setJoiningDate(LocalDate.of(2025, 6, 1));

        when(employmentDao.persist(testEmployment)).thenReturn(testEmployment);

        employmentService.persist(testEmployment);

        assertThat(testEmployment.getJoiningDate()).isEqualTo(LocalDate.of(2025, 6, 1));
        verify(employmentDao, times(1)).persist(testEmployment);
    }

    @Test
    void shouldHandleEmploymentWithPastEndDate() {
        testEmployment.setEndDate(LocalDate.of(2020, 12, 31));

        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment);

        assertThat(result.getEndDate()).isEqualTo(LocalDate.of(2020, 12, 31));
        verify(employmentDao, times(1)).update(testEmployment);
    }

    @Test
    void shouldHandleSearchByDepartment() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("department", "Engineering");

        testEmployment.setDepartment("Engineering");
        when(employmentDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testEmployment));

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDepartment()).isEqualTo("Engineering");
        verify(employmentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleEmploymentWithDeleteFlag() {
        testEmployment.setDeleteFlag(true);

        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment);

        assertThat(result).isNotNull();
        assertThat(result.getDeleteFlag()).isTrue();
        verify(employmentDao, times(1)).update(testEmployment);
    }

    @Test
    void shouldHandleMultipleEmploymentRecords() {
        List<Employment> employments = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Employment emp = new Employment();
            emp.setEmploymentId(i);
            emp.setDesignation("Position " + i);
            employments.add(emp);
        }

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("deleteFlag", false);

        when(employmentDao.findByAttributes(attributes)).thenReturn(employments);

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        verify(employmentDao, times(1)).findByAttributes(attributes);
    }
}
