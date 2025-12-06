package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CompanyTypeDao;
import com.simpleaccounts.entity.CompanyType;
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
class CompanyTypeServiceImplTest {

    @Mock
    private CompanyTypeDao companyTypeDao;

    @InjectMocks
    private CompanyTypeServiceImpl companyTypeService;

    private CompanyType testCompanyType;

    @BeforeEach
    void setUp() {
        testCompanyType = new CompanyType();
        testCompanyType.setCompanyTypeCode(1);
        testCompanyType.setCompanyTypeValue("LLC");
        testCompanyType.setCompanyTypeDescription("Limited Liability Company");
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnCompanyTypeDaoWhenGetDaoCalled() {
        assertThat(companyTypeService.getDao()).isEqualTo(companyTypeDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(companyTypeService.getDao()).isNotNull();
    }

    // ========== getCompanyTypes Tests ==========

    @Test
    void shouldReturnCompanyTypesListWhenCompanyTypesExist() {
        CompanyType type2 = new CompanyType();
        type2.setCompanyTypeCode(2);
        type2.setCompanyTypeValue("CORP");
        type2.setCompanyTypeDescription("Corporation");

        List<CompanyType> expectedList = Arrays.asList(testCompanyType, type2);
        when(companyTypeDao.getCompanyTypes()).thenReturn(expectedList);

        List<CompanyType> result = companyTypeService.getCompanyTypes();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testCompanyType, type2);
        verify(companyTypeDao, times(1)).getCompanyTypes();
    }

    @Test
    void shouldReturnEmptyListWhenNoCompanyTypesExist() {
        when(companyTypeDao.getCompanyTypes()).thenReturn(Collections.emptyList());

        List<CompanyType> result = companyTypeService.getCompanyTypes();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyTypeDao, times(1)).getCompanyTypes();
    }

    @Test
    void shouldReturnSingleCompanyTypeWhenOnlyOneExists() {
        List<CompanyType> expectedList = Collections.singletonList(testCompanyType);
        when(companyTypeDao.getCompanyTypes()).thenReturn(expectedList);

        List<CompanyType> result = companyTypeService.getCompanyTypes();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCompanyTypeValue()).isEqualTo("LLC");
        assertThat(result.get(0).getCompanyTypeDescription()).isEqualTo("Limited Liability Company");
        verify(companyTypeDao, times(1)).getCompanyTypes();
    }

    @Test
    void shouldReturnMultipleCompanyTypesInOrder() {
        List<CompanyType> expectedList = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            CompanyType type = new CompanyType();
            type.setCompanyTypeCode(i);
            type.setCompanyTypeValue("TYPE" + i);
            type.setCompanyTypeDescription("Type Description " + i);
            expectedList.add(type);
        }

        when(companyTypeDao.getCompanyTypes()).thenReturn(expectedList);

        List<CompanyType> result = companyTypeService.getCompanyTypes();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result.get(0).getCompanyTypeValue()).isEqualTo("TYPE1");
        assertThat(result.get(4).getCompanyTypeValue()).isEqualTo("TYPE5");
        verify(companyTypeDao, times(1)).getCompanyTypes();
    }

    @Test
    void shouldHandleNullCompanyTypesListGracefully() {
        when(companyTypeDao.getCompanyTypes()).thenReturn(null);

        List<CompanyType> result = companyTypeService.getCompanyTypes();

        assertThat(result).isNull();
        verify(companyTypeDao, times(1)).getCompanyTypes();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindCompanyTypeByPrimaryKey() {
        when(companyTypeDao.findByPK(1)).thenReturn(testCompanyType);

        CompanyType result = companyTypeService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCompanyType);
        assertThat(result.getCompanyTypeCode()).isEqualTo(1);
        assertThat(result.getCompanyTypeValue()).isEqualTo("LLC");
        verify(companyTypeDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenCompanyTypeNotFoundByPK() {
        when(companyTypeDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> companyTypeService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(companyTypeDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewCompanyType() {
        companyTypeService.persist(testCompanyType);

        verify(companyTypeDao, times(1)).persist(testCompanyType);
    }

    @Test
    void shouldUpdateExistingCompanyType() {
        when(companyTypeDao.update(testCompanyType)).thenReturn(testCompanyType);

        CompanyType result = companyTypeService.update(testCompanyType);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCompanyType);
        verify(companyTypeDao, times(1)).update(testCompanyType);
    }

    @Test
    void shouldUpdateCompanyTypeAndReturnUpdatedEntity() {
        testCompanyType.setCompanyTypeDescription("Updated Description");
        when(companyTypeDao.update(testCompanyType)).thenReturn(testCompanyType);

        CompanyType result = companyTypeService.update(testCompanyType);

        assertThat(result).isNotNull();
        assertThat(result.getCompanyTypeDescription()).isEqualTo("Updated Description");
        verify(companyTypeDao, times(1)).update(testCompanyType);
    }

    @Test
    void shouldDeleteCompanyType() {
        companyTypeService.delete(testCompanyType);

        verify(companyTypeDao, times(1)).delete(testCompanyType);
    }

    @Test
    void shouldFindCompanyTypesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("companyTypeValue", "LLC");

        List<CompanyType> expectedList = Arrays.asList(testCompanyType);
        when(companyTypeDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CompanyType> result = companyTypeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testCompanyType);
        verify(companyTypeDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("companyTypeValue", "NONEXISTENT");

        when(companyTypeDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<CompanyType> result = companyTypeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyTypeDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<CompanyType> result = companyTypeService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyTypeDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<CompanyType> result = companyTypeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyTypeDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleCompanyTypesByAttributes() {
        CompanyType type2 = new CompanyType();
        type2.setCompanyTypeCode(2);
        type2.setCompanyTypeValue("LLC");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("companyTypeValue", "LLC");

        List<CompanyType> expectedList = Arrays.asList(testCompanyType, type2);
        when(companyTypeDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CompanyType> result = companyTypeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(companyTypeDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleCompanyTypeWithNullDescription() {
        CompanyType typeWithNullDesc = new CompanyType();
        typeWithNullDesc.setCompanyTypeCode(3);
        typeWithNullDesc.setCompanyTypeValue("SOLE");
        typeWithNullDesc.setCompanyTypeDescription(null);

        when(companyTypeDao.findByPK(3)).thenReturn(typeWithNullDesc);

        CompanyType result = companyTypeService.findByPK(3);

        assertThat(result).isNotNull();
        assertThat(result.getCompanyTypeCode()).isEqualTo(3);
        assertThat(result.getCompanyTypeDescription()).isNull();
        verify(companyTypeDao, times(1)).findByPK(3);
    }

    @Test
    void shouldHandleCompanyTypeWithEmptyDescription() {
        CompanyType typeWithEmptyDesc = new CompanyType();
        typeWithEmptyDesc.setCompanyTypeCode(4);
        typeWithEmptyDesc.setCompanyTypeValue("PART");
        typeWithEmptyDesc.setCompanyTypeDescription("");

        when(companyTypeDao.findByPK(4)).thenReturn(typeWithEmptyDesc);

        CompanyType result = companyTypeService.findByPK(4);

        assertThat(result).isNotNull();
        assertThat(result.getCompanyTypeDescription()).isEmpty();
        verify(companyTypeDao, times(1)).findByPK(4);
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        CompanyType type1 = new CompanyType();
        CompanyType type2 = new CompanyType();
        CompanyType type3 = new CompanyType();

        companyTypeService.persist(type1);
        companyTypeService.persist(type2);
        companyTypeService.persist(type3);

        verify(companyTypeDao, times(3)).persist(any(CompanyType.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(companyTypeDao.update(any(CompanyType.class))).thenReturn(testCompanyType);

        companyTypeService.update(testCompanyType);
        companyTypeService.update(testCompanyType);
        companyTypeService.update(testCompanyType);

        verify(companyTypeDao, times(3)).update(testCompanyType);
    }

    @Test
    void shouldVerifyDaoInteractionForGetCompanyTypes() {
        List<CompanyType> expectedList = Arrays.asList(testCompanyType);
        when(companyTypeDao.getCompanyTypes()).thenReturn(expectedList);

        companyTypeService.getCompanyTypes();
        companyTypeService.getCompanyTypes();

        verify(companyTypeDao, times(2)).getCompanyTypes();
    }

    @Test
    void shouldHandleLargeListOfCompanyTypes() {
        List<CompanyType> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            CompanyType type = new CompanyType();
            type.setCompanyTypeCode(i);
            type.setCompanyTypeValue("TYPE" + i);
            largeList.add(type);
        }

        when(companyTypeDao.getCompanyTypes()).thenReturn(largeList);

        List<CompanyType> result = companyTypeService.getCompanyTypes();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getCompanyTypeCode()).isEqualTo(1);
        assertThat(result.get(99).getCompanyTypeCode()).isEqualTo(100);
        verify(companyTypeDao, times(1)).getCompanyTypes();
    }

    @Test
    void shouldHandleCompanyTypeWithSpecialCharacters() {
        CompanyType specialType = new CompanyType();
        specialType.setCompanyTypeCode(5);
        specialType.setCompanyTypeValue("L.L.C");
        specialType.setCompanyTypeDescription("Company & Partners (L.L.C)");

        when(companyTypeDao.findByPK(5)).thenReturn(specialType);

        CompanyType result = companyTypeService.findByPK(5);

        assertThat(result).isNotNull();
        assertThat(result.getCompanyTypeValue()).isEqualTo("L.L.C");
        assertThat(result.getCompanyTypeDescription()).contains("&");
        verify(companyTypeDao, times(1)).findByPK(5);
    }
}
