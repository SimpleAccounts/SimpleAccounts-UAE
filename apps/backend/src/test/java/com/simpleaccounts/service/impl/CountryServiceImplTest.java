package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CountryDao;
import com.simpleaccounts.entity.Country;
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
@DisplayName("CountryServiceImpl Unit Tests")
class CountryServiceImplTest {

  @Mock private CountryDao countryDao;

  @InjectMocks private CountryServiceImpl countryService;

  @Test
  @DisplayName("Should return all countries")
  void getCountriesReturnsList() {
    List<Country> expectedCountries =
        Arrays.asList(
            createCountry(1, "United Arab Emirates", "ARE"),
            createCountry(2, "United States", "USA"));

    when(countryDao.getCountries()).thenReturn(expectedCountries);

    List<Country> result = countryService.getCountries();

    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
    verify(countryDao).getCountries();
  }

  @Test
  @DisplayName("Should return empty list when no countries")
  void getCountriesReturnsEmptyList() {
    when(countryDao.getCountries()).thenReturn(Collections.emptyList());

    List<Country> result = countryService.getCountries();

    assertThat(result).isNotNull();
    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should return country by code")
  void getCountryReturnsCountry() {
    Country expectedCountry = createCountry(1, "United Arab Emirates", "ARE");

    when(countryDao.getCountry(1)).thenReturn(expectedCountry);

    Country result = countryService.getCountry(1);

    assertThat(result).isNotNull();
    assertThat(result.getCountryName()).isEqualTo("United Arab Emirates");
  }

  @Test
  @DisplayName("Should return default country")
  void getDefaultCountryReturnsCountry() {
    Country expectedCountry = createCountry(1, "United Arab Emirates", "ARE");

    when(countryDao.getDefaultCountry()).thenReturn(expectedCountry);

    Country result = countryService.getDefaultCountry();

    assertThat(result).isNotNull();
    assertThat(result.getCountryName()).isEqualTo("United Arab Emirates");
  }

  private Country createCountry(int code, String name, String isoAlpha3) {
    Country country = new Country();
    country.setCountryCode(code);
    country.setCountryName(name);
    country.setIsoAlpha3Code(isoAlpha3);
    return country;
  }
}
