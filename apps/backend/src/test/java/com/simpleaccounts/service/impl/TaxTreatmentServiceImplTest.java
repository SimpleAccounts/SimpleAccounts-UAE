package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.TaxTreatment;
import com.simpleaccounts.repository.TaxTreatmentRepository;
import com.simpleaccounts.rest.contactcontroller.TaxtTreatmentdto;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaxTreatmentServiceImpl Unit Tests")
class TaxTreatmentServiceImplTest {

    @Mock
    private TaxTreatmentRepository taxTreatmentRepository;

    @InjectMocks
    private TaxTreatmentServiceImpl taxTreatmentService;

    @Nested
    @DisplayName("getList Tests")
    class GetListTests {

        @Test
        @DisplayName("Should return tax treatment list")
        void getListReturnsTaxTreatmentList() {
            // Arrange
            List<TaxTreatment> treatments = createTaxTreatmentList(3);
            when(taxTreatmentRepository.findAll()).thenReturn(treatments);

            // Act
            List<TaxtTreatmentdto> result = taxTreatmentService.getList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(taxTreatmentRepository).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no treatments exist")
        void getListReturnsEmptyList() {
            // Arrange
            when(taxTreatmentRepository.findAll()).thenReturn(new ArrayList<>());

            // Act
            List<TaxtTreatmentdto> result = taxTreatmentService.getList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should map tax treatment to DTO correctly")
        void getListMapsFieldsCorrectly() {
            // Arrange
            TaxTreatment treatment = createTaxTreatment(1, "Standard Rate");
            when(taxTreatmentRepository.findAll()).thenReturn(Arrays.asList(treatment));

            // Act
            List<TaxtTreatmentdto> result = taxTreatmentService.getList();

            // Assert
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1);
            assertThat(result.get(0).getName()).isEqualTo("Standard Rate");
        }
    }

    @Nested
    @DisplayName("getTaxTreatment Tests")
    class GetTaxTreatmentTests {

        @Test
        @DisplayName("Should return tax treatment by ID")
        void getTaxTreatmentReturnsTreatmentById() {
            // Arrange
            Integer id = 1;
            TaxTreatment expectedTreatment = createTaxTreatment(id, "Zero Rated");
            when(taxTreatmentRepository.findById(id)).thenReturn(expectedTreatment);

            // Act
            TaxTreatment result = taxTreatmentService.getTaxTreatment(id);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(id);
            assertThat(result.getTaxTreatment()).isEqualTo("Zero Rated");
            verify(taxTreatmentRepository).findById(id);
        }

        @Test
        @DisplayName("Should return null when treatment not found")
        void getTaxTreatmentReturnsNullWhenNotFound() {
            // Arrange
            Integer id = 999;
            when(taxTreatmentRepository.findById(id)).thenReturn(null);

            // Act
            TaxTreatment result = taxTreatmentService.getTaxTreatment(id);

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should handle ID zero")
        void getTaxTreatmentHandlesIdZero() {
            // Arrange
            Integer id = 0;
            when(taxTreatmentRepository.findById(id)).thenReturn(null);

            // Act
            TaxTreatment result = taxTreatmentService.getTaxTreatment(id);

            // Assert
            assertThat(result).isNull();
            verify(taxTreatmentRepository).findById(id);
        }
    }

    private List<TaxTreatment> createTaxTreatmentList(int count) {
        List<TaxTreatment> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createTaxTreatment(i + 1, "Treatment " + (i + 1)));
        }
        return list;
    }

    private TaxTreatment createTaxTreatment(Integer id, String name) {
        TaxTreatment treatment = new TaxTreatment();
        treatment.setId(id);
        treatment.setTaxTreatment(name);
        return treatment;
    }
}
