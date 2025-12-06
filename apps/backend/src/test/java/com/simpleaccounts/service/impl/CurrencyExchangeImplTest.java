package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CurrencyExchangeDao;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
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
class CurrencyExchangeImplTest {

    @Mock
    private CurrencyExchangeDao currencyExchangeDao;

    @InjectMocks
    private CurrencyExchangeImpl currencyExchangeService;

    private CurrencyConversion testConversion;
    private CurrencyConversion aedToUsdConversion;
    private CurrencyConversion aedToEurConversion;

    @BeforeEach
    void setUp() {
        testConversion = new CurrencyConversion();
        testConversion.setCurrencyConversionId(1);
        testConversion.setCurrencyCode("AED");
        testConversion.setCurrencyCodeConvertedTo("USD");
        testConversion.setExchangeRate(BigDecimal.valueOf(0.272));
        testConversion.setCreatedDate(LocalDateTime.now());
        testConversion.setDeleteFlag(false);
        testConversion.setActiveFlag(true);

        aedToUsdConversion = new CurrencyConversion();
        aedToUsdConversion.setCurrencyConversionId(1);
        aedToUsdConversion.setCurrencyCode("AED");
        aedToUsdConversion.setCurrencyCodeConvertedTo("USD");
        aedToUsdConversion.setExchangeRate(BigDecimal.valueOf(0.272));
        aedToUsdConversion.setActiveFlag(true);

        aedToEurConversion = new CurrencyConversion();
        aedToEurConversion.setCurrencyConversionId(2);
        aedToEurConversion.setCurrencyCode("AED");
        aedToEurConversion.setCurrencyCodeConvertedTo("EUR");
        aedToEurConversion.setExchangeRate(BigDecimal.valueOf(0.251));
        aedToEurConversion.setActiveFlag(true);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnCurrencyExchangeDaoWhenGetDaoCalled() {
        assertThat(currencyExchangeService.getDao()).isEqualTo(currencyExchangeDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(currencyExchangeService.getDao()).isNotNull();
    }

    // ========== getExchangeRate Tests ==========

    @Test
    void shouldReturnExchangeRateWhenValidCurrencyCodeProvided() {
        when(currencyExchangeDao.getExchangeRate(1)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.getExchangeRate(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testConversion);
        assertThat(result.getCurrencyCode()).isEqualTo("AED");
        assertThat(result.getCurrencyCodeConvertedTo()).isEqualTo("USD");
        assertThat(result.getExchangeRate()).isEqualTo(BigDecimal.valueOf(0.272));
        verify(currencyExchangeDao, times(1)).getExchangeRate(1);
    }

    @Test
    void shouldReturnNullWhenCurrencyCodeNotFound() {
        when(currencyExchangeDao.getExchangeRate(999)).thenReturn(null);

        CurrencyConversion result = currencyExchangeService.getExchangeRate(999);

        assertThat(result).isNull();
        verify(currencyExchangeDao, times(1)).getExchangeRate(999);
    }

    @Test
    void shouldHandleNullCurrencyCode() {
        when(currencyExchangeDao.getExchangeRate(null)).thenReturn(null);

        CurrencyConversion result = currencyExchangeService.getExchangeRate(null);

        assertThat(result).isNull();
        verify(currencyExchangeDao, times(1)).getExchangeRate(null);
    }

    @Test
    void shouldHandleZeroCurrencyCode() {
        when(currencyExchangeDao.getExchangeRate(0)).thenReturn(null);

        CurrencyConversion result = currencyExchangeService.getExchangeRate(0);

        assertThat(result).isNull();
        verify(currencyExchangeDao, times(1)).getExchangeRate(0);
    }

    @Test
    void shouldHandleNegativeCurrencyCode() {
        when(currencyExchangeDao.getExchangeRate(-1)).thenReturn(null);

        CurrencyConversion result = currencyExchangeService.getExchangeRate(-1);

        assertThat(result).isNull();
        verify(currencyExchangeDao, times(1)).getExchangeRate(-1);
    }

    @Test
    void shouldReturnDifferentExchangeRatesForDifferentCurrencies() {
        when(currencyExchangeDao.getExchangeRate(1)).thenReturn(aedToUsdConversion);
        when(currencyExchangeDao.getExchangeRate(2)).thenReturn(aedToEurConversion);

        CurrencyConversion result1 = currencyExchangeService.getExchangeRate(1);
        CurrencyConversion result2 = currencyExchangeService.getExchangeRate(2);

        assertThat(result1.getCurrencyCodeConvertedTo()).isEqualTo("USD");
        assertThat(result2.getCurrencyCodeConvertedTo()).isEqualTo("EUR");
        assertThat(result1.getExchangeRate()).isEqualTo(BigDecimal.valueOf(0.272));
        assertThat(result2.getExchangeRate()).isEqualTo(BigDecimal.valueOf(0.251));
        verify(currencyExchangeDao, times(1)).getExchangeRate(1);
        verify(currencyExchangeDao, times(1)).getExchangeRate(2);
    }

    @Test
    void shouldHandleMultipleGetExchangeRateCalls() {
        when(currencyExchangeDao.getExchangeRate(1)).thenReturn(testConversion);

        currencyExchangeService.getExchangeRate(1);
        currencyExchangeService.getExchangeRate(1);
        currencyExchangeService.getExchangeRate(1);

        verify(currencyExchangeDao, times(3)).getExchangeRate(1);
    }

    // ========== getCurrencyConversionList Tests ==========

    @Test
    void shouldReturnCurrencyConversionListWhenConversionsExist() {
        List<CurrencyConversion> expectedList = Arrays.asList(aedToUsdConversion, aedToEurConversion);
        when(currencyExchangeDao.getCurrencyConversionList()).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.getCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(aedToUsdConversion, aedToEurConversion);
        verify(currencyExchangeDao, times(1)).getCurrencyConversionList();
    }

    @Test
    void shouldReturnEmptyListWhenNoConversionsExist() {
        when(currencyExchangeDao.getCurrencyConversionList()).thenReturn(Collections.emptyList());

        List<CurrencyConversion> result = currencyExchangeService.getCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(currencyExchangeDao, times(1)).getCurrencyConversionList();
    }

    @Test
    void shouldReturnSingleConversionWhenOnlyOneExists() {
        List<CurrencyConversion> expectedList = Collections.singletonList(testConversion);
        when(currencyExchangeDao.getCurrencyConversionList()).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.getCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCurrencyCode()).isEqualTo("AED");
        verify(currencyExchangeDao, times(1)).getCurrencyConversionList();
    }

    @Test
    void shouldHandleNullCurrencyConversionList() {
        when(currencyExchangeDao.getCurrencyConversionList()).thenReturn(null);

        List<CurrencyConversion> result = currencyExchangeService.getCurrencyConversionList();

        assertThat(result).isNull();
        verify(currencyExchangeDao, times(1)).getCurrencyConversionList();
    }

    @Test
    void shouldReturnLargeCurrencyConversionList() {
        List<CurrencyConversion> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            CurrencyConversion conversion = new CurrencyConversion();
            conversion.setCurrencyConversionId(i);
            conversion.setCurrencyCode("AED");
            conversion.setCurrencyCodeConvertedTo("CURR" + i);
            conversion.setExchangeRate(BigDecimal.valueOf(i * 0.1));
            largeList.add(conversion);
        }

        when(currencyExchangeDao.getCurrencyConversionList()).thenReturn(largeList);

        List<CurrencyConversion> result = currencyExchangeService.getCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getCurrencyConversionId()).isEqualTo(1);
        assertThat(result.get(49).getCurrencyConversionId()).isEqualTo(50);
        verify(currencyExchangeDao, times(1)).getCurrencyConversionList();
    }

    @Test
    void shouldCallDaoMultipleTimesForCurrencyConversionList() {
        List<CurrencyConversion> expectedList = Arrays.asList(testConversion);
        when(currencyExchangeDao.getCurrencyConversionList()).thenReturn(expectedList);

        currencyExchangeService.getCurrencyConversionList();
        currencyExchangeService.getCurrencyConversionList();

        verify(currencyExchangeDao, times(2)).getCurrencyConversionList();
    }

    // ========== getActiveCurrencyConversionList Tests ==========

    @Test
    void shouldReturnActiveCurrencyConversionListWhenActiveConversionsExist() {
        List<CurrencyConversion> expectedList = Arrays.asList(aedToUsdConversion, aedToEurConversion);
        when(currencyExchangeDao.getActiveCurrencyConversionList()).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.getActiveCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(aedToUsdConversion, aedToEurConversion);
        assertThat(result.get(0).isActiveFlag()).isTrue();
        assertThat(result.get(1).isActiveFlag()).isTrue();
        verify(currencyExchangeDao, times(1)).getActiveCurrencyConversionList();
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveConversionsExist() {
        when(currencyExchangeDao.getActiveCurrencyConversionList()).thenReturn(Collections.emptyList());

        List<CurrencyConversion> result = currencyExchangeService.getActiveCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(currencyExchangeDao, times(1)).getActiveCurrencyConversionList();
    }

    @Test
    void shouldReturnSingleActiveConversionWhenOnlyOneActive() {
        List<CurrencyConversion> expectedList = Collections.singletonList(testConversion);
        when(currencyExchangeDao.getActiveCurrencyConversionList()).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.getActiveCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).isActiveFlag()).isTrue();
        verify(currencyExchangeDao, times(1)).getActiveCurrencyConversionList();
    }

    @Test
    void shouldHandleNullActiveCurrencyConversionList() {
        when(currencyExchangeDao.getActiveCurrencyConversionList()).thenReturn(null);

        List<CurrencyConversion> result = currencyExchangeService.getActiveCurrencyConversionList();

        assertThat(result).isNull();
        verify(currencyExchangeDao, times(1)).getActiveCurrencyConversionList();
    }

    @Test
    void shouldReturnOnlyActiveConversionsNotInactive() {
        CurrencyConversion inactiveConversion = new CurrencyConversion();
        inactiveConversion.setCurrencyConversionId(3);
        inactiveConversion.setActiveFlag(false);

        List<CurrencyConversion> expectedList = Arrays.asList(aedToUsdConversion, aedToEurConversion);
        when(currencyExchangeDao.getActiveCurrencyConversionList()).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.getActiveCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).doesNotContain(inactiveConversion);
        verify(currencyExchangeDao, times(1)).getActiveCurrencyConversionList();
    }

    @Test
    void shouldCallDaoMultipleTimesForActiveCurrencyConversionList() {
        List<CurrencyConversion> expectedList = Arrays.asList(testConversion);
        when(currencyExchangeDao.getActiveCurrencyConversionList()).thenReturn(expectedList);

        currencyExchangeService.getActiveCurrencyConversionList();
        currencyExchangeService.getActiveCurrencyConversionList();
        currencyExchangeService.getActiveCurrencyConversionList();

        verify(currencyExchangeDao, times(3)).getActiveCurrencyConversionList();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindCurrencyConversionByPrimaryKey() {
        when(currencyExchangeDao.findByPK(1)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testConversion);
        assertThat(result.getCurrencyConversionId()).isEqualTo(1);
        verify(currencyExchangeDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenCurrencyConversionNotFoundByPK() {
        when(currencyExchangeDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> currencyExchangeService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(currencyExchangeDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewCurrencyConversion() {
        currencyExchangeService.persist(testConversion);

        verify(currencyExchangeDao, times(1)).persist(testConversion);
    }

    @Test
    void shouldUpdateExistingCurrencyConversion() {
        when(currencyExchangeDao.update(testConversion)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.update(testConversion);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testConversion);
        verify(currencyExchangeDao, times(1)).update(testConversion);
    }

    @Test
    void shouldUpdateCurrencyConversionAndReturnUpdatedEntity() {
        testConversion.setExchangeRate(BigDecimal.valueOf(0.280));
        when(currencyExchangeDao.update(testConversion)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.update(testConversion);

        assertThat(result).isNotNull();
        assertThat(result.getExchangeRate()).isEqualTo(BigDecimal.valueOf(0.280));
        verify(currencyExchangeDao, times(1)).update(testConversion);
    }

    @Test
    void shouldDeleteCurrencyConversion() {
        currencyExchangeService.delete(testConversion);

        verify(currencyExchangeDao, times(1)).delete(testConversion);
    }

    @Test
    void shouldFindCurrencyConversionsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("currencyCode", "AED");

        List<CurrencyConversion> expectedList = Arrays.asList(testConversion);
        when(currencyExchangeDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testConversion);
        verify(currencyExchangeDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("currencyCode", "INVALID");

        when(currencyExchangeDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<CurrencyConversion> result = currencyExchangeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(currencyExchangeDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<CurrencyConversion> result = currencyExchangeService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(currencyExchangeDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<CurrencyConversion> result = currencyExchangeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(currencyExchangeDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleCurrencyConversionsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("currencyCode", "AED");
        attributes.put("activeFlag", true);

        List<CurrencyConversion> expectedList = Arrays.asList(aedToUsdConversion, aedToEurConversion);
        when(currencyExchangeDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(currencyExchangeDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleConversionWithNullExchangeRate() {
        CurrencyConversion conversionWithNullRate = new CurrencyConversion();
        conversionWithNullRate.setCurrencyConversionId(5);
        conversionWithNullRate.setCurrencyCode("AED");
        conversionWithNullRate.setCurrencyCodeConvertedTo("GBP");
        conversionWithNullRate.setExchangeRate(null);

        when(currencyExchangeDao.findByPK(5)).thenReturn(conversionWithNullRate);

        CurrencyConversion result = currencyExchangeService.findByPK(5);

        assertThat(result).isNotNull();
        assertThat(result.getExchangeRate()).isNull();
        verify(currencyExchangeDao, times(1)).findByPK(5);
    }

    @Test
    void shouldHandleConversionWithZeroExchangeRate() {
        testConversion.setExchangeRate(BigDecimal.ZERO);
        when(currencyExchangeDao.update(testConversion)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.update(testConversion);

        assertThat(result).isNotNull();
        assertThat(result.getExchangeRate()).isEqualTo(BigDecimal.ZERO);
        verify(currencyExchangeDao, times(1)).update(testConversion);
    }

    @Test
    void shouldHandleConversionWithVeryHighExchangeRate() {
        testConversion.setExchangeRate(BigDecimal.valueOf(1000000.999999));
        when(currencyExchangeDao.update(testConversion)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.update(testConversion);

        assertThat(result).isNotNull();
        assertThat(result.getExchangeRate()).isEqualTo(BigDecimal.valueOf(1000000.999999));
        verify(currencyExchangeDao, times(1)).update(testConversion);
    }

    @Test
    void shouldHandleConversionWithVeryLowExchangeRate() {
        testConversion.setExchangeRate(BigDecimal.valueOf(0.000001));
        when(currencyExchangeDao.update(testConversion)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.update(testConversion);

        assertThat(result).isNotNull();
        assertThat(result.getExchangeRate()).isEqualTo(BigDecimal.valueOf(0.000001));
        verify(currencyExchangeDao, times(1)).update(testConversion);
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        CurrencyConversion conversion1 = new CurrencyConversion();
        CurrencyConversion conversion2 = new CurrencyConversion();
        CurrencyConversion conversion3 = new CurrencyConversion();

        currencyExchangeService.persist(conversion1);
        currencyExchangeService.persist(conversion2);
        currencyExchangeService.persist(conversion3);

        verify(currencyExchangeDao, times(3)).persist(any(CurrencyConversion.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(currencyExchangeDao.update(any(CurrencyConversion.class))).thenReturn(testConversion);

        currencyExchangeService.update(testConversion);
        currencyExchangeService.update(testConversion);
        currencyExchangeService.update(testConversion);

        verify(currencyExchangeDao, times(3)).update(testConversion);
    }

    @Test
    void shouldHandleConversionWithNullCurrencyCode() {
        CurrencyConversion conversionWithNullCode = new CurrencyConversion();
        conversionWithNullCode.setCurrencyConversionId(6);
        conversionWithNullCode.setCurrencyCode(null);
        conversionWithNullCode.setCurrencyCodeConvertedTo("USD");

        when(currencyExchangeDao.findByPK(6)).thenReturn(conversionWithNullCode);

        CurrencyConversion result = currencyExchangeService.findByPK(6);

        assertThat(result).isNotNull();
        assertThat(result.getCurrencyCode()).isNull();
        verify(currencyExchangeDao, times(1)).findByPK(6);
    }

    @Test
    void shouldHandleConversionWithNullConvertedToCurrency() {
        CurrencyConversion conversionWithNullConverted = new CurrencyConversion();
        conversionWithNullConverted.setCurrencyConversionId(7);
        conversionWithNullConverted.setCurrencyCode("AED");
        conversionWithNullConverted.setCurrencyCodeConvertedTo(null);

        when(currencyExchangeDao.findByPK(7)).thenReturn(conversionWithNullConverted);

        CurrencyConversion result = currencyExchangeService.findByPK(7);

        assertThat(result).isNotNull();
        assertThat(result.getCurrencyCodeConvertedTo()).isNull();
        verify(currencyExchangeDao, times(1)).findByPK(7);
    }

    @Test
    void shouldHandleConversionWithDeleteFlag() {
        testConversion.setDeleteFlag(true);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("deleteFlag", true);

        List<CurrencyConversion> expectedList = Arrays.asList(testConversion);
        when(currencyExchangeDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CurrencyConversion> result = currencyExchangeService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).isDeleteFlag()).isTrue();
        verify(currencyExchangeDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleConversionWithInactiveFlag() {
        testConversion.setActiveFlag(false);
        when(currencyExchangeDao.update(testConversion)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.update(testConversion);

        assertThat(result).isNotNull();
        assertThat(result.isActiveFlag()).isFalse();
        verify(currencyExchangeDao, times(1)).update(testConversion);
    }

    @Test
    void shouldVerifyDaoInteractionForGetExchangeRate() {
        when(currencyExchangeDao.getExchangeRate(1)).thenReturn(testConversion);

        currencyExchangeService.getExchangeRate(1);
        currencyExchangeService.getExchangeRate(1);

        verify(currencyExchangeDao, times(2)).getExchangeRate(1);
    }

    @Test
    void shouldHandleLargeIntegerCurrencyCode() {
        when(currencyExchangeDao.getExchangeRate(Integer.MAX_VALUE)).thenReturn(null);

        CurrencyConversion result = currencyExchangeService.getExchangeRate(Integer.MAX_VALUE);

        assertThat(result).isNull();
        verify(currencyExchangeDao, times(1)).getExchangeRate(Integer.MAX_VALUE);
    }

    @Test
    void shouldHandleConversionWithAllFieldsNull() {
        CurrencyConversion conversionWithNulls = new CurrencyConversion();

        currencyExchangeService.persist(conversionWithNulls);

        verify(currencyExchangeDao, times(1)).persist(conversionWithNulls);
    }

    @Test
    void shouldHandleConversionWithNegativeExchangeRate() {
        testConversion.setExchangeRate(BigDecimal.valueOf(-0.272));
        when(currencyExchangeDao.update(testConversion)).thenReturn(testConversion);

        CurrencyConversion result = currencyExchangeService.update(testConversion);

        assertThat(result).isNotNull();
        assertThat(result.getExchangeRate()).isEqualTo(BigDecimal.valueOf(-0.272));
        verify(currencyExchangeDao, times(1)).update(testConversion);
    }

    @Test
    void shouldHandleConversionListWithMixedActiveFlagsInGetAll() {
        CurrencyConversion activeConversion = new CurrencyConversion();
        activeConversion.setActiveFlag(true);

        CurrencyConversion inactiveConversion = new CurrencyConversion();
        inactiveConversion.setActiveFlag(false);

        List<CurrencyConversion> mixedList = Arrays.asList(activeConversion, inactiveConversion);
        when(currencyExchangeDao.getCurrencyConversionList()).thenReturn(mixedList);

        List<CurrencyConversion> result = currencyExchangeService.getCurrencyConversionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(currencyExchangeDao, times(1)).getCurrencyConversionList();
    }
}
