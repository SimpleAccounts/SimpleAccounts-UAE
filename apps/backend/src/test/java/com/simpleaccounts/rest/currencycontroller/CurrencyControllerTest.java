package com.simpleaccounts.rest.currencycontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.UserService;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("CurrencyController Unit Tests")
class CurrencyControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CurrencyService currencyService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private UserService userServiceNew;

    @Mock
    private InvoiceService invoiceService;

    @Mock
    private ExpenseService expenseService;

    @Mock
    private BankAccountService bankAccountService;

    @Mock
    private ContactService contactService;

    @InjectMocks
    private CurrencyController currencyController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(currencyController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Should return currency list")
    void getCurrenciesReturnsList() throws Exception {
        List<Currency> currencies = Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ"),
            createCurrency(2, "US Dollar", "USD", "$")
        );

        when(currencyService.getCurrenciesProfile()).thenReturn(currencies);

        mockMvc.perform(get("/rest/currency/getcurrency"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return no content when no currencies")
    void getCurrenciesReturnsNoContent() throws Exception {
        when(currencyService.getCurrenciesProfile()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/currency/getcurrency"))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should return active currencies")
    void getActiveCurrenciesReturnsList() throws Exception {
        List<Currency> currencies = Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ")
        );

        when(currencyService.getActiveCurrencies()).thenReturn(currencies);

        mockMvc.perform(get("/rest/currency/getactivecurrencies"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return company currencies")
    void getCompanyCurrenciesReturnsList() throws Exception {
        List<Currency> currencies = Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ")
        );

        when(currencyService.getCompanyCurrencies()).thenReturn(currencies);

        mockMvc.perform(get("/rest/currency/getCompanyCurrencies"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return currency by code")
    void getCurrencyByCodeReturnsCurrency() throws Exception {
        Currency currency = createCurrency(1, "UAE Dirham", "AED", "د.إ");

        when(currencyService.findByPK(1)).thenReturn(currency);

        mockMvc.perform(get("/rest/currency/{currencyCode}", 1)
                .param("currencyCode", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return no content when currency not found")
    void getCurrencyByCodeReturnsNoContent() throws Exception {
        when(currencyService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/currency/{currencyCode}", 999)
                .param("currencyCode", "999"))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should return invoices count for currency")
    void getInvoicesCountForCurrencyReturnsCount() throws Exception {
        Currency currency = createCurrency(1, "UAE Dirham", "AED", "د.إ");

        when(currencyService.getCurrency(1)).thenReturn(currency);
        when(invoiceService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(expenseService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(contactService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(bankAccountService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/currency/getInvoicesCountForCurrency")
                .param("currencyId", "1"))
            .andExpect(status().isOk());
    }

    private Currency createCurrency(Integer code, String name, String isoCode, String symbol) {
        Currency currency = new Currency();
        currency.setCurrencyCode(code);
        currency.setCurrencyName(name);
        currency.setCurrencyIsoCode(isoCode);
        currency.setCurrencySymbol(symbol);
        currency.setDeleteFlag(false);
        return currency;
    }
}
