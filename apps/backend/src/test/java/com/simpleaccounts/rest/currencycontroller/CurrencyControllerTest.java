package com.simpleaccounts.rest.currencycontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.UserService;
import java.time.LocalDateTime;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class CurrencyControllerTest {

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
    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private CurrencyController controller;

    @Test
    void getCurrenciesShouldReturnOk() {
        Currency currency = buildCurrency(1, "AED");
        when(currencyService.getCurrenciesProfile())
                .thenReturn(Collections.singletonList(currency));

        ResponseEntity<List<Currency>> response = controller.getCurrencies();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(currency);
    }

    @Test
    void getCurrenciesShouldReturnNoContentWhenEmpty() {
        when(currencyService.getCurrenciesProfile()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Currency>> response = controller.getCurrencies();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void getCurrencyShouldReturnCurrencyWhenFound() {
        Currency currency = buildCurrency(99, "USD");
        when(currencyService.findByPK(99)).thenReturn(currency);

        ResponseEntity<Currency> response = controller.getCurrency(99);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(currency);
    }

    @Test
    void editCurrencyShouldUpdateWhenExistingRecordFound() {
        Currency existing = buildCurrency(7, "INR");
        existing.setCreatedBy(5);
        existing.setCreatedDate(LocalDateTime.now().minusDays(1));
        when(currencyService.findByPK(7)).thenReturn(existing);
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(99);

        Currency payload = buildCurrency(null, "SAR");
        ResponseEntity<?> response = controller.editCurrency(payload, 7, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<Currency> captor = ArgumentCaptor.forClass(Currency.class);
        verify(currencyService).update(captor.capture());
        Currency updated = captor.getValue();
        assertThat(updated.getCurrencyCode()).isEqualTo(7);
        assertThat(updated.getLastUpdateBy()).isEqualTo(99);
        assertThat(updated.getCreatedBy()).isEqualTo(5);
    }

    @Test
    void editCurrencyShouldReturnBadRequestWhenCurrencyMissing() {
        when(currencyService.findByPK(77)).thenReturn(null);

        ResponseEntity<?> response = controller.editCurrency(new Currency(), 77, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(currencyService, never()).update(any());
    }

    @Test
    void getInvoicesCountShouldReturnOneWhenAnyReferenceExists() {
        Currency currency = buildCurrency(8, "BHD");
        when(currencyService.getCurrency(8)).thenReturn(currency);
        Invoice invoice = new Invoice();
        when(invoiceService.findByAttributes(any(Map.class)))
                .thenReturn(Collections.singletonList(invoice));
        when(expenseService.findByAttributes(any(Map.class)))
                .thenReturn(Collections.<Expense>emptyList());
        when(contactService.findByAttributes(any(Map.class)))
                .thenReturn(Collections.<Contact>emptyList());
        when(bankAccountService.findByAttributes(any(Map.class)))
                .thenReturn(Collections.<BankAccount>emptyList());

        ResponseEntity<Integer> response = controller.getExplainedTransactionCount(8);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(1);
    }

    private Currency buildCurrency(Integer code, String name) {
        Currency currency = new Currency();
        currency.setCurrencyCode(code);
        currency.setCurrencyName(name);
        return currency;
    }
}

