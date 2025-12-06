package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CountryDao;
import com.simpleaccounts.entity.Country;
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
class CountryServiceImplTest {

    @Mock
    private CountryDao countryDao;

    @InjectMocks
    private CountryServiceImpl countryService;

    private Country testCountry;
    private Country uaeCountry;
    private Country usaCountry;

    @BeforeEach
    void setUp() {
        testCountry = new Country();
        testCountry.setCountryId(1);
        testCountry.setCountryCode("AE");
        testCountry.setCountryName("United Arab Emirates");
        testCountry.setDefaultFlag(true);

        uaeCountry = new Country();
        uaeCountry.setCountryId(1);
        uaeCountry.setCountryCode("AE");
        uaeCountry.setCountryName("United Arab Emirates");
        uaeCountry.setDefaultFlag(true);

        usaCountry = new Country();
        usaCountry.setCountryId(2);
        usaCountry.setCountryCode("US");
        usaCountry.setCountryName("United States");
        usaCountry.setDefaultFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnCountryDaoWhenGetDaoCalled() {
        assertThat(countryService.getDao()).isEqualTo(countryDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(countryService.getDao()).isNotNull();
    }

    // ========== getCountries Tests ==========

    @Test
    void shouldReturnCountriesListWhenCountriesExist() {
        List<Country> expectedList = Arrays.asList(uaeCountry, usaCountry);
        when(countryDao.getCountries()).thenReturn(expectedList);

        List<Country> result = countryService.getCountries();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(uaeCountry, usaCountry);
        verify(countryDao, times(1)).getCountries();
    }

    @Test
    void shouldReturnEmptyListWhenNoCountriesExist() {
        when(countryDao.getCountries()).thenReturn(Collections.emptyList());

        List<Country> result = countryService.getCountries();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(countryDao, times(1)).getCountries();
    }

    @Test
    void shouldReturnSingleCountryWhenOnlyOneExists() {
        List<Country> expectedList = Collections.singletonList(testCountry);
        when(countryDao.getCountries()).thenReturn(expectedList);

        List<Country> result = countryService.getCountries();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCountryCode()).isEqualTo("AE");
        assertThat(result.get(0).getCountryName()).isEqualTo("United Arab Emirates");
        verify(countryDao, times(1)).getCountries();
    }

    @Test
    void shouldReturnMultipleCountriesInOrder() {
        List<Country> expectedList = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Country country = new Country();
            country.setCountryId(i);
            country.setCountryCode("C" + i);
            country.setCountryName("Country " + i);
            expectedList.add(country);
        }

        when(countryDao.getCountries()).thenReturn(expectedList);

        List<Country> result = countryService.getCountries();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        assertThat(result.get(0).getCountryName()).isEqualTo("Country 1");
        assertThat(result.get(9).getCountryName()).isEqualTo("Country 10");
        verify(countryDao, times(1)).getCountries();
    }

    @Test
    void shouldHandleNullCountriesListGracefully() {
        when(countryDao.getCountries()).thenReturn(null);

        List<Country> result = countryService.getCountries();

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountries();
    }

    // ========== getCountry Tests ==========

    @Test
    void shouldReturnCountryWhenValidIdProvided() {
        when(countryDao.getCountry(1)).thenReturn(testCountry);

        Country result = countryService.getCountry(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCountry);
        assertThat(result.getCountryId()).isEqualTo(1);
        assertThat(result.getCountryCode()).isEqualTo("AE");
        verify(countryDao, times(1)).getCountry(1);
    }

    @Test
    void shouldReturnNullWhenCountryNotFound() {
        when(countryDao.getCountry(999)).thenReturn(null);

        Country result = countryService.getCountry(999);

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountry(999);
    }

    @Test
    void shouldReturnDifferentCountriesForDifferentIds() {
        when(countryDao.getCountry(1)).thenReturn(uaeCountry);
        when(countryDao.getCountry(2)).thenReturn(usaCountry);

        Country result1 = countryService.getCountry(1);
        Country result2 = countryService.getCountry(2);

        assertThat(result1.getCountryCode()).isEqualTo("AE");
        assertThat(result2.getCountryCode()).isEqualTo("US");
        verify(countryDao, times(1)).getCountry(1);
        verify(countryDao, times(1)).getCountry(2);
    }

    @Test
    void shouldHandleNullCountryId() {
        when(countryDao.getCountry(null)).thenReturn(null);

        Country result = countryService.getCountry(null);

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountry(null);
    }

    @Test
    void shouldHandleZeroCountryId() {
        when(countryDao.getCountry(0)).thenReturn(null);

        Country result = countryService.getCountry(0);

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountry(0);
    }

    @Test
    void shouldHandleNegativeCountryId() {
        when(countryDao.getCountry(-1)).thenReturn(null);

        Country result = countryService.getCountry(-1);

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountry(-1);
    }

    // ========== getDefaultCountry Tests ==========

    @Test
    void shouldReturnDefaultCountryWhenExists() {
        when(countryDao.getDefaultCountry()).thenReturn(testCountry);

        Country result = countryService.getDefaultCountry();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCountry);
        assertThat(result.isDefaultFlag()).isTrue();
        verify(countryDao, times(1)).getDefaultCountry();
    }

    @Test
    void shouldReturnNullWhenNoDefaultCountryExists() {
        when(countryDao.getDefaultCountry()).thenReturn(null);

        Country result = countryService.getDefaultCountry();

        assertThat(result).isNull();
        verify(countryDao, times(1)).getDefaultCountry();
    }

    @Test
    void shouldReturnCountryWithDefaultFlagTrue() {
        testCountry.setDefaultFlag(true);
        when(countryDao.getDefaultCountry()).thenReturn(testCountry);

        Country result = countryService.getDefaultCountry();

        assertThat(result).isNotNull();
        assertThat(result.isDefaultFlag()).isTrue();
        verify(countryDao, times(1)).getDefaultCountry();
    }

    @Test
    void shouldCallDaoMultipleTimesForDefaultCountry() {
        when(countryDao.getDefaultCountry()).thenReturn(testCountry);

        countryService.getDefaultCountry();
        countryService.getDefaultCountry();
        countryService.getDefaultCountry();

        verify(countryDao, times(3)).getDefaultCountry();
    }

    // ========== getCountryIdByValue Tests ==========

    @Test
    void shouldReturnCountryIdWhenValidValueProvided() {
        when(countryDao.getCountryIdByValue("AE")).thenReturn(1);

        Integer result = countryService.getCountryIdByValue("AE");

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1);
        verify(countryDao, times(1)).getCountryIdByValue("AE");
    }

    @Test
    void shouldReturnNullWhenValueNotFound() {
        when(countryDao.getCountryIdByValue("INVALID")).thenReturn(null);

        Integer result = countryService.getCountryIdByValue("INVALID");

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountryIdByValue("INVALID");
    }

    @Test
    void shouldHandleNullValue() {
        when(countryDao.getCountryIdByValue(null)).thenReturn(null);

        Integer result = countryService.getCountryIdByValue(null);

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountryIdByValue(null);
    }

    @Test
    void shouldHandleEmptyStringValue() {
        when(countryDao.getCountryIdByValue("")).thenReturn(null);

        Integer result = countryService.getCountryIdByValue("");

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountryIdByValue("");
    }

    @Test
    void shouldReturnDifferentIdsForDifferentValues() {
        when(countryDao.getCountryIdByValue("AE")).thenReturn(1);
        when(countryDao.getCountryIdByValue("US")).thenReturn(2);
        when(countryDao.getCountryIdByValue("UK")).thenReturn(3);

        Integer result1 = countryService.getCountryIdByValue("AE");
        Integer result2 = countryService.getCountryIdByValue("US");
        Integer result3 = countryService.getCountryIdByValue("UK");

        assertThat(result1).isEqualTo(1);
        assertThat(result2).isEqualTo(2);
        assertThat(result3).isEqualTo(3);
        verify(countryDao, times(1)).getCountryIdByValue("AE");
        verify(countryDao, times(1)).getCountryIdByValue("US");
        verify(countryDao, times(1)).getCountryIdByValue("UK");
    }

    @Test
    void shouldHandleLowercaseValue() {
        when(countryDao.getCountryIdByValue("ae")).thenReturn(null);

        Integer result = countryService.getCountryIdByValue("ae");

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountryIdByValue("ae");
    }

    @Test
    void shouldHandleCountryNameAsValue() {
        when(countryDao.getCountryIdByValue("United Arab Emirates")).thenReturn(1);

        Integer result = countryService.getCountryIdByValue("United Arab Emirates");

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1);
        verify(countryDao, times(1)).getCountryIdByValue("United Arab Emirates");
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindCountryByPrimaryKey() {
        when(countryDao.findByPK(1)).thenReturn(testCountry);

        Country result = countryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCountry);
        assertThat(result.getCountryId()).isEqualTo(1);
        verify(countryDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenCountryNotFoundByPK() {
        when(countryDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> countryService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(countryDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewCountry() {
        countryService.persist(testCountry);

        verify(countryDao, times(1)).persist(testCountry);
    }

    @Test
    void shouldUpdateExistingCountry() {
        when(countryDao.update(testCountry)).thenReturn(testCountry);

        Country result = countryService.update(testCountry);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCountry);
        verify(countryDao, times(1)).update(testCountry);
    }

    @Test
    void shouldUpdateCountryAndReturnUpdatedEntity() {
        testCountry.setCountryName("Updated Country Name");
        when(countryDao.update(testCountry)).thenReturn(testCountry);

        Country result = countryService.update(testCountry);

        assertThat(result).isNotNull();
        assertThat(result.getCountryName()).isEqualTo("Updated Country Name");
        verify(countryDao, times(1)).update(testCountry);
    }

    @Test
    void shouldDeleteCountry() {
        countryService.delete(testCountry);

        verify(countryDao, times(1)).delete(testCountry);
    }

    @Test
    void shouldFindCountriesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("countryCode", "AE");

        List<Country> expectedList = Arrays.asList(testCountry);
        when(countryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Country> result = countryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testCountry);
        verify(countryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("countryCode", "XX");

        when(countryDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Country> result = countryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(countryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<Country> result = countryService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(countryDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<Country> result = countryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(countryDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleCountriesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("defaultFlag", false);

        List<Country> expectedList = Arrays.asList(usaCountry);
        when(countryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Country> result = countryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(countryDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleCountryWithNullCode() {
        Country countryWithNullCode = new Country();
        countryWithNullCode.setCountryId(5);
        countryWithNullCode.setCountryCode(null);
        countryWithNullCode.setCountryName("Country Without Code");

        when(countryDao.findByPK(5)).thenReturn(countryWithNullCode);

        Country result = countryService.findByPK(5);

        assertThat(result).isNotNull();
        assertThat(result.getCountryCode()).isNull();
        verify(countryDao, times(1)).findByPK(5);
    }

    @Test
    void shouldHandleCountryWithNullName() {
        Country countryWithNullName = new Country();
        countryWithNullName.setCountryId(6);
        countryWithNullName.setCountryCode("XX");
        countryWithNullName.setCountryName(null);

        when(countryDao.findByPK(6)).thenReturn(countryWithNullName);

        Country result = countryService.findByPK(6);

        assertThat(result).isNotNull();
        assertThat(result.getCountryName()).isNull();
        verify(countryDao, times(1)).findByPK(6);
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        Country country1 = new Country();
        Country country2 = new Country();
        Country country3 = new Country();

        countryService.persist(country1);
        countryService.persist(country2);
        countryService.persist(country3);

        verify(countryDao, times(3)).persist(any(Country.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(countryDao.update(any(Country.class))).thenReturn(testCountry);

        countryService.update(testCountry);
        countryService.update(testCountry);
        countryService.update(testCountry);

        verify(countryDao, times(3)).update(testCountry);
    }

    @Test
    void shouldVerifyDaoInteractionForGetCountries() {
        List<Country> expectedList = Arrays.asList(testCountry);
        when(countryDao.getCountries()).thenReturn(expectedList);

        countryService.getCountries();
        countryService.getCountries();

        verify(countryDao, times(2)).getCountries();
    }

    @Test
    void shouldHandleLargeListOfCountries() {
        List<Country> largeList = new ArrayList<>();
        for (int i = 1; i <= 200; i++) {
            Country country = new Country();
            country.setCountryId(i);
            country.setCountryCode("C" + i);
            country.setCountryName("Country " + i);
            largeList.add(country);
        }

        when(countryDao.getCountries()).thenReturn(largeList);

        List<Country> result = countryService.getCountries();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(200);
        assertThat(result.get(0).getCountryId()).isEqualTo(1);
        assertThat(result.get(199).getCountryId()).isEqualTo(200);
        verify(countryDao, times(1)).getCountries();
    }

    @Test
    void shouldHandleCountryWithSpecialCharactersInName() {
        Country specialCountry = new Country();
        specialCountry.setCountryId(7);
        specialCountry.setCountryCode("CI");
        specialCountry.setCountryName("Côte d'Ivoire");

        when(countryDao.findByPK(7)).thenReturn(specialCountry);

        Country result = countryService.findByPK(7);

        assertThat(result).isNotNull();
        assertThat(result.getCountryName()).isEqualTo("Côte d'Ivoire");
        verify(countryDao, times(1)).findByPK(7);
    }

    @Test
    void shouldHandleMaxIntegerCountryId() {
        when(countryDao.getCountry(Integer.MAX_VALUE)).thenReturn(null);

        Country result = countryService.getCountry(Integer.MAX_VALUE);

        assertThat(result).isNull();
        verify(countryDao, times(1)).getCountry(Integer.MAX_VALUE);
    }

    @Test
    void shouldHandleCountryValueWithSpecialCharacters() {
        when(countryDao.getCountryIdByValue("Côte d'Ivoire")).thenReturn(7);

        Integer result = countryService.getCountryIdByValue("Côte d'Ivoire");

        assertThat(result).isEqualTo(7);
        verify(countryDao, times(1)).getCountryIdByValue("Côte d'Ivoire");
    }
}
