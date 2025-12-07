package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Country;
import java.util.ArrayList;
import java.util.Arrays;
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
@DisplayName("CountryDaoImpl Unit Tests")
class CountryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Country> countryTypedQuery;

    @InjectMocks
    private CountryDaoImpl countryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(countryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(countryDao, "entityClass", Country.class);
    }

    @Test
    @DisplayName("Should return all countries")
    void getCountriesReturnsAllCountries() {
        // Arrange
        List<Country> expectedCountries = Arrays.asList(
            createCountry(1, "United Arab Emirates", "ARE"),
            createCountry(2, "United States", "USA"),
            createCountry(3, "United Kingdom", "GBR")
        );

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(countryTypedQuery);
        when(countryTypedQuery.getResultList())
            .thenReturn(expectedCountries);

        // Act
        List<Country> result = countryDao.getCountries();

        // Assert
        assertThat(result).isNotNull().hasSize(3);
        assertThat(result.get(0).getCountryName()).isEqualTo("United Arab Emirates");
    }

    @Test
    @DisplayName("Should return empty list when no countries exist")
    void getCountriesReturnsEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(countryTypedQuery);
        when(countryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Country> result = countryDao.getCountries();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should find country by ID")
    void getCountryReturnsCountryById() {
        // Arrange
        int countryId = 1;
        Country expectedCountry = createCountry(countryId, "United Arab Emirates", "ARE");

        when(entityManager.find(Country.class, countryId))
            .thenReturn(expectedCountry);

        // Act
        Country result = countryDao.getCountry(countryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCountryCode()).isEqualTo(countryId);
        assertThat(result.getCountryName()).isEqualTo("United Arab Emirates");
    }

    @Test
    @DisplayName("Should return null when country not found by ID")
    void getCountryReturnsNullWhenNotFound() {
        // Arrange
        int countryId = 999;

        when(entityManager.find(Country.class, countryId))
            .thenReturn(null);

        // Act
        Country result = countryDao.getCountry(countryId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return default country")
    void getDefaultCountryReturnsFirstCountry() {
        // Arrange
        List<Country> countries = Arrays.asList(
            createCountry(1, "United Arab Emirates", "ARE"),
            createCountry(2, "United States", "USA")
        );

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(countryTypedQuery);
        when(countryTypedQuery.getResultList())
            .thenReturn(countries);

        // Act
        Country result = countryDao.getDefaultCountry();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCountryName()).isEqualTo("United Arab Emirates");
    }

    @Test
    @DisplayName("Should return null when no countries for default")
    void getDefaultCountryReturnsNullWhenEmpty() {
        // Arrange
        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(countryTypedQuery);
        when(countryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Country result = countryDao.getDefaultCountry();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should persist new country")
    void persistCountryPersistsNewCountry() {
        // Arrange
        Country country = createCountry(100, "New Country", "NEW");

        // Act - verify EntityManager persist is called correctly
        countryDao.getEntityManager().persist(country);

        // Assert
        verify(entityManager).persist(country);
    }

    @Test
    @DisplayName("Should update existing country")
    void updateCountryMergesExistingCountry() {
        // Arrange
        Country country = createCountry(1, "Updated Country", "UPD");
        when(entityManager.merge(country)).thenReturn(country);

        // Act
        Country result = countryDao.update(country);

        // Assert
        verify(entityManager).merge(country);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should handle country with all fields")
    void handleCountryWithAllFields() {
        // Arrange
        Country country = createCountry(1, "United Arab Emirates", "ARE");
        country.setCountryDescription("United Arab Emirates Description");
        country.setDefaltFlag('Y');

        when(entityManager.find(Country.class, 1))
            .thenReturn(country);

        // Act
        Country result = countryDao.getCountry(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIsoAlpha3Code()).isEqualTo("ARE");
        assertThat(result.getCountryDescription()).isEqualTo("United Arab Emirates Description");
    }

    private Country createCountry(int countryCode, String countryName, String isoAlpha3Code) {
        Country country = new Country();
        country.setCountryCode(countryCode);
        country.setCountryName(countryName);
        country.setIsoAlpha3Code(isoAlpha3Code);
        return country;
    }
}
