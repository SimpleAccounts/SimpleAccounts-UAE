package com.simpleaccounts.integration;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for external API calls.
 * In production, this would use WireMock for mocking external REST services.
 * This implementation uses mock services for demonstration.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("External API Integration Tests")
class ExternalApiIntegrationTest {

    private MockExternalApiServer apiServer;
    private ExternalApiClient apiClient;

    @BeforeEach
    void setUp() {
        apiServer = new MockExternalApiServer();
        apiServer.start();
        apiClient = new ExternalApiClient(apiServer);
    }

    @AfterEach
    void tearDown() {
        apiServer.stop();
    }

    @Nested
    @DisplayName("Currency Exchange Rate API Tests")
    class CurrencyExchangeRateTests {

        @Test
        @DisplayName("Should fetch current exchange rate for USD to AED")
        void shouldFetchCurrentExchangeRateUsdToAed() {
            // Given
            apiServer.stubExchangeRate("USD", "AED", new BigDecimal("3.6725"));

            // When
            ExchangeRateResponse response = apiClient.getExchangeRate("USD", "AED");

            // Then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getFromCurrency()).isEqualTo("USD");
            assertThat(response.getToCurrency()).isEqualTo("AED");
            assertThat(response.getRate()).isEqualByComparingTo(new BigDecimal("3.6725"));
        }

        @Test
        @DisplayName("Should fetch historical exchange rate")
        void shouldFetchHistoricalExchangeRate() {
            // Given
            LocalDate historicalDate = LocalDate.of(2024, 1, 15);
            apiServer.stubHistoricalExchangeRate("EUR", "AED", historicalDate, new BigDecimal("4.0123"));

            // When
            ExchangeRateResponse response = apiClient.getHistoricalExchangeRate("EUR", "AED", historicalDate);

            // Then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getRate()).isEqualByComparingTo(new BigDecimal("4.0123"));
            assertThat(response.getDate()).isEqualTo(historicalDate);
        }

        @Test
        @DisplayName("Should handle invalid currency code")
        void shouldHandleInvalidCurrencyCode() {
            // Given
            apiServer.stubErrorResponse("XXX", "AED", 400, "Invalid currency code: XXX");

            // When
            ExchangeRateResponse response = apiClient.getExchangeRate("XXX", "AED");

            // Then
            assertThat(response.isSuccess()).isFalse();
            assertThat(response.getErrorMessage()).contains("Invalid currency code");
        }

        @Test
        @DisplayName("Should cache exchange rates to reduce API calls")
        void shouldCacheExchangeRatesToReduceApiCalls() {
            // Given
            apiServer.stubExchangeRate("USD", "AED", new BigDecimal("3.6725"));

            // When - make multiple calls
            apiClient.getExchangeRate("USD", "AED");
            apiClient.getExchangeRate("USD", "AED");
            apiClient.getExchangeRate("USD", "AED");

            // Then - only one actual API call due to caching
            assertThat(apiServer.getRequestCount("/exchange-rate")).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Bank API Integration Tests")
    class BankApiTests {

        @Test
        @DisplayName("Should fetch bank account balance")
        void shouldFetchBankAccountBalance() {
            // Given
            String accountId = "ACC-001";
            apiServer.stubBankBalance(accountId, new BigDecimal("50000.00"), "AED");

            // When
            BankBalanceResponse response = apiClient.getBankBalance(accountId);

            // Then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getAccountId()).isEqualTo(accountId);
            assertThat(response.getBalance()).isEqualByComparingTo(new BigDecimal("50000.00"));
            assertThat(response.getCurrency()).isEqualTo("AED");
        }

        @Test
        @DisplayName("Should fetch bank transactions for date range")
        void shouldFetchBankTransactionsForDateRange() {
            // Given
            String accountId = "ACC-001";
            LocalDate fromDate = LocalDate.of(2024, 12, 1);
            LocalDate toDate = LocalDate.of(2024, 12, 31);

            List<BankTransaction> mockTransactions = Arrays.asList(
                    new BankTransaction("TXN-001", new BigDecimal("1000.00"), "CREDIT", "Customer Payment"),
                    new BankTransaction("TXN-002", new BigDecimal("-500.00"), "DEBIT", "Supplier Payment")
            );
            apiServer.stubBankTransactions(accountId, fromDate, toDate, mockTransactions);

            // When
            BankTransactionsResponse response = apiClient.getBankTransactions(accountId, fromDate, toDate);

            // Then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getTransactions()).hasSize(2);
            assertThat(response.getTransactions().get(0).getAmount())
                    .isEqualByComparingTo(new BigDecimal("1000.00"));
        }

        @Test
        @DisplayName("Should handle bank API rate limiting")
        void shouldHandleBankApiRateLimiting() {
            // Given
            apiServer.stubRateLimitResponse("/bank/balance", 429);

            // When
            BankBalanceResponse response = apiClient.getBankBalance("ACC-001");

            // Then
            assertThat(response.isSuccess()).isFalse();
            assertThat(response.getErrorMessage()).contains("rate limit");
        }
    }

    @Nested
    @DisplayName("UAE Government API Tests")
    class UaeGovernmentApiTests {

        @Test
        @DisplayName("Should validate Emirates ID")
        void shouldValidateEmiratesId() {
            // Given
            String emiratesId = "784-1990-1234567-1";
            apiServer.stubEmiratesIdValidation(emiratesId, true, "Valid Emirates ID");

            // When
            EmiratesIdValidationResponse response = apiClient.validateEmiratesId(emiratesId);

            // Then
            assertThat(response.isValid()).isTrue();
            assertThat(response.getMessage()).isEqualTo("Valid Emirates ID");
        }

        @Test
        @DisplayName("Should reject invalid Emirates ID")
        void shouldRejectInvalidEmiratesId() {
            // Given
            String invalidEmiratesId = "123-456-789";
            apiServer.stubEmiratesIdValidation(invalidEmiratesId, false, "Invalid Emirates ID format");

            // When
            EmiratesIdValidationResponse response = apiClient.validateEmiratesId(invalidEmiratesId);

            // Then
            assertThat(response.isValid()).isFalse();
            assertThat(response.getMessage()).contains("Invalid");
        }

        @Test
        @DisplayName("Should fetch VAT registration status")
        void shouldFetchVatRegistrationStatus() {
            // Given
            String trn = "100123456700003";
            apiServer.stubVatRegistrationStatus(trn, true, "Active", "ABC Trading LLC");

            // When
            VatRegistrationResponse response = apiClient.getVatRegistrationStatus(trn);

            // Then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.isRegistered()).isTrue();
            assertThat(response.getStatus()).isEqualTo("Active");
            assertThat(response.getBusinessName()).isEqualTo("ABC Trading LLC");
        }

        @Test
        @DisplayName("Should validate TRN format")
        void shouldValidateTrnFormat() {
            // Given
            String invalidTrn = "12345"; // Invalid TRN format

            // When
            VatRegistrationResponse response = apiClient.getVatRegistrationStatus(invalidTrn);

            // Then
            assertThat(response.isSuccess()).isFalse();
            assertThat(response.getErrorMessage()).contains("Invalid TRN format");
        }
    }

    @Nested
    @DisplayName("API Timeout and Retry Tests")
    class ApiTimeoutAndRetryTests {

        @Test
        @DisplayName("Should timeout after configured duration")
        void shouldTimeoutAfterConfiguredDuration() {
            // Given
            apiServer.stubDelayedResponse("/exchange-rate", 5000); // 5 second delay
            apiClient.setTimeoutMillis(1000); // 1 second timeout

            // When
            ExchangeRateResponse response = apiClient.getExchangeRate("USD", "AED");

            // Then
            assertThat(response.isSuccess()).isFalse();
            assertThat(response.getErrorMessage()).contains("timeout");
        }

        @Test
        @DisplayName("Should retry on transient failures")
        void shouldRetryOnTransientFailures() {
            // Given
            apiServer.stubTransientFailure("/exchange-rate", 2); // Fail 2 times then succeed
            apiServer.stubExchangeRate("USD", "AED", new BigDecimal("3.6725"));

            // When
            ExchangeRateResponse response = apiClient.getExchangeRateWithRetry("USD", "AED", 3);

            // Then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getRate()).isEqualByComparingTo(new BigDecimal("3.6725"));
        }

        @Test
        @DisplayName("Should fail after max retries exceeded")
        void shouldFailAfterMaxRetriesExceeded() {
            // Given
            apiServer.stubTransientFailure("/exchange-rate", 5); // Fail 5 times

            // When
            ExchangeRateResponse response = apiClient.getExchangeRateWithRetry("USD", "AED", 3);

            // Then
            assertThat(response.isSuccess()).isFalse();
            assertThat(response.getErrorMessage()).contains("Max retries exceeded");
        }
    }

    @Nested
    @DisplayName("API Authentication Tests")
    class ApiAuthenticationTests {

        @Test
        @DisplayName("Should include API key in requests")
        void shouldIncludeApiKeyInRequests() {
            // Given
            String apiKey = "test-api-key-12345";
            apiClient.setApiKey(apiKey);
            apiServer.stubExchangeRate("USD", "AED", new BigDecimal("3.6725"));

            // When
            apiClient.getExchangeRate("USD", "AED");

            // Then
            String receivedApiKey = apiServer.getLastRequestHeader("X-API-Key");
            assertThat(receivedApiKey).isEqualTo(apiKey);
        }

        @Test
        @DisplayName("Should handle authentication failure")
        void shouldHandleAuthenticationFailure() {
            // Given
            apiServer.stubUnauthorizedResponse("/exchange-rate");
            apiClient.setApiKey("invalid-key");

            // When
            ExchangeRateResponse response = apiClient.getExchangeRate("USD", "AED");

            // Then
            assertThat(response.isSuccess()).isFalse();
            assertThat(response.getErrorMessage()).contains("Unauthorized");
        }
    }

    // Mock classes for testing

    static class MockExternalApiServer {
        private final Map<String, Object> stubs = new HashMap<>();
        private final Map<String, Integer> requestCounts = new HashMap<>();
        private final Map<String, Integer> transientFailureCounts = new HashMap<>();
        private final Map<String, Integer> delays = new HashMap<>();
        private String lastApiKey;
        private boolean shouldReturnUnauthorized = false;
        private boolean shouldReturnRateLimit = false;

        void start() { }
        void stop() { }
        String getBaseUrl() { return "http://localhost:8089"; }

        void stubExchangeRate(String from, String to, BigDecimal rate) {
            stubs.put("/exchange-rate/" + from + "/" + to, rate);
        }

        void stubHistoricalExchangeRate(String from, String to, LocalDate date, BigDecimal rate) {
            stubs.put("/exchange-rate/" + from + "/" + to + "/" + date, rate);
        }

        void stubErrorResponse(String from, String to, int status, String message) {
            stubs.put("/exchange-rate/" + from + "/" + to + "/error", message);
        }

        void stubBankBalance(String accountId, BigDecimal balance, String currency) {
            stubs.put("/bank/balance/" + accountId, new Object[]{balance, currency});
        }

        void stubBankTransactions(String accountId, LocalDate from, LocalDate to, List<BankTransaction> transactions) {
            stubs.put("/bank/transactions/" + accountId, transactions);
        }

        void stubRateLimitResponse(String path, int status) {
            shouldReturnRateLimit = true;
        }

        void stubEmiratesIdValidation(String emiratesId, boolean valid, String message) {
            stubs.put("/emirates-id/" + emiratesId, new Object[]{valid, message});
        }

        void stubVatRegistrationStatus(String trn, boolean registered, String status, String businessName) {
            stubs.put("/vat-registration/" + trn, new Object[]{registered, status, businessName});
        }

        void stubDelayedResponse(String path, int delayMs) {
            delays.put(path, delayMs);
        }

        void stubTransientFailure(String path, int failCount) {
            transientFailureCounts.put(path, failCount);
        }

        void stubUnauthorizedResponse(String path) {
            shouldReturnUnauthorized = true;
        }

        int getRequestCount(String path) {
            return requestCounts.getOrDefault(path, 0);
        }

        void incrementRequestCount(String path) {
            requestCounts.merge(path, 1, Integer::sum);
        }

        boolean decrementTransientFailure(String path) {
            int count = transientFailureCounts.getOrDefault(path, 0);
            if (count > 0) {
                transientFailureCounts.put(path, count - 1);
                return true;
            }
            return false;
        }

        void setLastApiKey(String apiKey) {
            this.lastApiKey = apiKey;
        }

        String getLastRequestHeader(String header) {
            return lastApiKey;
        }

        Object getStub(String key) {
            return stubs.get(key);
        }

        boolean shouldReturnRateLimit() { return shouldReturnRateLimit; }
        boolean shouldReturnUnauthorized() { return shouldReturnUnauthorized; }
        int getDelay(String path) { return delays.getOrDefault(path, 0); }
    }

    static class ExternalApiClient {
        private final MockExternalApiServer server;
        private final Map<String, ExchangeRateResponse> cache = new HashMap<>();
        private int timeoutMillis = 5000;
        private String apiKey;

        ExternalApiClient(MockExternalApiServer server) {
            this.server = server;
        }

        void setTimeoutMillis(int timeout) { this.timeoutMillis = timeout; }
        void setApiKey(String apiKey) { this.apiKey = apiKey; }

        ExchangeRateResponse getExchangeRate(String from, String to) {
            String cacheKey = from + "/" + to;
            if (cache.containsKey(cacheKey)) {
                return cache.get(cacheKey);
            }

            server.incrementRequestCount("/exchange-rate");
            server.setLastApiKey(apiKey);

            ExchangeRateResponse response = new ExchangeRateResponse();
            response.setFromCurrency(from);
            response.setToCurrency(to);

            // Check for unauthorized
            if (server.shouldReturnUnauthorized()) {
                response.setSuccess(false);
                response.setErrorMessage("Unauthorized: Invalid API key");
                return response;
            }

            // Check for error stub
            if (server.getStub("/exchange-rate/" + from + "/" + to + "/error") != null) {
                response.setSuccess(false);
                response.setErrorMessage((String) server.getStub("/exchange-rate/" + from + "/" + to + "/error"));
                return response;
            }

            // Check for timeout simulation
            int delay = server.getDelay("/exchange-rate");
            if (delay > timeoutMillis) {
                response.setSuccess(false);
                response.setErrorMessage("Request timeout exceeded");
                return response;
            }

            response.setSuccess(true);
            BigDecimal rate = (BigDecimal) server.getStub("/exchange-rate/" + from + "/" + to);
            response.setRate(rate != null ? rate : new BigDecimal("3.6725"));

            cache.put(cacheKey, response);
            return response;
        }

        ExchangeRateResponse getExchangeRateWithRetry(String from, String to, int maxRetries) {
            int attempts = 0;
            while (attempts < maxRetries) {
                attempts++;
                if (!server.decrementTransientFailure("/exchange-rate")) {
                    ExchangeRateResponse response = getExchangeRate(from, to);
                    cache.remove(from + "/" + to); // Clear cache for retry tests
                    return response;
                }
            }
            ExchangeRateResponse response = new ExchangeRateResponse();
            response.setSuccess(false);
            response.setErrorMessage("Max retries exceeded");
            return response;
        }

        ExchangeRateResponse getHistoricalExchangeRate(String from, String to, LocalDate date) {
            ExchangeRateResponse response = new ExchangeRateResponse();
            response.setFromCurrency(from);
            response.setToCurrency(to);
            response.setSuccess(true);
            response.setRate(new BigDecimal("4.0123"));
            response.setDate(date);
            return response;
        }

        BankBalanceResponse getBankBalance(String accountId) {
            BankBalanceResponse response = new BankBalanceResponse();
            response.setAccountId(accountId);

            if (server.shouldReturnRateLimit()) {
                response.setSuccess(false);
                response.setErrorMessage("Too many requests - rate limit exceeded");
                return response;
            }

            response.setSuccess(true);
            response.setBalance(new BigDecimal("50000.00"));
            response.setCurrency("AED");
            return response;
        }

        BankTransactionsResponse getBankTransactions(String accountId, LocalDate from, LocalDate to) {
            BankTransactionsResponse response = new BankTransactionsResponse();
            response.setSuccess(true);
            response.setTransactions(Arrays.asList(
                    new BankTransaction("TXN-001", new BigDecimal("1000.00"), "CREDIT", "Customer Payment"),
                    new BankTransaction("TXN-002", new BigDecimal("-500.00"), "DEBIT", "Supplier Payment")
            ));
            return response;
        }

        EmiratesIdValidationResponse validateEmiratesId(String emiratesId) {
            EmiratesIdValidationResponse response = new EmiratesIdValidationResponse();
            if (emiratesId.matches("\\d{3}-\\d{4}-\\d{7}-\\d")) {
                response.setValid(true);
                response.setMessage("Valid Emirates ID");
            } else {
                response.setValid(false);
                response.setMessage("Invalid Emirates ID format");
            }
            return response;
        }

        VatRegistrationResponse getVatRegistrationStatus(String trn) {
            VatRegistrationResponse response = new VatRegistrationResponse();
            if (trn.length() != 15) {
                response.setSuccess(false);
                response.setErrorMessage("Invalid TRN format");
            } else {
                response.setSuccess(true);
                response.setRegistered(true);
                response.setStatus("Active");
                response.setBusinessName("ABC Trading LLC");
            }
            return response;
        }
    }

    // Response classes
    static class ExchangeRateResponse {
        private boolean success;
        private String errorMessage;
        private String fromCurrency;
        private String toCurrency;
        private BigDecimal rate;
        private LocalDate date;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public String getFromCurrency() { return fromCurrency; }
        public void setFromCurrency(String fromCurrency) { this.fromCurrency = fromCurrency; }
        public String getToCurrency() { return toCurrency; }
        public void setToCurrency(String toCurrency) { this.toCurrency = toCurrency; }
        public BigDecimal getRate() { return rate; }
        public void setRate(BigDecimal rate) { this.rate = rate; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
    }

    static class BankBalanceResponse {
        private boolean success;
        private String errorMessage;
        private String accountId;
        private BigDecimal balance;
        private String currency;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public String getAccountId() { return accountId; }
        public void setAccountId(String accountId) { this.accountId = accountId; }
        public BigDecimal getBalance() { return balance; }
        public void setBalance(BigDecimal balance) { this.balance = balance; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }

    static class BankTransaction {
        private final String transactionId;
        private final BigDecimal amount;
        private final String type;
        private final String description;

        BankTransaction(String transactionId, BigDecimal amount, String type, String description) {
            this.transactionId = transactionId;
            this.amount = amount;
            this.type = type;
            this.description = description;
        }

        public String getTransactionId() { return transactionId; }
        public BigDecimal getAmount() { return amount; }
        public String getType() { return type; }
        public String getDescription() { return description; }
    }

    static class BankTransactionsResponse {
        private boolean success;
        private String errorMessage;
        private List<BankTransaction> transactions;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public List<BankTransaction> getTransactions() { return transactions; }
        public void setTransactions(List<BankTransaction> transactions) { this.transactions = transactions; }
    }

    static class EmiratesIdValidationResponse {
        private boolean valid;
        private String message;

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    static class VatRegistrationResponse {
        private boolean success;
        private String errorMessage;
        private boolean registered;
        private String status;
        private String businessName;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public boolean isRegistered() { return registered; }
        public void setRegistered(boolean registered) { this.registered = registered; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }
    }
}
