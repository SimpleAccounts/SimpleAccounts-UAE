package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

import com.simpleaccounts.entity.PlaceOfSupply;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlaceOfSupplyDaoImpl Unit Tests")
class PlaceOfSupplyDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<PlaceOfSupply> placeOfSupplyTypedQuery;

    @InjectMocks
    private PlaceOfSupplyDaoImpl placeOfSupplyDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(placeOfSupplyDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(placeOfSupplyDao, "entityClass", PlaceOfSupply.class);
    }

    @Test
    @DisplayName("Should return all places of supply for dropdown")
    void getPlaceOfSupplyForDropdownReturnsAllPlaces() {
        // Arrange
        List<PlaceOfSupply> expectedPlaces = createPlaceOfSupplyList(5);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(expectedPlaces);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedPlaces);
    }

    @Test
    @DisplayName("Should return empty list when no places of supply exist")
    void getPlaceOfSupplyForDropdownReturnsEmptyListWhenNoPlaces() {
        // Arrange
        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query")
    void getPlaceOfSupplyForDropdownUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        verify(entityManager).createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class);
    }

    @Test
    @DisplayName("Should return single place of supply when only one exists")
    void getPlaceOfSupplyForDropdownReturnsSinglePlace() {
        // Arrange
        List<PlaceOfSupply> places = Collections.singletonList(
            createPlaceOfSupply(1, "Dubai", "DXB")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlaceName()).isEqualTo("Dubai");
    }

    @Test
    @DisplayName("Should handle large list of places of supply")
    void getPlaceOfSupplyForDropdownHandlesLargeList() {
        // Arrange
        List<PlaceOfSupply> places = createPlaceOfSupplyList(200);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(200);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getPlaceOfSupplyForDropdownReturnsConsistentResults() {
        // Arrange
        List<PlaceOfSupply> places = createPlaceOfSupplyList(3);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result1 = placeOfSupplyDao.getPlaceOfSupplyForDropdown();
        List<PlaceOfSupply> result2 = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should call getResultList on typed query")
    void getPlaceOfSupplyForDropdownCallsGetResultList() {
        // Arrange
        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        verify(placeOfSupplyTypedQuery).getResultList();
    }

    @Test
    @DisplayName("Should return places in correct order")
    void getPlaceOfSupplyForDropdownReturnsInCorrectOrder() {
        // Arrange
        PlaceOfSupply place1 = createPlaceOfSupply(1, "Dubai", "DXB");
        PlaceOfSupply place2 = createPlaceOfSupply(2, "Abu Dhabi", "AUH");
        PlaceOfSupply place3 = createPlaceOfSupply(3, "Sharjah", "SHJ");
        List<PlaceOfSupply> places = Arrays.asList(place1, place2, place3);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getPlaceId()).isEqualTo(1);
        assertThat(result.get(1).getPlaceId()).isEqualTo(2);
        assertThat(result.get(2).getPlaceId()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should call entity manager exactly once")
    void getPlaceOfSupplyForDropdownCallsEntityManagerOnce() {
        // Arrange
        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class);
    }

    @Test
    @DisplayName("Should handle null result list gracefully")
    void getPlaceOfSupplyForDropdownHandlesNullResultList() {
        // Arrange
        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return UAE emirates for dropdown")
    void getPlaceOfSupplyForDropdownReturnsUAEEmirates() {
        // Arrange
        PlaceOfSupply dubai = createPlaceOfSupply(1, "Dubai", "DXB");
        PlaceOfSupply abuDhabi = createPlaceOfSupply(2, "Abu Dhabi", "AUH");
        PlaceOfSupply sharjah = createPlaceOfSupply(3, "Sharjah", "SHJ");
        PlaceOfSupply ajman = createPlaceOfSupply(4, "Ajman", "AJM");
        List<PlaceOfSupply> places = Arrays.asList(dubai, abuDhabi, sharjah, ajman);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(4);
        assertThat(result).extracting(PlaceOfSupply::getPlaceName)
            .containsExactly("Dubai", "Abu Dhabi", "Sharjah", "Ajman");
    }

    @Test
    @DisplayName("Should verify typed query class type")
    void getPlaceOfSupplyForDropdownUsesCorrectTypedQueryClass() {
        // Arrange
        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        verify(entityManager).createNamedQuery(eq("getAllPlaceOfSupplyForDropdown"), eq(PlaceOfSupply.class));
    }

    @Test
    @DisplayName("Should handle places with special characters in names")
    void getPlaceOfSupplyForDropdownHandlesSpecialCharacters() {
        // Arrange
        List<PlaceOfSupply> places = Collections.singletonList(
            createPlaceOfSupply(1, "Ra's al-Khaimah", "RAK")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlaceName()).isEqualTo("Ra's al-Khaimah");
    }

    @Test
    @DisplayName("Should handle places with long names")
    void getPlaceOfSupplyForDropdownHandlesLongNames() {
        // Arrange
        List<PlaceOfSupply> places = Collections.singletonList(
            createPlaceOfSupply(1, "Very Long Place Name For Testing Purposes", "VLPN")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlaceName()).hasSize(44);
    }

    @Test
    @DisplayName("Should return places with different IDs")
    void getPlaceOfSupplyForDropdownReturnsDifferentIds() {
        // Arrange
        PlaceOfSupply place1 = createPlaceOfSupply(10, "Dubai", "DXB");
        PlaceOfSupply place2 = createPlaceOfSupply(20, "Abu Dhabi", "AUH");
        PlaceOfSupply place3 = createPlaceOfSupply(30, "Sharjah", "SHJ");
        List<PlaceOfSupply> places = Arrays.asList(place1, place2, place3);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).extracting(PlaceOfSupply::getPlaceId)
            .containsExactly(10, 20, 30);
    }

    @Test
    @DisplayName("Should handle zero ID place")
    void getPlaceOfSupplyForDropdownHandlesZeroId() {
        // Arrange
        List<PlaceOfSupply> places = Collections.singletonList(
            createPlaceOfSupply(0, "Unknown", "UNK")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlaceId()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle places with empty string names")
    void getPlaceOfSupplyForDropdownHandlesEmptyStringNames() {
        // Arrange
        List<PlaceOfSupply> places = Collections.singletonList(
            createPlaceOfSupply(1, "", "")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlaceName()).isEmpty();
    }

    @Test
    @DisplayName("Should handle maximum integer ID")
    void getPlaceOfSupplyForDropdownHandlesMaxIntegerId() {
        // Arrange
        List<PlaceOfSupply> places = Collections.singletonList(
            createPlaceOfSupply(Integer.MAX_VALUE, "Test Place", "TST")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlaceId()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("Should return places with duplicate names but different IDs")
    void getPlaceOfSupplyForDropdownHandlesDuplicateNames() {
        // Arrange
        PlaceOfSupply place1 = createPlaceOfSupply(1, "Dubai", "DXB1");
        PlaceOfSupply place2 = createPlaceOfSupply(2, "Dubai", "DXB2");
        List<PlaceOfSupply> places = Arrays.asList(place1, place2);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(PlaceOfSupply::getPlaceName)
            .containsExactly("Dubai", "Dubai");
    }

    @Test
    @DisplayName("Should verify result list is fetched from query")
    void getPlaceOfSupplyForDropdownFetchesResultListFromQuery() {
        // Arrange
        List<PlaceOfSupply> places = createPlaceOfSupplyList(3);

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        verify(placeOfSupplyTypedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle places with whitespace in names")
    void getPlaceOfSupplyForDropdownHandlesWhitespace() {
        // Arrange
        List<PlaceOfSupply> places = Arrays.asList(
            createPlaceOfSupply(1, "  Dubai  ", "DXB"),
            createPlaceOfSupply(2, " Abu Dhabi ", "AUH")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should handle places with numeric names")
    void getPlaceOfSupplyForDropdownHandlesNumericNames() {
        // Arrange
        List<PlaceOfSupply> places = Collections.singletonList(
            createPlaceOfSupply(1, "12345", "NUM")
        );

        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(places);

        // Act
        List<PlaceOfSupply> result = placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlaceName()).isEqualTo("12345");
    }

    @Test
    @DisplayName("Should use entity manager from AbstractDao")
    void getPlaceOfSupplyForDropdownUsesEntityManagerFromAbstractDao() {
        // Arrange
        when(entityManager.createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class))
            .thenReturn(placeOfSupplyTypedQuery);
        when(placeOfSupplyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        placeOfSupplyDao.getPlaceOfSupplyForDropdown();

        // Assert
        verify(entityManager).createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class);
    }

    private List<PlaceOfSupply> createPlaceOfSupplyList(int count) {
        List<PlaceOfSupply> places = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            places.add(createPlaceOfSupply(i + 1, "Place " + (i + 1), "P" + (i + 1)));
        }
        return places;
    }

    private PlaceOfSupply createPlaceOfSupply(Integer id, String name, String code) {
        PlaceOfSupply place = new PlaceOfSupply();
        place.setPlaceId(id);
        place.setPlaceName(name);
        place.setPlaceCode(code);
        return place;
    }
}
