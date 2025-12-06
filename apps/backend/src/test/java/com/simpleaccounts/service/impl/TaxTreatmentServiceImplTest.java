package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.TaxTreatment;
import com.simpleaccounts.repository.TaxTreatmentRepository;
import com.simpleaccounts.rest.contactcontroller.TaxtTreatmentdto;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaxTreatmentServiceImplTest {

    @Mock
    private TaxTreatmentRepository taxTreatmentRepository;

    @InjectMocks
    private TaxTreatmentServiceImpl taxTreatmentService;

    private TaxTreatment taxTreatment1;
    private TaxTreatment taxTreatment2;
    private TaxTreatment taxTreatment3;
    private List<TaxTreatment> taxTreatmentList;

    @BeforeEach
    void setUp() {
        taxTreatment1 = new TaxTreatment();
        taxTreatment1.setId(1);
        taxTreatment1.setTaxTreatment("VAT Standard");

        taxTreatment2 = new TaxTreatment();
        taxTreatment2.setId(2);
        taxTreatment2.setTaxTreatment("VAT Exempt");

        taxTreatment3 = new TaxTreatment();
        taxTreatment3.setId(3);
        taxTreatment3.setTaxTreatment("VAT Zero Rated");

        taxTreatmentList = new ArrayList<>(Arrays.asList(taxTreatment1, taxTreatment2, taxTreatment3));
    }

    // ========== getList Tests ==========

    @Test
    void shouldReturnTaxTreatmentListWhenTreatmentsExist() {
        when(taxTreatmentRepository.findAll()).thenReturn(taxTreatmentList);

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getName()).isEqualTo("VAT Standard");
        assertThat(result.get(1).getId()).isEqualTo(2);
        assertThat(result.get(1).getName()).isEqualTo("VAT Exempt");
        assertThat(result.get(2).getId()).isEqualTo(3);
        assertThat(result.get(2).getName()).isEqualTo("VAT Zero Rated");
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyListWhenNoTaxTreatmentsExist() {
        when(taxTreatmentRepository.findAll()).thenReturn(Collections.emptyList());

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnSingleTaxTreatmentInList() {
        when(taxTreatmentRepository.findAll()).thenReturn(Collections.singletonList(taxTreatment1));

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getName()).isEqualTo("VAT Standard");
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldCorrectlyMapTaxTreatmentToDto() {
        when(taxTreatmentRepository.findAll()).thenReturn(Collections.singletonList(taxTreatment1));

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        TaxtTreatmentdto dto = result.get(0);
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(taxTreatment1.getId());
        assertThat(dto.getName()).isEqualTo(taxTreatment1.getTaxTreatment());
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldHandleLargeListOfTaxTreatments() {
        List<TaxTreatment> largelist = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            TaxTreatment treatment = new TaxTreatment();
            treatment.setId(i);
            treatment.setTaxTreatment("Treatment " + i);
            largelist.add(treatment);
        }

        when(taxTreatmentRepository.findAll()).thenReturn(largelist);

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getName()).isEqualTo("Treatment 1");
        assertThat(result.get(99).getId()).isEqualTo(100);
        assertThat(result.get(99).getName()).isEqualTo("Treatment 100");
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldCreateNewDtoInstancesForEachTaxTreatment() {
        when(taxTreatmentRepository.findAll()).thenReturn(taxTreatmentList);

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0)).isNotSameAs(result.get(1));
        assertThat(result.get(1)).isNotSameAs(result.get(2));
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldHandleTaxTreatmentWithNullId() {
        TaxTreatment treatmentWithNullId = new TaxTreatment();
        treatmentWithNullId.setId(null);
        treatmentWithNullId.setTaxTreatment("No ID Treatment");

        when(taxTreatmentRepository.findAll()).thenReturn(Collections.singletonList(treatmentWithNullId));

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isNull();
        assertThat(result.get(0).getName()).isEqualTo("No ID Treatment");
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldHandleTaxTreatmentWithNullName() {
        TaxTreatment treatmentWithNullName = new TaxTreatment();
        treatmentWithNullName.setId(10);
        treatmentWithNullName.setTaxTreatment(null);

        when(taxTreatmentRepository.findAll()).thenReturn(Collections.singletonList(treatmentWithNullName));

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(10);
        assertThat(result.get(0).getName()).isNull();
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldHandleTaxTreatmentWithEmptyName() {
        TaxTreatment treatmentWithEmptyName = new TaxTreatment();
        treatmentWithEmptyName.setId(11);
        treatmentWithEmptyName.setTaxTreatment("");

        when(taxTreatmentRepository.findAll()).thenReturn(Collections.singletonList(treatmentWithEmptyName));

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(11);
        assertThat(result.get(0).getName()).isEmpty();
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldHandleTaxTreatmentWithSpecialCharacters() {
        TaxTreatment specialTreatment = new TaxTreatment();
        specialTreatment.setId(12);
        specialTreatment.setTaxTreatment("VAT @ 5% (Special)");

        when(taxTreatmentRepository.findAll()).thenReturn(Collections.singletonList(specialTreatment));

        List<TaxtTreatmentdto> result = taxTreatmentService.getList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(12);
        assertThat(result.get(0).getName()).isEqualTo("VAT @ 5% (Special)");
        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldCallFindAllOnlyOnce() {
        when(taxTreatmentRepository.findAll()).thenReturn(taxTreatmentList);

        taxTreatmentService.getList();

        verify(taxTreatmentRepository, times(1)).findAll();
    }

    @Test
    void shouldCallFindAllMultipleTimesWhenMethodInvokedMultipleTimes() {
        when(taxTreatmentRepository.findAll()).thenReturn(taxTreatmentList);

        taxTreatmentService.getList();
        taxTreatmentService.getList();
        taxTreatmentService.getList();

        verify(taxTreatmentRepository, times(3)).findAll();
    }

    // ========== getTaxTreatment Tests ==========

    @Test
    void shouldReturnTaxTreatmentWhenValidIdProvided() {
        when(taxTreatmentRepository.findById(1)).thenReturn(taxTreatment1);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(taxTreatment1);
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getTaxTreatment()).isEqualTo("VAT Standard");
        verify(taxTreatmentRepository, times(1)).findById(1);
    }

    @Test
    void shouldReturnNullWhenTaxTreatmentNotFound() {
        when(taxTreatmentRepository.findById(999)).thenReturn(null);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(999);

        assertThat(result).isNull();
        verify(taxTreatmentRepository, times(1)).findById(999);
    }

    @Test
    void shouldReturnCorrectTaxTreatmentForDifferentIds() {
        when(taxTreatmentRepository.findById(1)).thenReturn(taxTreatment1);
        when(taxTreatmentRepository.findById(2)).thenReturn(taxTreatment2);
        when(taxTreatmentRepository.findById(3)).thenReturn(taxTreatment3);

        TaxTreatment result1 = taxTreatmentService.getTaxTreatment(1);
        TaxTreatment result2 = taxTreatmentService.getTaxTreatment(2);
        TaxTreatment result3 = taxTreatmentService.getTaxTreatment(3);

        assertThat(result1).isEqualTo(taxTreatment1);
        assertThat(result2).isEqualTo(taxTreatment2);
        assertThat(result3).isEqualTo(taxTreatment3);
        verify(taxTreatmentRepository, times(1)).findById(1);
        verify(taxTreatmentRepository, times(1)).findById(2);
        verify(taxTreatmentRepository, times(1)).findById(3);
    }

    @Test
    void shouldHandleNullIdGracefully() {
        when(taxTreatmentRepository.findById(null)).thenReturn(null);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(null);

        assertThat(result).isNull();
        verify(taxTreatmentRepository, times(1)).findById(null);
    }

    @Test
    void shouldHandleZeroId() {
        when(taxTreatmentRepository.findById(0)).thenReturn(null);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(0);

        assertThat(result).isNull();
        verify(taxTreatmentRepository, times(1)).findById(0);
    }

    @Test
    void shouldHandleNegativeId() {
        when(taxTreatmentRepository.findById(-1)).thenReturn(null);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(-1);

        assertThat(result).isNull();
        verify(taxTreatmentRepository, times(1)).findById(-1);
    }

    @Test
    void shouldHandleLargeId() {
        when(taxTreatmentRepository.findById(Integer.MAX_VALUE)).thenReturn(null);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(Integer.MAX_VALUE);

        assertThat(result).isNull();
        verify(taxTreatmentRepository, times(1)).findById(Integer.MAX_VALUE);
    }

    @Test
    void shouldCallFindByIdExactlyOnce() {
        when(taxTreatmentRepository.findById(1)).thenReturn(taxTreatment1);

        taxTreatmentService.getTaxTreatment(1);

        verify(taxTreatmentRepository, times(1)).findById(1);
    }

    @Test
    void shouldCallFindByIdMultipleTimesWhenInvokedMultipleTimes() {
        when(taxTreatmentRepository.findById(1)).thenReturn(taxTreatment1);

        taxTreatmentService.getTaxTreatment(1);
        taxTreatmentService.getTaxTreatment(1);
        taxTreatmentService.getTaxTreatment(1);

        verify(taxTreatmentRepository, times(3)).findById(1);
    }

    @Test
    void shouldReturnDifferentInstancesForSameId() {
        TaxTreatment treatment = new TaxTreatment();
        treatment.setId(1);
        treatment.setTaxTreatment("VAT Standard");

        when(taxTreatmentRepository.findById(1)).thenReturn(treatment);

        TaxTreatment result1 = taxTreatmentService.getTaxTreatment(1);
        TaxTreatment result2 = taxTreatmentService.getTaxTreatment(1);

        assertThat(result1).isEqualTo(result2);
        assertThat(result1).isSameAs(result2);
        verify(taxTreatmentRepository, times(2)).findById(1);
    }

    @Test
    void shouldHandleTaxTreatmentWithAllFieldsPopulated() {
        TaxTreatment fullTreatment = new TaxTreatment();
        fullTreatment.setId(20);
        fullTreatment.setTaxTreatment("Complete VAT Treatment");

        when(taxTreatmentRepository.findById(20)).thenReturn(fullTreatment);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(20);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(20);
        assertThat(result.getTaxTreatment()).isEqualTo("Complete VAT Treatment");
        verify(taxTreatmentRepository, times(1)).findById(20);
    }

    @Test
    void shouldReturnSameInstanceFromRepository() {
        when(taxTreatmentRepository.findById(1)).thenReturn(taxTreatment1);

        TaxTreatment result = taxTreatmentService.getTaxTreatment(1);

        assertThat(result).isSameAs(taxTreatment1);
        verify(taxTreatmentRepository, times(1)).findById(1);
    }

    @Test
    void shouldHandleSequentialCallsWithDifferentIds() {
        when(taxTreatmentRepository.findById(1)).thenReturn(taxTreatment1);
        when(taxTreatmentRepository.findById(2)).thenReturn(taxTreatment2);

        TaxTreatment result1 = taxTreatmentService.getTaxTreatment(1);
        TaxTreatment result2 = taxTreatmentService.getTaxTreatment(2);

        assertThat(result1).isNotEqualTo(result2);
        assertThat(result1.getId()).isEqualTo(1);
        assertThat(result2.getId()).isEqualTo(2);
        verify(taxTreatmentRepository, times(1)).findById(1);
        verify(taxTreatmentRepository, times(1)).findById(2);
    }
}
