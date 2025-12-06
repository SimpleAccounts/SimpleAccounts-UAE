package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.UnitTypeDao;
import com.simpleaccounts.entity.UnitType;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("UnitTypeServiceImpl Tests")
class UnitTypeServiceImplTest {

    @Mock
    private UnitTypeDao unitTypeDao;

    @InjectMocks
    private UnitTypeServiceImpl unitTypeService;

    private UnitType testUnitType;
    private Integer unitTypeId;

    @BeforeEach
    void setUp() {
        unitTypeId = 1;

        testUnitType = new UnitType();
        testUnitType.setUnitTypeId(unitTypeId);
        testUnitType.setUnitTypeName("Piece");
        testUnitType.setUnitTypeCode("PC");
        testUnitType.setUnitTypeDescription("Unit for counting individual items");
        testUnitType.setIsActive(true);
        testUnitType.setCreatedBy(1);
        testUnitType.setCreatedDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return UnitTypeDao instance")
        void shouldReturnUnitTypeDao() {
            assertThat(unitTypeService.getDao()).isEqualTo(unitTypeDao);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(unitTypeService.getDao()).isNotNull();
        }

        @Test
        @DisplayName("Should return same instance on multiple calls")
        void shouldReturnSameInstanceOnMultipleCalls() {
            var dao1 = unitTypeService.getDao();
            var dao2 = unitTypeService.getDao();

            assertThat(dao1).isSameAs(dao2);
            assertThat(dao1).isEqualTo(unitTypeDao);
        }

        @Test
        @DisplayName("Should return correct DAO type")
        void shouldReturnCorrectDaoType() {
            assertThat(unitTypeService.getDao()).isInstanceOf(UnitTypeDao.class);
        }
    }

    @Nested
    @DisplayName("findByPK() Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should find unit type by primary key")
        void shouldFindUnitTypeByPrimaryKey() {
            when(unitTypeDao.findByPK(unitTypeId)).thenReturn(testUnitType);

            UnitType result = unitTypeService.findByPK(unitTypeId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testUnitType);
            assertThat(result.getUnitTypeId()).isEqualTo(unitTypeId);
            assertThat(result.getUnitTypeName()).isEqualTo("Piece");
            verify(unitTypeDao, times(1)).findByPK(unitTypeId);
        }

        @Test
        @DisplayName("Should throw exception when unit type not found by PK")
        void shouldThrowExceptionWhenUnitTypeNotFoundByPK() {
            Integer nonExistentId = 999;
            when(unitTypeDao.findByPK(nonExistentId)).thenReturn(null);

            assertThatThrownBy(() -> unitTypeService.findByPK(nonExistentId))
                    .isInstanceOf(ServiceException.class);

            verify(unitTypeDao, times(1)).findByPK(nonExistentId);
        }

        @Test
        @DisplayName("Should handle zero as unit type ID")
        void shouldHandleZeroAsUnitTypeId() {
            Integer zeroId = 0;
            when(unitTypeDao.findByPK(zeroId)).thenReturn(null);

            assertThatThrownBy(() -> unitTypeService.findByPK(zeroId))
                    .isInstanceOf(ServiceException.class);

            verify(unitTypeDao, times(1)).findByPK(zeroId);
        }

        @Test
        @DisplayName("Should handle negative unit type ID")
        void shouldHandleNegativeUnitTypeId() {
            Integer negativeId = -1;
            when(unitTypeDao.findByPK(negativeId)).thenReturn(null);

            assertThatThrownBy(() -> unitTypeService.findByPK(negativeId))
                    .isInstanceOf(ServiceException.class);

            verify(unitTypeDao, times(1)).findByPK(negativeId);
        }

        @Test
        @DisplayName("Should handle very large unit type ID")
        void shouldHandleVeryLargeUnitTypeId() {
            Integer largeId = Integer.MAX_VALUE;
            UnitType largeUnitType = createUnitType(largeId, "Large ID Type", "LRG");

            when(unitTypeDao.findByPK(largeId)).thenReturn(largeUnitType);

            UnitType result = unitTypeService.findByPK(largeId);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeId()).isEqualTo(largeId);
        }

        @Test
        @DisplayName("Should find different unit types correctly")
        void shouldFindDifferentUnitTypesCorrectly() {
            UnitType kilogram = createUnitType(2, "Kilogram", "KG");
            UnitType liter = createUnitType(3, "Liter", "LTR");

            when(unitTypeDao.findByPK(2)).thenReturn(kilogram);
            when(unitTypeDao.findByPK(3)).thenReturn(liter);

            UnitType result1 = unitTypeService.findByPK(2);
            UnitType result2 = unitTypeService.findByPK(3);

            assertThat(result1.getUnitTypeName()).isEqualTo("Kilogram");
            assertThat(result2.getUnitTypeName()).isEqualTo("Liter");
        }
    }

    @Nested
    @DisplayName("persist() Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new unit type")
        void shouldPersistNewUnitType() {
            unitTypeService.persist(testUnitType);

            verify(unitTypeDao, times(1)).persist(testUnitType);
        }

        @Test
        @DisplayName("Should persist multiple unit types")
        void shouldPersistMultipleUnitTypes() {
            UnitType type1 = createUnitType(1, "Type 1", "T1");
            UnitType type2 = createUnitType(2, "Type 2", "T2");
            UnitType type3 = createUnitType(3, "Type 3", "T3");

            unitTypeService.persist(type1);
            unitTypeService.persist(type2);
            unitTypeService.persist(type3);

            verify(unitTypeDao, times(1)).persist(type1);
            verify(unitTypeDao, times(1)).persist(type2);
            verify(unitTypeDao, times(1)).persist(type3);
        }

        @Test
        @DisplayName("Should persist unit type with minimal data")
        void shouldPersistUnitTypeWithMinimalData() {
            UnitType minimalType = new UnitType();
            minimalType.setUnitTypeName("Minimal");

            unitTypeService.persist(minimalType);

            verify(unitTypeDao, times(1)).persist(minimalType);
        }

        @Test
        @DisplayName("Should persist unit type with all fields")
        void shouldPersistUnitTypeWithAllFields() {
            UnitType completeType = createUnitType(10, "Complete Type", "COMP");
            completeType.setUnitTypeDescription("Complete description");
            completeType.setIsActive(true);
            completeType.setCreatedBy(5);
            completeType.setCreatedDate(LocalDateTime.now());

            unitTypeService.persist(completeType);

            verify(unitTypeDao, times(1)).persist(completeType);
        }
    }

    @Nested
    @DisplayName("update() Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing unit type")
        void shouldUpdateExistingUnitType() {
            when(unitTypeDao.update(testUnitType)).thenReturn(testUnitType);

            UnitType result = unitTypeService.update(testUnitType);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testUnitType);
            verify(unitTypeDao, times(1)).update(testUnitType);
        }

        @Test
        @DisplayName("Should update unit type name")
        void shouldUpdateUnitTypeName() {
            testUnitType.setUnitTypeName("Updated Name");
            when(unitTypeDao.update(testUnitType)).thenReturn(testUnitType);

            UnitType result = unitTypeService.update(testUnitType);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeName()).isEqualTo("Updated Name");
            verify(unitTypeDao, times(1)).update(testUnitType);
        }

        @Test
        @DisplayName("Should update unit type code")
        void shouldUpdateUnitTypeCode() {
            testUnitType.setUnitTypeCode("NEW");
            when(unitTypeDao.update(testUnitType)).thenReturn(testUnitType);

            UnitType result = unitTypeService.update(testUnitType);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeCode()).isEqualTo("NEW");
            verify(unitTypeDao, times(1)).update(testUnitType);
        }

        @Test
        @DisplayName("Should update unit type with null ID")
        void shouldUpdateUnitTypeWithNullId() {
            UnitType typeWithNullId = new UnitType();
            typeWithNullId.setUnitTypeId(null);
            typeWithNullId.setUnitTypeName("No ID Type");

            when(unitTypeDao.update(typeWithNullId)).thenReturn(typeWithNullId);

            UnitType result = unitTypeService.update(typeWithNullId);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeId()).isNull();
            verify(unitTypeDao, times(1)).update(typeWithNullId);
        }

        @Test
        @DisplayName("Should update inactive unit type")
        void shouldUpdateInactiveUnitType() {
            testUnitType.setIsActive(false);
            when(unitTypeDao.update(testUnitType)).thenReturn(testUnitType);

            UnitType result = unitTypeService.update(testUnitType);

            assertThat(result).isNotNull();
            assertThat(result.getIsActive()).isFalse();
            verify(unitTypeDao, times(1)).update(testUnitType);
        }

        @Test
        @DisplayName("Should handle multiple consecutive updates")
        void shouldHandleMultipleConsecutiveUpdates() {
            when(unitTypeDao.update(testUnitType)).thenReturn(testUnitType);

            testUnitType.setUnitTypeName("First Update");
            UnitType result1 = unitTypeService.update(testUnitType);

            testUnitType.setUnitTypeName("Second Update");
            UnitType result2 = unitTypeService.update(testUnitType);

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            verify(unitTypeDao, times(2)).update(testUnitType);
        }
    }

    @Nested
    @DisplayName("delete() Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete unit type")
        void shouldDeleteUnitType() {
            unitTypeService.delete(testUnitType);

            verify(unitTypeDao, times(1)).delete(testUnitType);
        }

        @Test
        @DisplayName("Should delete multiple unit types")
        void shouldDeleteMultipleUnitTypes() {
            UnitType type1 = createUnitType(1, "Type 1", "T1");
            UnitType type2 = createUnitType(2, "Type 2", "T2");

            unitTypeService.delete(type1);
            unitTypeService.delete(type2);

            verify(unitTypeDao, times(1)).delete(type1);
            verify(unitTypeDao, times(1)).delete(type2);
        }

        @Test
        @DisplayName("Should delete unit type with null ID")
        void shouldDeleteUnitTypeWithNullId() {
            UnitType typeWithNullId = new UnitType();
            typeWithNullId.setUnitTypeId(null);

            unitTypeService.delete(typeWithNullId);

            verify(unitTypeDao, times(1)).delete(typeWithNullId);
        }
    }

    @Nested
    @DisplayName("findByAttributes() Tests")
    class FindByAttributesTests {

        @Test
        @DisplayName("Should find unit types by attributes")
        void shouldFindUnitTypesByAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("unitTypeName", "Piece");

            List<UnitType> expectedList = Arrays.asList(testUnitType);
            when(unitTypeDao.findByAttributes(attributes)).thenReturn(expectedList);

            List<UnitType> result = unitTypeService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result).containsExactly(testUnitType);
            verify(unitTypeDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should return empty list when no attributes match")
        void shouldReturnEmptyListWhenNoAttributesMatch() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("unitTypeName", "NonExistent");

            when(unitTypeDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

            List<UnitType> result = unitTypeService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(unitTypeDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should handle null attributes map")
        void shouldHandleNullAttributesMap() {
            List<UnitType> result = unitTypeService.findByAttributes(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(unitTypeDao, never()).findByAttributes(any());
        }

        @Test
        @DisplayName("Should handle empty attributes map")
        void shouldHandleEmptyAttributesMap() {
            Map<String, Object> attributes = new HashMap<>();

            List<UnitType> result = unitTypeService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(unitTypeDao, never()).findByAttributes(any());
        }

        @Test
        @DisplayName("Should find multiple unit types by attributes")
        void shouldFindMultipleUnitTypesByAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("isActive", true);

            UnitType type1 = createUnitType(1, "Type 1", "T1");
            UnitType type2 = createUnitType(2, "Type 2", "T2");
            List<UnitType> expectedList = Arrays.asList(type1, type2);

            when(unitTypeDao.findByAttributes(attributes)).thenReturn(expectedList);

            List<UnitType> result = unitTypeService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            verify(unitTypeDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should find by multiple attributes")
        void shouldFindByMultipleAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("unitTypeName", "Piece");
            attributes.put("isActive", true);

            List<UnitType> expectedList = Collections.singletonList(testUnitType);
            when(unitTypeDao.findByAttributes(attributes)).thenReturn(expectedList);

            List<UnitType> result = unitTypeService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getUnitTypeName()).isEqualTo("Piece");
            assertThat(result.get(0).getIsActive()).isTrue();
        }
    }

    @Nested
    @DisplayName("Edge Cases and Error Handling Tests")
    class EdgeCasesAndErrorHandlingTests {

        @Test
        @DisplayName("Should handle unit type with minimal data")
        void shouldHandleUnitTypeWithMinimalData() {
            UnitType minimalType = new UnitType();
            minimalType.setUnitTypeId(100);

            when(unitTypeDao.findByPK(100)).thenReturn(minimalType);

            UnitType result = unitTypeService.findByPK(100);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeId()).isEqualTo(100);
            assertThat(result.getUnitTypeName()).isNull();
        }

        @Test
        @DisplayName("Should handle unit type with empty string values")
        void shouldHandleUnitTypeWithEmptyStringValues() {
            UnitType emptyType = createUnitType(50, "", "");
            emptyType.setUnitTypeDescription("");

            when(unitTypeDao.update(emptyType)).thenReturn(emptyType);

            UnitType result = unitTypeService.update(emptyType);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeName()).isEmpty();
            assertThat(result.getUnitTypeCode()).isEmpty();
        }

        @Test
        @DisplayName("Should handle unit type with special characters")
        void shouldHandleUnitTypeWithSpecialCharacters() {
            UnitType specialType = createUnitType(60, "Type <>&\"'", "T&S");

            when(unitTypeDao.update(specialType)).thenReturn(specialType);

            UnitType result = unitTypeService.update(specialType);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeName()).contains("<", ">", "&", "\"", "'");
        }

        @Test
        @DisplayName("Should handle unit type with very long name")
        void shouldHandleUnitTypeWithVeryLongName() {
            String longName = "A".repeat(500);
            UnitType longType = createUnitType(70, longName, "LONG");

            when(unitTypeDao.update(longType)).thenReturn(longType);

            UnitType result = unitTypeService.update(longType);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeName()).hasSize(500);
        }

        @Test
        @DisplayName("Should handle unit type with very long description")
        void shouldHandleUnitTypeWithVeryLongDescription() {
            String longDesc = "Description ".repeat(100);
            testUnitType.setUnitTypeDescription(longDesc);

            when(unitTypeDao.update(testUnitType)).thenReturn(testUnitType);

            UnitType result = unitTypeService.update(testUnitType);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeDescription()).isNotEmpty();
        }

        @Test
        @DisplayName("Should handle concurrent operations")
        void shouldHandleConcurrentOperations() {
            UnitType type1 = createUnitType(1, "Type 1", "T1");
            UnitType type2 = createUnitType(2, "Type 2", "T2");

            when(unitTypeDao.findByPK(1)).thenReturn(type1);
            when(unitTypeDao.findByPK(2)).thenReturn(type2);

            UnitType result1 = unitTypeService.findByPK(1);
            UnitType result2 = unitTypeService.findByPK(2);

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            assertThat(result1.getUnitTypeId()).isNotEqualTo(result2.getUnitTypeId());
        }

        @Test
        @DisplayName("Should handle null unit type in update")
        void shouldHandleNullUnitTypeInUpdate() {
            UnitType nullFieldType = new UnitType();
            nullFieldType.setUnitTypeId(80);
            nullFieldType.setUnitTypeName(null);
            nullFieldType.setUnitTypeCode(null);

            when(unitTypeDao.update(nullFieldType)).thenReturn(nullFieldType);

            UnitType result = unitTypeService.update(nullFieldType);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeName()).isNull();
            assertThat(result.getUnitTypeCode()).isNull();
        }

        @Test
        @DisplayName("Should handle unit type with only code")
        void shouldHandleUnitTypeWithOnlyCode() {
            UnitType codeOnlyType = new UnitType();
            codeOnlyType.setUnitTypeId(90);
            codeOnlyType.setUnitTypeCode("CODE");

            when(unitTypeDao.findByPK(90)).thenReturn(codeOnlyType);

            UnitType result = unitTypeService.findByPK(90);

            assertThat(result).isNotNull();
            assertThat(result.getUnitTypeCode()).isEqualTo("CODE");
            assertThat(result.getUnitTypeName()).isNull();
        }

        @Test
        @DisplayName("Should handle mixed active and inactive unit types")
        void shouldHandleMixedActiveAndInactiveUnitTypes() {
            UnitType activeType = createUnitType(1, "Active", "ACT");
            activeType.setIsActive(true);

            UnitType inactiveType = createUnitType(2, "Inactive", "INACT");
            inactiveType.setIsActive(false);

            when(unitTypeDao.update(activeType)).thenReturn(activeType);
            when(unitTypeDao.update(inactiveType)).thenReturn(inactiveType);

            UnitType result1 = unitTypeService.update(activeType);
            UnitType result2 = unitTypeService.update(inactiveType);

            assertThat(result1.getIsActive()).isTrue();
            assertThat(result2.getIsActive()).isFalse();
        }
    }

    // Helper method
    private UnitType createUnitType(Integer id, String name, String code) {
        UnitType unitType = new UnitType();
        unitType.setUnitTypeId(id);
        unitType.setUnitTypeName(name);
        unitType.setUnitTypeCode(code);
        unitType.setUnitTypeDescription("Description for " + name);
        unitType.setIsActive(true);
        unitType.setCreatedBy(1);
        unitType.setCreatedDate(LocalDateTime.now());
        return unitType;
    }
}
