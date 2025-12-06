package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Country;
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
@DisplayName("CountryDaoImpl Unit Tests")
class CountryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Country> typedQuery;

    @Mock
    private TypedQuery<Integer> integerTypedQuery;

    @InjectMocks
    private CountryDaoImpl countryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(countryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(countryDao, "entityClass", Country.class);
    }

    @Test
    @DisplayName("Should return list of all countries")
    void getCountriesReturnsAllCountries() {
        // Arrange
        List<Country> expectedCountries = createCountryList(5);

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCountries);

        // Act
        List<Country> result = countryDao.getCountries();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedCountries);
    }

    @Test
    @DisplayName("Should return empty list when no countries exist")
    void getCountriesReturnsEmptyListWhenNoCountries() {
        // Arrange
        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Country> result = countryDao.getCountries();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use allCountries named query")
    void getCountriesUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        countryDao.getCountries();

        // Assert
        verify(entityManager).createNamedQuery("allCountries", Country.class);
    }

    @Test
    @DisplayName("Should return country by ID when it exists")
    void getCountryReturnsCountryById() {
        // Arrange
        Integer countryId = 1;
        Country expectedCountry = createCountry(countryId, "United Arab Emirates", "AE");

        when(entityManager.find(Country.class, countryId))
            .thenReturn(expectedCountry);

        // Act
        Country result = countryDao.getCountry(countryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCountryId()).isEqualTo(countryId);
        assertThat(result.getCountryName()).isEqualTo("United Arab Emirates");
    }

    @Test
    @DisplayName("Should return null when country not found by ID")
    void getCountryReturnsNullWhenNotFound() {
        // Arrange
        Integer countryId = 999;

        when(entityManager.find(Country.class, countryId))
            .thenReturn(null);

        // Act
        Country result = countryDao.getCountry(countryId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should call findByPK through entityManager find")
    void getCountryCallsEntityManagerFind() {
        // Arrange
        Integer countryId = 5;
        Country country = createCountry(countryId, "India", "IN");

        when(entityManager.find(Country.class, countryId))
            .thenReturn(country);

        // Act
        countryDao.getCountry(countryId);

        // Assert
        verify(entityManager).find(Country.class, countryId);
    }

    @Test
    @DisplayName("Should return default country as first in list")
    void getDefaultCountryReturnsFirstCountry() {
        // Arrange
        Country firstCountry = createCountry(1, "UAE", "AE");
        Country secondCountry = createCountry(2, "USA", "US");
        List<Country> countries = Arrays.asList(firstCountry, secondCountry);

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(countries);

        // Act
        Country result = countryDao.getDefaultCountry();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(firstCountry);
        assertThat(result.getCountryId()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return null when no countries exist for default")
    void getDefaultCountryReturnsNullWhenEmpty() {
        // Arrange
        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Country result = countryDao.getDefaultCountry();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when countries list is null for default")
    void getDefaultCountryReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        Country result = countryDao.getDefaultCountry();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return country ID by input value when found")
    void getCountryIdByValueReturnsIdWhenFound() {
        // Arrange
        String value = "United Arab Emirates";
        Integer expectedId = 1;

        when(entityManager.createNamedQuery("getCountryIdByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(expectedId);

        // Act
        Integer result = countryDao.getCountryIdByValue(value);

        // Assert
        assertThat(result).isEqualTo(expectedId);
    }

    @Test
    @DisplayName("Should return null when country ID not found by value")
    void getCountryIdByValueReturnsNullWhenNotFound() {
        // Arrange
        String value = "NonexistentCountry";

        when(entityManager.createNamedQuery("getCountryIdByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(null);

        // Act
        Integer result = countryDao.getCountryIdByValue(value);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should use named query for getting country ID by value")
    void getCountryIdByValueUsesNamedQuery() {
        // Arrange
        String value = "India";

        when(entityManager.createNamedQuery("getCountryIdByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(1);

        // Act
        countryDao.getCountryIdByValue(value);

        // Assert
        verify(entityManager).createNamedQuery("getCountryIdByInputColoumnValue", Integer.class);
    }

    @Test
    @DisplayName("Should set max results to 1 when getting country ID by value")
    void getCountryIdByValueSetsMaxResults() {
        // Arrange
        String value = "Pakistan";

        when(entityManager.createNamedQuery("getCountryIdByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(3);

        // Act
        countryDao.getCountryIdByValue(value);

        // Assert
        verify(integerTypedQuery).setMaxResults(1);
    }

    @Test
    @DisplayName("Should handle single country in list")
    void getCountriesHandlesSingleCountry() {
        // Arrange
        List<Country> countries = Collections.singletonList(
            createCountry(1, "UAE", "AE")
        );

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(countries);

        // Act
        List<Country> result = countryDao.getCountries();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCountryName()).isEqualTo("UAE");
    }

    @Test
    @DisplayName("Should return single country as default when only one exists")
    void getDefaultCountryReturnsSingleCountry() {
        // Arrange
        Country country = createCountry(1, "UAE", "AE");
        List<Country> countries = Collections.singletonList(country);

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(countries);

        // Act
        Country result = countryDao.getDefaultCountry();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(country);
    }

    @Test
    @DisplayName("Should handle large list of countries")
    void getCountriesHandlesLargeList() {
        // Arrange
        List<Country> countries = createCountryList(200);

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(countries);

        // Act
        List<Country> result = countryDao.getCountries();

        // Assert
        assertThat(result).hasSize(200);
    }

    @Test
    @DisplayName("Should return countries with correct codes")
    void getCountriesReturnsCorrectCodes() {
        // Arrange
        Country country1 = createCountry(1, "UAE", "AE");
        Country country2 = createCountry(2, "USA", "US");
        List<Country> countries = Arrays.asList(country1, country2);

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(countries);

        // Act
        List<Country> result = countryDao.getCountries();

        // Assert
        assertThat(result.get(0).getCountryCode()).isEqualTo("AE");
        assertThat(result.get(1).getCountryCode()).isEqualTo("US");
    }

    @Test
    @DisplayName("Should handle zero ID for country lookup")
    void getCountryHandlesZeroId() {
        // Arrange
        Integer countryId = 0;

        when(entityManager.find(Country.class, countryId))
            .thenReturn(null);

        // Act
        Country result = countryDao.getCountry(countryId);

        // Assert
        assertThat(result).isNull();
        verify(entityManager).find(Country.class, countryId);
    }

    @Test
    @DisplayName("Should handle negative ID for country lookup")
    void getCountryHandlesNegativeId() {
        // Arrange
        Integer countryId = -1;

        when(entityManager.find(Country.class, countryId))
            .thenReturn(null);

        // Act
        Country result = countryDao.getCountry(countryId);

        // Assert
        assertThat(result).isNull();
        verify(entityManager).find(Country.class, countryId);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls to getCountries")
    void getCountriesReturnsConsistentResults() {
        // Arrange
        List<Country> countries = createCountryList(5);

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(countries);

        // Act
        List<Country> result1 = countryDao.getCountries();
        List<Country> result2 = countryDao.getCountries();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should return same country instance for same ID")
    void getCountryReturnsSameInstanceForSameId() {
        // Arrange
        Integer countryId = 5;
        Country country = createCountry(countryId, "Canada", "CA");

        when(entityManager.find(Country.class, countryId))
            .thenReturn(country);

        // Act
        Country result1 = countryDao.getCountry(countryId);
        Country result2 = countryDao.getCountry(countryId);

        // Assert
        assertThat(result1).isSameAs(result2);
    }

    @Test
    @DisplayName("Should handle special characters in country value search")
    void getCountryIdByValueHandlesSpecialCharacters() {
        // Arrange
        String value = "Côte d'Ivoire";
        Integer expectedId = 10;

        when(entityManager.createNamedQuery("getCountryIdByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(expectedId);

        // Act
        Integer result = countryDao.getCountryIdByValue(value);

        // Assert
        assertThat(result).isEqualTo(expectedId);
        verify(integerTypedQuery).setParameter("val", value);
    }

    @Test
    @DisplayName("Should handle empty string value for country ID search")
    void getCountryIdByValueHandlesEmptyString() {
        // Arrange
        String value = "";

        when(entityManager.createNamedQuery("getCountryIdByInputColoumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", value))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(null);

        // Act
        Integer result = countryDao.getCountryIdByValue(value);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should verify entity manager interaction for getCountries")
    void getCountriesVerifiesEntityManagerInteraction() {
        // Arrange
        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        countryDao.getCountries();

        // Assert
        verify(entityManager).createNamedQuery("allCountries", Country.class);
        verify(typedQuery).getResultList();
    }

    @Test
    @DisplayName("Should call getCountries when getting default country")
    void getDefaultCountryCallsGetCountries() {
        // Arrange
        List<Country> countries = createCountryList(3);

        when(entityManager.createNamedQuery("allCountries", Country.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(countries);

        // Act
        countryDao.getDefaultCountry();

        // Assert
        verify(entityManager).createNamedQuery("allCountries", Country.class);
    }

    private List<Country> createCountryList(int count) {
        List<Country> countries = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            countries.add(createCountry(i + 1, "Country" + (i + 1), "C" + (i + 1)));
        }
        return countries;
    }

    private Country createCountry(int id, String name, String code) {
        Country country = new Country();
        country.setCountryId(id);
        country.setCountryName(name);
        country.setCountryCode(code);
        return country;
    }
}
