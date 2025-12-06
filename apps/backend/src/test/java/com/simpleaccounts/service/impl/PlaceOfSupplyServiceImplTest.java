package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.PlaceOfSupplyDao;
import com.simpleaccounts.entity.PlaceOfSupply;
import com.simpleaccounts.exceptions.ServiceException;
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
class PlaceOfSupplyServiceImplTest {

    @Mock
    private PlaceOfSupplyDao placeOfSupplyDao;

    @InjectMocks
    private PlaceOfSupplyServiceImpl placeOfSupplyService;

    private PlaceOfSupply testPlaceOfSupply;

    @BeforeEach
    void setUp() {
        testPlaceOfSupply = new PlaceOfSupply();
        testPlaceOfSupply.setId(1);
        testPlaceOfSupply.setPlaceOfSupplyCode("AE-DXB");
        testPlaceOfSupply.setPlaceOfSupplyName("Dubai");
        testPlaceOfSupply.setCountryCode("AE");
        testPlaceOfSupply.setStateCode("DXB");
        testPlaceOfSupply.setCreatedBy(1);
        testPlaceOfSupply.setCreatedDate(LocalDateTime.now());
        testPlaceOfSupply.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnPlaceOfSupplyDaoWhenGetDaoCalled() {
        assertThat(placeOfSupplyService.getDao()).isEqualTo(placeOfSupplyDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(placeOfSupplyService.getDao()).isNotNull();
    }

    // ========== getPlaceOfSupplyForDropdown Tests ==========

    @Test
    void shouldReturnPlaceOfSupplyListWhenDropdownRequested() {
        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply);
        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(expectedList);

        List<PlaceOfSupply> result = placeOfSupplyService.getPlaceOfSupplyForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testPlaceOfSupply);
        assertThat(result.get(0).getPlaceOfSupplyName()).isEqualTo("Dubai");
        verify(placeOfSupplyDao, times(1)).getPlaceOfSupplyForDropdown();
    }

    @Test
    void shouldReturnEmptyListWhenNoPlacesOfSupplyExist() {
        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(Collections.emptyList());

        List<PlaceOfSupply> result = placeOfSupplyService.getPlaceOfSupplyForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(placeOfSupplyDao, times(1)).getPlaceOfSupplyForDropdown();
    }

    @Test
    void shouldReturnMultiplePlacesOfSupplyForDropdown() {
        PlaceOfSupply place2 = new PlaceOfSupply();
        place2.setId(2);
        place2.setPlaceOfSupplyCode("AE-AUH");
        place2.setPlaceOfSupplyName("Abu Dhabi");

        PlaceOfSupply place3 = new PlaceOfSupply();
        place3.setId(3);
        place3.setPlaceOfSupplyCode("AE-SHJ");
        place3.setPlaceOfSupplyName("Sharjah");

        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply, place2, place3);
        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(expectedList);

        List<PlaceOfSupply> result = placeOfSupplyService.getPlaceOfSupplyForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testPlaceOfSupply, place2, place3);
        assertThat(result.get(0).getPlaceOfSupplyName()).isEqualTo("Dubai");
        assertThat(result.get(1).getPlaceOfSupplyName()).isEqualTo("Abu Dhabi");
        assertThat(result.get(2).getPlaceOfSupplyName()).isEqualTo("Sharjah");
        verify(placeOfSupplyDao, times(1)).getPlaceOfSupplyForDropdown();
    }

    @Test
    void shouldHandleMultipleDropdownCalls() {
        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply);
        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(expectedList);

        List<PlaceOfSupply> result1 = placeOfSupplyService.getPlaceOfSupplyForDropdown();
        List<PlaceOfSupply> result2 = placeOfSupplyService.getPlaceOfSupplyForDropdown();

        assertThat(result1).isEqualTo(result2);
        verify(placeOfSupplyDao, times(2)).getPlaceOfSupplyForDropdown();
    }

    @Test
    void shouldReturnPlacesWithAllFieldsPopulated() {
        testPlaceOfSupply.setTaxRate(5.0);
        testPlaceOfSupply.setDescription("Emirate of Dubai");

        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply);
        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(expectedList);

        List<PlaceOfSupply> result = placeOfSupplyService.getPlaceOfSupplyForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTaxRate()).isEqualTo(5.0);
        assertThat(result.get(0).getDescription()).isEqualTo("Emirate of Dubai");
        verify(placeOfSupplyDao, times(1)).getPlaceOfSupplyForDropdown();
    }

    @Test
    void shouldReturnLargeListOfPlacesOfSupply() {
        List<PlaceOfSupply> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            PlaceOfSupply place = new PlaceOfSupply();
            place.setId(i);
            place.setPlaceOfSupplyCode("CODE-" + i);
            place.setPlaceOfSupplyName("Place " + i);
            largeList.add(place);
        }

        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(largeList);

        List<PlaceOfSupply> result = placeOfSupplyService.getPlaceOfSupplyForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getPlaceOfSupplyName()).isEqualTo("Place 1");
        assertThat(result.get(49).getPlaceOfSupplyName()).isEqualTo("Place 50");
        verify(placeOfSupplyDao, times(1)).getPlaceOfSupplyForDropdown();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindPlaceOfSupplyByPrimaryKey() {
        when(placeOfSupplyDao.findByPK(1)).thenReturn(testPlaceOfSupply);

        PlaceOfSupply result = placeOfSupplyService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testPlaceOfSupply);
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getPlaceOfSupplyName()).isEqualTo("Dubai");
        verify(placeOfSupplyDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenPlaceOfSupplyNotFoundByPK() {
        when(placeOfSupplyDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> placeOfSupplyService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(placeOfSupplyDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewPlaceOfSupply() {
        placeOfSupplyService.persist(testPlaceOfSupply);

        verify(placeOfSupplyDao, times(1)).persist(testPlaceOfSupply);
    }

    @Test
    void shouldUpdateExistingPlaceOfSupply() {
        when(placeOfSupplyDao.update(testPlaceOfSupply)).thenReturn(testPlaceOfSupply);

        PlaceOfSupply result = placeOfSupplyService.update(testPlaceOfSupply);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testPlaceOfSupply);
        verify(placeOfSupplyDao, times(1)).update(testPlaceOfSupply);
    }

    @Test
    void shouldUpdatePlaceOfSupplyAndReturnUpdatedEntity() {
        testPlaceOfSupply.setPlaceOfSupplyName("Updated Dubai");
        when(placeOfSupplyDao.update(testPlaceOfSupply)).thenReturn(testPlaceOfSupply);

        PlaceOfSupply result = placeOfSupplyService.update(testPlaceOfSupply);

        assertThat(result).isNotNull();
        assertThat(result.getPlaceOfSupplyName()).isEqualTo("Updated Dubai");
        verify(placeOfSupplyDao, times(1)).update(testPlaceOfSupply);
    }

    @Test
    void shouldDeletePlaceOfSupply() {
        placeOfSupplyService.delete(testPlaceOfSupply);

        verify(placeOfSupplyDao, times(1)).delete(testPlaceOfSupply);
    }

    @Test
    void shouldFindPlaceOfSupplyByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("countryCode", "AE");
        attributes.put("deleteFlag", false);

        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply);
        when(placeOfSupplyDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<PlaceOfSupply> result = placeOfSupplyService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testPlaceOfSupply);
        verify(placeOfSupplyDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("countryCode", "US");

        when(placeOfSupplyDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<PlaceOfSupply> result = placeOfSupplyService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(placeOfSupplyDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<PlaceOfSupply> result = placeOfSupplyService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(placeOfSupplyDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<PlaceOfSupply> result = placeOfSupplyService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(placeOfSupplyDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandlePlaceOfSupplyWithMinimalData() {
        PlaceOfSupply minimalPlace = new PlaceOfSupply();
        minimalPlace.setId(99);

        when(placeOfSupplyDao.findByPK(99)).thenReturn(minimalPlace);

        PlaceOfSupply result = placeOfSupplyService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getPlaceOfSupplyName()).isNull();
        verify(placeOfSupplyDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleMultiplePlacesWithSameCountryCode() {
        PlaceOfSupply place2 = new PlaceOfSupply();
        place2.setId(2);
        place2.setCountryCode("AE");
        place2.setPlaceOfSupplyName("Abu Dhabi");

        PlaceOfSupply place3 = new PlaceOfSupply();
        place3.setId(3);
        place3.setCountryCode("AE");
        place3.setPlaceOfSupplyName("Sharjah");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("countryCode", "AE");

        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply, place2, place3);
        when(placeOfSupplyDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<PlaceOfSupply> result = placeOfSupplyService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).allMatch(p -> "AE".equals(p.getCountryCode()));
        verify(placeOfSupplyDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldVerifyDaoInteractionForDropdown() {
        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply);
        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(expectedList);

        placeOfSupplyService.getPlaceOfSupplyForDropdown();
        placeOfSupplyService.getPlaceOfSupplyForDropdown();
        placeOfSupplyService.getPlaceOfSupplyForDropdown();

        verify(placeOfSupplyDao, times(3)).getPlaceOfSupplyForDropdown();
    }

    @Test
    void shouldHandleSequentialUpdateOperations() {
        testPlaceOfSupply.setPlaceOfSupplyName("Dubai V1");
        when(placeOfSupplyDao.update(any(PlaceOfSupply.class))).thenReturn(testPlaceOfSupply);

        placeOfSupplyService.update(testPlaceOfSupply);

        testPlaceOfSupply.setPlaceOfSupplyName("Dubai V2");
        placeOfSupplyService.update(testPlaceOfSupply);

        verify(placeOfSupplyDao, times(2)).update(testPlaceOfSupply);
    }

    @Test
    void shouldPersistAndFindPlaceOfSupply() {
        when(placeOfSupplyDao.findByPK(1)).thenReturn(testPlaceOfSupply);

        placeOfSupplyService.persist(testPlaceOfSupply);
        PlaceOfSupply found = placeOfSupplyService.findByPK(1);

        assertThat(found).isNotNull();
        assertThat(found).isEqualTo(testPlaceOfSupply);
        verify(placeOfSupplyDao, times(1)).persist(testPlaceOfSupply);
        verify(placeOfSupplyDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandlePlaceOfSupplyWithSpecialCharacters() {
        testPlaceOfSupply.setPlaceOfSupplyName("Al-Ain & Oasis");
        testPlaceOfSupply.setDescription("Special chars: @#$%^&*()");

        when(placeOfSupplyDao.update(testPlaceOfSupply)).thenReturn(testPlaceOfSupply);

        PlaceOfSupply result = placeOfSupplyService.update(testPlaceOfSupply);

        assertThat(result).isNotNull();
        assertThat(result.getPlaceOfSupplyName()).contains("&");
        assertThat(result.getDescription()).contains("@#$");
        verify(placeOfSupplyDao, times(1)).update(testPlaceOfSupply);
    }

    @Test
    void shouldHandleNullReturnFromDropdown() {
        when(placeOfSupplyDao.getPlaceOfSupplyForDropdown()).thenReturn(null);

        List<PlaceOfSupply> result = placeOfSupplyService.getPlaceOfSupplyForDropdown();

        assertThat(result).isNull();
        verify(placeOfSupplyDao, times(1)).getPlaceOfSupplyForDropdown();
    }

    @Test
    void shouldFindPlaceOfSupplyWithComplexAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("countryCode", "AE");
        attributes.put("stateCode", "DXB");
        attributes.put("deleteFlag", false);
        attributes.put("createdBy", 1);

        List<PlaceOfSupply> expectedList = Arrays.asList(testPlaceOfSupply);
        when(placeOfSupplyDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<PlaceOfSupply> result = placeOfSupplyService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(placeOfSupplyDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandlePlaceOfSupplyWithZeroTaxRate() {
        testPlaceOfSupply.setTaxRate(0.0);

        when(placeOfSupplyDao.findByPK(1)).thenReturn(testPlaceOfSupply);

        PlaceOfSupply result = placeOfSupplyService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getTaxRate()).isEqualTo(0.0);
        verify(placeOfSupplyDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandlePlaceOfSupplyWithHighTaxRate() {
        testPlaceOfSupply.setTaxRate(25.5);

        when(placeOfSupplyDao.update(testPlaceOfSupply)).thenReturn(testPlaceOfSupply);

        PlaceOfSupply result = placeOfSupplyService.update(testPlaceOfSupply);

        assertThat(result).isNotNull();
        assertThat(result.getTaxRate()).isEqualTo(25.5);
        verify(placeOfSupplyDao, times(1)).update(testPlaceOfSupply);
    }
}
