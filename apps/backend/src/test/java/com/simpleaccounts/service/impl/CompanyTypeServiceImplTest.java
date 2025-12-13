package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CompanyTypeDao;
import com.simpleaccounts.entity.CompanyType;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanyTypeServiceImpl Unit Tests")
class CompanyTypeServiceImplTest {

    @Mock
    private CompanyTypeDao companyTypeDao;

    @InjectMocks
    private CompanyTypeServiceImpl companyTypeService;

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsCompanyTypeDao() {
        // Act
        var result = companyTypeService.getDao();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(companyTypeDao);
    }

    @Test
    @DisplayName("Should return list of company types")
    void getCompanyTypesReturnsTypesList() {
        // Arrange
        List<CompanyType> expectedTypes = Arrays.asList(
            createCompanyType(1, "LLC"),
            createCompanyType(2, "Corporation"),
            createCompanyType(3, "Partnership")
        );

        when(companyTypeDao.getCompanyTypes())
            .thenReturn(expectedTypes);

        // Act
        List<CompanyType> result = companyTypeService.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull().hasSize(3);
        verify(companyTypeDao).getCompanyTypes();
    }

    @Test
    @DisplayName("Should return empty list when no company types exist")
    void getCompanyTypesReturnsEmptyList() {
        // Arrange
        when(companyTypeDao.getCompanyTypes())
            .thenReturn(new ArrayList<>());

        // Act
        List<CompanyType> result = companyTypeService.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return single company type when only one exists")
    void getCompanyTypesReturnsSingleType() {
        // Arrange
        List<CompanyType> types = Collections.singletonList(
            createCompanyType(1, "Sole Proprietorship")
        );

        when(companyTypeDao.getCompanyTypes())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeService.getCompanyTypes();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCompanyTypeName()).isEqualTo("Sole Proprietorship");
    }

    @Test
    @DisplayName("Should find company type by ID")
    void findByIdReturnsCompanyType() {
        // Arrange
        Integer typeId = 1;
        CompanyType expectedType = createCompanyType(typeId, "LLC");

        when(companyTypeDao.findByPK(typeId))
            .thenReturn(expectedType);

        // Act
        CompanyType result = companyTypeService.findByPK(typeId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(typeId);
        verify(companyTypeDao).findByPK(typeId);
    }

    @Test
    @DisplayName("Should throw exception when company type not found")
    void findByIdThrowsExceptionWhenNotFound() {
        // Arrange
        Integer typeId = 999;

        when(companyTypeDao.findByPK(typeId))
            .thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> companyTypeService.findByPK(typeId))
            .isInstanceOf(ServiceException.class);
    }

    @Test
    @DisplayName("Should return company types with correct names")
    void getCompanyTypesReturnsCorrectNames() {
        // Arrange
        List<CompanyType> types = Arrays.asList(
            createCompanyType(1, "Limited Liability Company"),
            createCompanyType(2, "Free Zone Company")
        );

        when(companyTypeDao.getCompanyTypes())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeService.getCompanyTypes();

        // Assert
        assertThat(result.get(0).getCompanyTypeName()).isEqualTo("Limited Liability Company");
        assertThat(result.get(1).getCompanyTypeName()).isEqualTo("Free Zone Company");
    }

    @Test
    @DisplayName("Should return company types in order")
    void getCompanyTypesReturnsInOrder() {
        // Arrange
        List<CompanyType> types = Arrays.asList(
            createCompanyType(1, "First"),
            createCompanyType(2, "Second"),
            createCompanyType(3, "Third")
        );

        when(companyTypeDao.getCompanyTypes())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeService.getCompanyTypes();

        // Assert
        assertThat(result).extracting(CompanyType::getCompanyTypeName)
            .containsExactly("First", "Second", "Third");
    }

    @Test
    @DisplayName("Should handle large list of company types")
    void getCompanyTypesHandlesLargeList() {
        // Arrange
        List<CompanyType> types = createCompanyTypeList(50);

        when(companyTypeDao.getCompanyTypes())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeService.getCompanyTypes();

        // Assert
        assertThat(result).hasSize(50);
    }

    @Test
    @DisplayName("Should verify DAO is called for getCompanyTypes")
    void getCompanyTypesCallsDao() {
        // Arrange
        when(companyTypeDao.getCompanyTypes())
            .thenReturn(new ArrayList<>());

        // Act
        companyTypeService.getCompanyTypes();

        // Assert
        verify(companyTypeDao).getCompanyTypes();
    }

    @Test
    @DisplayName("Should return DAO of correct type")
    void getDaoReturnsCorrectType() {
        // Act
        var result = companyTypeService.getDao();

        // Assert
        assertThat(result).isInstanceOf(CompanyTypeDao.class);
    }

    private CompanyType createCompanyType(Integer id, String name) {
        CompanyType type = new CompanyType();
        type.setId(id);
        type.setCompanyTypeName(name);
        return type;
    }

    private List<CompanyType> createCompanyTypeList(int count) {
        List<CompanyType> types = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            types.add(createCompanyType(i + 1, "Type " + (i + 1)));
        }
        return types;
    }
}
