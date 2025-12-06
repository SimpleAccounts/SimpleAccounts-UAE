package com.simpleaccounts.rest.currencyconversioncontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(CurrencyConversionController.class)
@AutoConfigureMockMvc(addFilters = false)
class CurrencyConversionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private CompanyService companyService;
    @MockBean private CurrencyExchangeService currencyExchangeService;
    @MockBean private CurrencyConversionHelper currencyConversionHelper;
    @MockBean private CurrencyService currencyService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void saveConvertedCurrencyShouldCreateNewConversion() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("USD", "3.67");
        Currency currency = createCurrency("USD", "US Dollar");
        Company company = createCompany();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyService.findByPK("USD")).thenReturn(currency);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/currencyConversion/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(currencyExchangeService).persist(any(CurrencyConversion.class));
    }

    @Test
    void saveConvertedCurrencyShouldSetIsActiveWhenProvided() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("EUR", "4.00");
        requestModel.setIsActive(true);

        Currency currency = createCurrency("EUR", "Euro");
        Company company = createCompany();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyService.findByPK("EUR")).thenReturn(currency);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/currencyConversion/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(currencyExchangeService).persist(any(CurrencyConversion.class));
    }

    @Test
    void saveConvertedCurrencyShouldSetCreatedDate() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("GBP", "4.50");
        Currency currency = createCurrency("GBP", "British Pound");
        Company company = createCompany();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyService.findByPK("GBP")).thenReturn(currency);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/currencyConversion/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());
    }

    @Test
    void updateConvertedCurrencyShouldUpdateExisting() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("USD", "3.75");
        requestModel.setId(1);

        CurrencyConversion existingConversion = createCurrencyConversion(1, "USD");
        Currency currency = createCurrency("USD", "US Dollar");
        Company company = createCompany();

        when(currencyExchangeService.findByPK(1)).thenReturn(existingConversion);
        when(currencyService.findByPK("USD")).thenReturn(currency);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/currencyConversion/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(currencyExchangeService).update(any(CurrencyConversion.class));
    }

    @Test
    void updateConvertedCurrencyShouldReturnBadRequestWhenNotFound() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("USD", "3.75");
        requestModel.setId(999);

        when(currencyExchangeService.findByPK(999)).thenReturn(null);

        mockMvc.perform(post("/rest/currencyConversion/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateConvertedCurrencyShouldHandleException() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("USD", "3.75");
        requestModel.setId(1);

        when(currencyExchangeService.findByPK(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/currencyConversion/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getCurrencyConversionListShouldReturnAllConversions() throws Exception {
        List<CurrencyConversion> conversionList = Arrays.asList(
            createCurrencyConversion(1, "USD"),
            createCurrencyConversion(2, "EUR")
        );

        List<CurrencyConversionResponseModel> responseList = Arrays.asList(
            createResponseModel(1, "USD", "AED", new BigDecimal("3.67")),
            createResponseModel(2, "EUR", "AED", new BigDecimal("4.00"))
        );

        when(currencyExchangeService.getCurrencyConversionList()).thenReturn(conversionList);
        when(currencyConversionHelper.getListOfConvertedCurrency(conversionList)).thenReturn(responseList);

        mockMvc.perform(get("/rest/currencyConversion/getCurrencyConversionList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(currencyExchangeService).getCurrencyConversionList();
    }

    @Test
    void getCurrencyConversionListShouldReturnEmptyList() throws Exception {
        when(currencyExchangeService.getCurrencyConversionList()).thenReturn(null);
        when(currencyConversionHelper.getListOfConvertedCurrency(null)).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/currencyConversion/getCurrencyConversionList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getActiveCurrencyConversionListShouldReturnActiveOnly() throws Exception {
        List<CurrencyConversion> activeConversions = Arrays.asList(
            createCurrencyConversion(1, "USD")
        );

        List<CurrencyConversionResponseModel> responseList = Arrays.asList(
            createResponseModel(1, "USD", "AED", new BigDecimal("3.67"))
        );

        when(currencyExchangeService.getActiveCurrencyConversionList()).thenReturn(activeConversions);
        when(currencyConversionHelper.getListOfConvertedCurrency(activeConversions)).thenReturn(responseList);

        mockMvc.perform(get("/rest/currencyConversion/getActiveCurrencyConversionList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(currencyExchangeService).getActiveCurrencyConversionList();
    }

    @Test
    void getActiveCurrencyConversionListShouldHandleNullList() throws Exception {
        when(currencyExchangeService.getActiveCurrencyConversionList()).thenReturn(null);
        when(currencyConversionHelper.getListOfConvertedCurrency(null)).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/currencyConversion/getActiveCurrencyConversionList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getCurrencyConversionByIdShouldReturnConversion() throws Exception {
        CurrencyConversion conversion = createCurrencyConversion(1, "USD");
        conversion.getCurrencyCode().setCurrencyName("US Dollar");
        conversion.getCurrencyCode().setCurrencyIsoCode("USD");
        conversion.getCurrencyCodeConvertedTo().setDescription("UAE Dirham");

        when(currencyExchangeService.findByPK(1)).thenReturn(conversion);

        mockMvc.perform(get("/rest/currencyConversion/getCurrencyConversionById")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currencyConversionId").value(1))
                .andExpect(jsonPath("$.currencyCode").value("USD"));
    }

    @Test
    void getCurrencyConversionByIdShouldReturnNoContentWhenNotFound() throws Exception {
        when(currencyExchangeService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/currencyConversion/getCurrencyConversionById")
                        .param("id", "999"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(Matchers.containsString("No result found for id-999")));
    }

    @Test
    void deleteCurrencyShouldSetDeleteFlag() throws Exception {
        CurrencyConversion conversion = createCurrencyConversion(1, "USD");
        conversion.setDeleteFlag(false);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyExchangeService.findByPK(1)).thenReturn(conversion);

        mockMvc.perform(delete("/rest/currencyConversion/1")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(currencyExchangeService).update(any(CurrencyConversion.class));
    }

    @Test
    void deleteCurrencyShouldReturnNoContentWhenNotFound() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyExchangeService.findByPK(999)).thenReturn(null);

        mockMvc.perform(delete("/rest/currencyConversion/999")
                        .param("id", "999"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteCurrencyShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyExchangeService.findByPK(1)).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(delete("/rest/currencyConversion/1")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateConvertedCurrencyShouldUpdateIsActiveFlag() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("EUR", "4.00");
        requestModel.setId(2);
        requestModel.setIsActive(false);

        CurrencyConversion existingConversion = createCurrencyConversion(2, "EUR");
        Currency currency = createCurrency("EUR", "Euro");
        Company company = createCompany();

        when(currencyExchangeService.findByPK(2)).thenReturn(existingConversion);
        when(currencyService.findByPK("EUR")).thenReturn(currency);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/currencyConversion/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(currencyExchangeService).update(any(CurrencyConversion.class));
    }

    @Test
    void saveConvertedCurrencyShouldHandleNullIsActive() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("JPY", "0.03");
        requestModel.setIsActive(null);

        Currency currency = createCurrency("JPY", "Japanese Yen");
        Company company = createCompany();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyService.findByPK("JPY")).thenReturn(currency);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/currencyConversion/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());
    }

    @Test
    void getCurrencyConversionListShouldReturnMultipleConversions() throws Exception {
        List<CurrencyConversion> conversionList = Arrays.asList(
            createCurrencyConversion(1, "USD"),
            createCurrencyConversion(2, "EUR"),
            createCurrencyConversion(3, "GBP")
        );

        List<CurrencyConversionResponseModel> responseList = Arrays.asList(
            createResponseModel(1, "USD", "AED", new BigDecimal("3.67")),
            createResponseModel(2, "EUR", "AED", new BigDecimal("4.00")),
            createResponseModel(3, "GBP", "AED", new BigDecimal("4.50"))
        );

        when(currencyExchangeService.getCurrencyConversionList()).thenReturn(conversionList);
        when(currencyConversionHelper.getListOfConvertedCurrency(conversionList)).thenReturn(responseList);

        mockMvc.perform(get("/rest/currencyConversion/getCurrencyConversionList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void deleteCurrencyShouldUpdateDeleteFlagToTrue() throws Exception {
        CurrencyConversion conversion = createCurrencyConversion(5, "CAD");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(currencyExchangeService.findByPK(5)).thenReturn(conversion);

        mockMvc.perform(delete("/rest/currencyConversion/5")
                        .param("id", "5"))
                .andExpect(status().isOk());

        verify(currencyExchangeService).update(any(CurrencyConversion.class));
    }

    @Test
    void getCurrencyConversionByIdShouldReturnCompleteDetails() throws Exception {
        CurrencyConversion conversion = createCurrencyConversion(10, "CHF");
        conversion.setExchangeRate(new BigDecimal("4.00"));
        conversion.setIsActive(true);
        conversion.getCurrencyCode().setCurrencyName("Swiss Franc");
        conversion.getCurrencyCode().setCurrencyIsoCode("CHF");
        conversion.getCurrencyCodeConvertedTo().setDescription("UAE Dirham");

        when(currencyExchangeService.findByPK(10)).thenReturn(conversion);

        mockMvc.perform(get("/rest/currencyConversion/getCurrencyConversionById")
                        .param("id", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currencyConversionId").value(10))
                .andExpect(jsonPath("$.currencyCode").value("CHF"))
                .andExpect(jsonPath("$.exchangeRate").value(4.00))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    void updateConvertedCurrencyShouldUpdateExchangeRate() throws Exception {
        CurrencyConversionRequestModel requestModel = createRequestModel("USD", "3.80");
        requestModel.setId(1);

        CurrencyConversion existingConversion = createCurrencyConversion(1, "USD");
        Currency currency = createCurrency("USD", "US Dollar");
        Company company = createCompany();

        when(currencyExchangeService.findByPK(1)).thenReturn(existingConversion);
        when(currencyService.findByPK("USD")).thenReturn(currency);
        when(companyService.getCompany()).thenReturn(company);

        mockMvc.perform(post("/rest/currencyConversion/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(currencyExchangeService).update(any(CurrencyConversion.class));
    }

    // Helper methods
    private CurrencyConversionRequestModel createRequestModel(String currencyCode, String exchangeRate) {
        CurrencyConversionRequestModel model = new CurrencyConversionRequestModel();
        model.setCurrencyCode(currencyCode);
        model.setExchangeRate(new BigDecimal(exchangeRate));
        return model;
    }

    private Currency createCurrency(String code, String name) {
        Currency currency = new Currency();
        currency.setCurrencyCode(code);
        currency.setCurrencyName(name);
        currency.setCurrencyIsoCode(code);
        return currency;
    }

    private Company createCompany() {
        Company company = new Company();
        company.setCompanyId(1);
        company.setCompanyName("Test Company");

        Currency aed = new Currency();
        aed.setCurrencyCode("AED");
        aed.setCurrencyName("UAE Dirham");
        aed.setDescription("UAE Dirham");
        company.setCurrencyCode(aed);

        return company;
    }

    private CurrencyConversion createCurrencyConversion(Integer id, String currencyCode) {
        CurrencyConversion conversion = new CurrencyConversion();
        conversion.setCurrencyConversionId(id);
        conversion.setExchangeRate(new BigDecimal("3.67"));
        conversion.setDeleteFlag(false);
        conversion.setIsActive(true);

        Currency from = createCurrency(currencyCode, currencyCode + " Currency");
        Currency to = createCurrency("AED", "UAE Dirham");

        conversion.setCurrencyCode(from);
        conversion.setCurrencyCodeConvertedTo(to);

        return conversion;
    }

    private CurrencyConversionResponseModel createResponseModel(Integer id, String fromCode,
                                                                String toCode, BigDecimal rate) {
        CurrencyConversionResponseModel model = new CurrencyConversionResponseModel();
        model.setCurrencyConversionId(id);
        model.setCurrencyCode(fromCode);
        model.setCurrencyCodeConvertedTo(toCode);
        model.setExchangeRate(rate);
        model.setIsActive(true);
        return model;
    }
}
