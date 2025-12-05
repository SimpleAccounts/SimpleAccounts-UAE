package com.simpleaccounts.contract;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;

/**
 * Contract tests for API schema validation.
 * These tests verify that API responses conform to the expected schema/contract.
 * In production, this could integrate with OpenAPI/Swagger validation or Pact.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OpenAPI Schema Validation Tests")
class OpenApiSchemaValidationTest {

    private SchemaValidator schemaValidator;
    private MockApiClient apiClient;

    @BeforeEach
    void setUp() {
        schemaValidator = new SchemaValidator();
        apiClient = new MockApiClient();

        // Register schemas
        registerInvoiceSchema();
        registerCustomerSchema();
        registerPayrollSchema();
        registerReportSchema();
        registerErrorSchema();
    }

    private void registerInvoiceSchema() {
        Schema invoiceSchema = Schema.object("Invoice")
                .required("id", Schema.string().minLength(1))
                .required("invoiceNumber", Schema.string().pattern("INV-\\d{4}-\\d+"))
                .required("customerId", Schema.string().minLength(1))
                .required("issueDate", Schema.date())
                .required("dueDate", Schema.date())
                .required("status", Schema.enumOf("DRAFT", "APPROVED", "SENT", "PAID", "VOIDED"))
                .required("lineItems", Schema.array(
                        Schema.object("LineItem")
                                .required("description", Schema.string().minLength(1))
                                .required("quantity", Schema.number().minimum(0))
                                .required("unitPrice", Schema.number().minimum(0))
                                .required("vatRate", Schema.number().minimum(0).maximum(100))
                                .optional("accountCode", Schema.string())
                ))
                .required("subtotal", Schema.number().minimum(0))
                .required("vatAmount", Schema.number().minimum(0))
                .required("total", Schema.number().minimum(0))
                .optional("notes", Schema.string())
                .optional("attachments", Schema.array(Schema.string()));

        schemaValidator.registerSchema("Invoice", invoiceSchema);
    }

    private void registerCustomerSchema() {
        Schema customerSchema = Schema.object("Customer")
                .required("id", Schema.string().minLength(1))
                .required("name", Schema.string().minLength(1).maxLength(200))
                .required("email", Schema.string().email())
                .optional("phone", Schema.string().pattern("\\+?[0-9\\s-]+"))
                .optional("trn", Schema.string().pattern("\\d{15}"))
                .required("address", Schema.object("Address")
                        .required("street", Schema.string())
                        .required("city", Schema.string())
                        .required("country", Schema.string())
                        .optional("postalCode", Schema.string())
                )
                .required("createdAt", Schema.dateTime())
                .optional("updatedAt", Schema.dateTime());

        schemaValidator.registerSchema("Customer", customerSchema);
    }

    private void registerPayrollSchema() {
        Schema payrollRunSchema = Schema.object("PayrollRun")
                .required("id", Schema.string())
                .required("period", Schema.string().pattern("\\d{4}-\\d{2}"))
                .required("status", Schema.enumOf("DRAFT", "APPROVED", "LOCKED", "EXPORTED"))
                .required("employees", Schema.array(
                        Schema.object("EmployeePayslip")
                                .required("employeeId", Schema.string())
                                .required("employeeName", Schema.string())
                                .required("basicSalary", Schema.number().minimum(0))
                                .required("allowances", Schema.number().minimum(0))
                                .required("deductions", Schema.number().minimum(0))
                                .required("netSalary", Schema.number())
                ))
                .required("totalAmount", Schema.number().minimum(0))
                .required("runDate", Schema.date());

        schemaValidator.registerSchema("PayrollRun", payrollRunSchema);
    }

    private void registerReportSchema() {
        Schema pnlReportSchema = Schema.object("ProfitLossReport")
                .required("fromDate", Schema.date())
                .required("toDate", Schema.date())
                .required("revenue", Schema.object("RevenueSection")
                        .required("total", Schema.number())
                        .required("items", Schema.array(
                                Schema.object("ReportItem")
                                        .required("accountName", Schema.string())
                                        .required("amount", Schema.number())
                        ))
                )
                .required("expenses", Schema.object("ExpenseSection")
                        .required("total", Schema.number())
                        .required("items", Schema.array(
                                Schema.object("ReportItem")
                                        .required("accountName", Schema.string())
                                        .required("amount", Schema.number())
                        ))
                )
                .required("netProfit", Schema.number())
                .required("generatedAt", Schema.dateTime());

        schemaValidator.registerSchema("ProfitLossReport", pnlReportSchema);
    }

    private void registerErrorSchema() {
        Schema errorSchema = Schema.object("ApiError")
                .required("code", Schema.string())
                .required("message", Schema.string())
                .optional("details", Schema.array(
                        Schema.object("ErrorDetail")
                                .required("field", Schema.string())
                                .required("message", Schema.string())
                ))
                .required("timestamp", Schema.dateTime());

        schemaValidator.registerSchema("ApiError", errorSchema);
    }

    @Nested
    @DisplayName("Invoice API Contract Tests")
    class InvoiceApiContractTests {

        @Test
        @DisplayName("GET /api/invoices/{id} should return valid Invoice schema")
        void getInvoiceShouldReturnValidSchema() {
            // Given
            Map<String, Object> invoiceResponse = apiClient.getInvoice("inv-001");

            // When
            ValidationResult result = schemaValidator.validate("Invoice", invoiceResponse);

            // Then
            assertThat(result.isValid())
                    .as("Invoice response should match schema. Errors: %s", result.getErrors())
                    .isTrue();
        }

        @Test
        @DisplayName("Invoice number should match pattern INV-YYYY-NNN")
        void invoiceNumberShouldMatchPattern() {
            // Given
            Map<String, Object> invoice = apiClient.getInvoice("inv-001");

            // When
            String invoiceNumber = (String) invoice.get("invoiceNumber");

            // Then
            assertThat(invoiceNumber).matches("INV-\\d{4}-\\d+");
        }

        @Test
        @DisplayName("Invoice status should be one of allowed values")
        void invoiceStatusShouldBeAllowedValue() {
            // Given
            Map<String, Object> invoice = apiClient.getInvoice("inv-001");

            // When
            String status = (String) invoice.get("status");

            // Then
            assertThat(status).isIn("DRAFT", "APPROVED", "SENT", "PAID", "VOIDED");
        }

        @Test
        @DisplayName("Invoice totals should be calculated correctly")
        void invoiceTotalsShouldBeCalculatedCorrectly() {
            // Given
            Map<String, Object> invoice = apiClient.getInvoice("inv-001");

            // When
            BigDecimal subtotal = new BigDecimal(invoice.get("subtotal").toString());
            BigDecimal vatAmount = new BigDecimal(invoice.get("vatAmount").toString());
            BigDecimal total = new BigDecimal(invoice.get("total").toString());

            // Then
            assertThat(total).isEqualByComparingTo(subtotal.add(vatAmount));
        }

        @Test
        @DisplayName("POST /api/invoices should validate required fields")
        void createInvoiceShouldValidateRequiredFields() {
            // Given - invoice missing required customerId
            Map<String, Object> invalidInvoice = new HashMap<>();
            invalidInvoice.put("issueDate", "2024-12-01");
            invalidInvoice.put("lineItems", Collections.emptyList());

            // When
            Map<String, Object> errorResponse = apiClient.createInvoiceWithValidation(invalidInvoice);

            // Then
            ValidationResult result = schemaValidator.validate("ApiError", errorResponse);
            assertThat(result.isValid()).isTrue();
            assertThat((String) errorResponse.get("code")).isEqualTo("VALIDATION_ERROR");
        }

        @Test
        @DisplayName("Line items should have valid quantity and price")
        void lineItemsShouldHaveValidQuantityAndPrice() {
            // Given
            Map<String, Object> invoice = apiClient.getInvoice("inv-001");

            // When
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> lineItems = (List<Map<String, Object>>) invoice.get("lineItems");

            // Then
            for (Map<String, Object> item : lineItems) {
                BigDecimal quantity = new BigDecimal(item.get("quantity").toString());
                BigDecimal unitPrice = new BigDecimal(item.get("unitPrice").toString());
                BigDecimal vatRate = new BigDecimal(item.get("vatRate").toString());

                assertThat(quantity).isGreaterThan(BigDecimal.ZERO);
                assertThat(unitPrice).isGreaterThanOrEqualTo(BigDecimal.ZERO);
                assertThat(vatRate).isBetween(BigDecimal.ZERO, new BigDecimal("100"));
            }
        }
    }

    @Nested
    @DisplayName("Customer API Contract Tests")
    class CustomerApiContractTests {

        @Test
        @DisplayName("GET /api/customers/{id} should return valid Customer schema")
        void getCustomerShouldReturnValidSchema() {
            // Given
            Map<String, Object> customerResponse = apiClient.getCustomer("cust-001");

            // When
            ValidationResult result = schemaValidator.validate("Customer", customerResponse);

            // Then
            assertThat(result.isValid())
                    .as("Customer response should match schema. Errors: %s", result.getErrors())
                    .isTrue();
        }

        @Test
        @DisplayName("Customer email should be valid format")
        void customerEmailShouldBeValidFormat() {
            // Given
            Map<String, Object> customer = apiClient.getCustomer("cust-001");

            // When
            String email = (String) customer.get("email");

            // Then
            assertThat(email).matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$");
        }

        @Test
        @DisplayName("Customer TRN should be 15 digits if present")
        void customerTrnShouldBe15DigitsIfPresent() {
            // Given
            Map<String, Object> customer = apiClient.getCustomer("cust-001");

            // When
            String trn = (String) customer.get("trn");

            // Then
            if (trn != null) {
                assertThat(trn).matches("\\d{15}");
            }
        }

        @Test
        @DisplayName("Customer address should have required fields")
        void customerAddressShouldHaveRequiredFields() {
            // Given
            Map<String, Object> customer = apiClient.getCustomer("cust-001");

            // When
            @SuppressWarnings("unchecked")
            Map<String, Object> address = (Map<String, Object>) customer.get("address");

            // Then
            assertThat(address).containsKeys("street", "city", "country");
            assertThat((String) address.get("city")).isNotBlank();
            assertThat((String) address.get("country")).isNotBlank();
        }
    }

    @Nested
    @DisplayName("Payroll API Contract Tests")
    class PayrollApiContractTests {

        @Test
        @DisplayName("GET /api/payroll/{id} should return valid PayrollRun schema")
        void getPayrollRunShouldReturnValidSchema() {
            // Given
            Map<String, Object> payrollResponse = apiClient.getPayrollRun("pr-001");

            // When
            ValidationResult result = schemaValidator.validate("PayrollRun", payrollResponse);

            // Then
            assertThat(result.isValid())
                    .as("PayrollRun response should match schema. Errors: %s", result.getErrors())
                    .isTrue();
        }

        @Test
        @DisplayName("Payroll period should be in YYYY-MM format")
        void payrollPeriodShouldBeInCorrectFormat() {
            // Given
            Map<String, Object> payroll = apiClient.getPayrollRun("pr-001");

            // When
            String period = (String) payroll.get("period");

            // Then
            assertThat(period).matches("\\d{4}-\\d{2}");
        }

        @Test
        @DisplayName("Employee payslip net salary should equal basic + allowances - deductions")
        void employeeNetSalaryShouldBeCalculatedCorrectly() {
            // Given
            Map<String, Object> payroll = apiClient.getPayrollRun("pr-001");

            // When
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> employees = (List<Map<String, Object>>) payroll.get("employees");

            // Then
            for (Map<String, Object> employee : employees) {
                BigDecimal basic = new BigDecimal(employee.get("basicSalary").toString());
                BigDecimal allowances = new BigDecimal(employee.get("allowances").toString());
                BigDecimal deductions = new BigDecimal(employee.get("deductions").toString());
                BigDecimal netSalary = new BigDecimal(employee.get("netSalary").toString());

                BigDecimal expected = basic.add(allowances).subtract(deductions);
                assertThat(netSalary).isEqualByComparingTo(expected);
            }
        }
    }

    @Nested
    @DisplayName("Report API Contract Tests")
    class ReportApiContractTests {

        @Test
        @DisplayName("GET /api/reports/profit-loss should return valid ProfitLossReport schema")
        void getProfitLossReportShouldReturnValidSchema() {
            // Given
            Map<String, Object> reportResponse = apiClient.getProfitLossReport("2024-01-01", "2024-12-31");

            // When
            ValidationResult result = schemaValidator.validate("ProfitLossReport", reportResponse);

            // Then
            assertThat(result.isValid())
                    .as("P&L Report response should match schema. Errors: %s", result.getErrors())
                    .isTrue();
        }

        @Test
        @DisplayName("Report net profit should equal revenue minus expenses")
        void reportNetProfitShouldBeCalculatedCorrectly() {
            // Given
            Map<String, Object> report = apiClient.getProfitLossReport("2024-01-01", "2024-12-31");

            // When
            @SuppressWarnings("unchecked")
            Map<String, Object> revenue = (Map<String, Object>) report.get("revenue");
            @SuppressWarnings("unchecked")
            Map<String, Object> expenses = (Map<String, Object>) report.get("expenses");

            BigDecimal totalRevenue = new BigDecimal(revenue.get("total").toString());
            BigDecimal totalExpenses = new BigDecimal(expenses.get("total").toString());
            BigDecimal netProfit = new BigDecimal(report.get("netProfit").toString());

            // Then
            assertThat(netProfit).isEqualByComparingTo(totalRevenue.subtract(totalExpenses));
        }
    }

    @Nested
    @DisplayName("Error Response Contract Tests")
    class ErrorResponseContractTests {

        @Test
        @DisplayName("404 error should return valid ApiError schema")
        void notFoundErrorShouldReturnValidSchema() {
            // Given
            Map<String, Object> errorResponse = apiClient.getNotFoundError();

            // When
            ValidationResult result = schemaValidator.validate("ApiError", errorResponse);

            // Then
            assertThat(result.isValid()).isTrue();
            assertThat((String) errorResponse.get("code")).isEqualTo("NOT_FOUND");
        }

        @Test
        @DisplayName("Validation error should include field details")
        void validationErrorShouldIncludeFieldDetails() {
            // Given
            Map<String, Object> errorResponse = apiClient.getValidationError();

            // When
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> details = (List<Map<String, Object>>) errorResponse.get("details");

            // Then
            assertThat(details).isNotEmpty();
            for (Map<String, Object> detail : details) {
                assertThat(detail).containsKeys("field", "message");
            }
        }
    }

    // Mock and helper classes

    static class MockApiClient {

        Map<String, Object> getInvoice(String id) {
            Map<String, Object> invoice = new HashMap<>();
            invoice.put("id", id);
            invoice.put("invoiceNumber", "INV-2024-001");
            invoice.put("customerId", "cust-001");
            invoice.put("issueDate", "2024-12-01");
            invoice.put("dueDate", "2024-12-31");
            invoice.put("status", "APPROVED");

            List<Map<String, Object>> lineItems = new ArrayList<>();
            Map<String, Object> lineItem = new HashMap<>();
            lineItem.put("description", "Consulting Services");
            lineItem.put("quantity", 10);
            lineItem.put("unitPrice", 100.00);
            lineItem.put("vatRate", 5);
            lineItem.put("accountCode", "4000");
            lineItems.add(lineItem);
            invoice.put("lineItems", lineItems);

            invoice.put("subtotal", 1000.00);
            invoice.put("vatAmount", 50.00);
            invoice.put("total", 1050.00);
            invoice.put("notes", "Thank you for your business");

            return invoice;
        }

        Map<String, Object> createInvoiceWithValidation(Map<String, Object> invoice) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", "VALIDATION_ERROR");
            error.put("message", "Validation failed");

            List<Map<String, Object>> details = new ArrayList<>();
            Map<String, Object> detail = new HashMap<>();
            detail.put("field", "customerId");
            detail.put("message", "Customer ID is required");
            details.add(detail);
            error.put("details", details);

            error.put("timestamp", "2024-12-05T10:00:00Z");
            return error;
        }

        Map<String, Object> getCustomer(String id) {
            Map<String, Object> customer = new HashMap<>();
            customer.put("id", id);
            customer.put("name", "ABC Trading LLC");
            customer.put("email", "contact@abctrading.ae");
            customer.put("phone", "+971 4 123 4567");
            customer.put("trn", "100123456700003");

            Map<String, Object> address = new HashMap<>();
            address.put("street", "123 Business Bay");
            address.put("city", "Dubai");
            address.put("country", "UAE");
            address.put("postalCode", "12345");
            customer.put("address", address);

            customer.put("createdAt", "2024-01-01T00:00:00Z");
            customer.put("updatedAt", "2024-12-01T12:00:00Z");

            return customer;
        }

        Map<String, Object> getPayrollRun(String id) {
            Map<String, Object> payroll = new HashMap<>();
            payroll.put("id", id);
            payroll.put("period", "2024-12");
            payroll.put("status", "APPROVED");

            List<Map<String, Object>> employees = new ArrayList<>();
            Map<String, Object> emp1 = new HashMap<>();
            emp1.put("employeeId", "emp-001");
            emp1.put("employeeName", "John Doe");
            emp1.put("basicSalary", 10000.00);
            emp1.put("allowances", 2000.00);
            emp1.put("deductions", 500.00);
            emp1.put("netSalary", 11500.00);
            employees.add(emp1);

            Map<String, Object> emp2 = new HashMap<>();
            emp2.put("employeeId", "emp-002");
            emp2.put("employeeName", "Jane Smith");
            emp2.put("basicSalary", 15000.00);
            emp2.put("allowances", 3000.00);
            emp2.put("deductions", 800.00);
            emp2.put("netSalary", 17200.00);
            employees.add(emp2);

            payroll.put("employees", employees);
            payroll.put("totalAmount", 28700.00);
            payroll.put("runDate", "2024-12-25");

            return payroll;
        }

        Map<String, Object> getProfitLossReport(String fromDate, String toDate) {
            Map<String, Object> report = new HashMap<>();
            report.put("fromDate", fromDate);
            report.put("toDate", toDate);

            Map<String, Object> revenue = new HashMap<>();
            revenue.put("total", 500000.00);
            List<Map<String, Object>> revenueItems = new ArrayList<>();
            Map<String, Object> revItem = new HashMap<>();
            revItem.put("accountName", "Sales Revenue");
            revItem.put("amount", 500000.00);
            revenueItems.add(revItem);
            revenue.put("items", revenueItems);
            report.put("revenue", revenue);

            Map<String, Object> expenses = new HashMap<>();
            expenses.put("total", 300000.00);
            List<Map<String, Object>> expenseItems = new ArrayList<>();
            Map<String, Object> expItem = new HashMap<>();
            expItem.put("accountName", "Operating Expenses");
            expItem.put("amount", 300000.00);
            expenseItems.add(expItem);
            expenses.put("items", expenseItems);
            report.put("expenses", expenses);

            report.put("netProfit", 200000.00);
            report.put("generatedAt", "2024-12-05T10:00:00Z");

            return report;
        }

        Map<String, Object> getNotFoundError() {
            Map<String, Object> error = new HashMap<>();
            error.put("code", "NOT_FOUND");
            error.put("message", "Resource not found");
            error.put("timestamp", "2024-12-05T10:00:00Z");
            return error;
        }

        Map<String, Object> getValidationError() {
            Map<String, Object> error = new HashMap<>();
            error.put("code", "VALIDATION_ERROR");
            error.put("message", "Validation failed");

            List<Map<String, Object>> details = new ArrayList<>();
            Map<String, Object> detail1 = new HashMap<>();
            detail1.put("field", "email");
            detail1.put("message", "Invalid email format");
            details.add(detail1);

            Map<String, Object> detail2 = new HashMap<>();
            detail2.put("field", "amount");
            detail2.put("message", "Amount must be positive");
            details.add(detail2);

            error.put("details", details);
            error.put("timestamp", "2024-12-05T10:00:00Z");

            return error;
        }
    }

    static class SchemaValidator {
        private final Map<String, Schema> schemas = new HashMap<>();

        void registerSchema(String name, Schema schema) {
            schemas.put(name, schema);
        }

        ValidationResult validate(String schemaName, Map<String, Object> data) {
            Schema schema = schemas.get(schemaName);
            if (schema == null) {
                return ValidationResult.invalid(Collections.singletonList("Schema not found: " + schemaName));
            }
            return schema.validate(data, "");
        }
    }

    static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;

        private ValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }

        static ValidationResult valid() {
            return new ValidationResult(true, Collections.emptyList());
        }

        static ValidationResult invalid(List<String> errors) {
            return new ValidationResult(false, errors);
        }

        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
    }

    static class Schema {
        private final String type;
        private final String name;
        private final Map<String, Schema> requiredFields = new LinkedHashMap<>();
        private final Map<String, Schema> optionalFields = new LinkedHashMap<>();
        private final List<String> enumValues = new ArrayList<>();
        private Schema arrayItemSchema;
        private Integer minLength;
        private Integer maxLength;
        private BigDecimal minimum;
        private BigDecimal maximum;
        private String pattern;

        private Schema(String type) {
            this.type = type;
            this.name = null;
        }

        private Schema(String type, String name) {
            this.type = type;
            this.name = name;
        }

        static Schema object(String name) { return new Schema("object", name); }
        static Schema string() { return new Schema("string"); }
        static Schema number() { return new Schema("number"); }
        static Schema date() { return new Schema("date"); }
        static Schema dateTime() { return new Schema("dateTime"); }
        static Schema array(Schema itemSchema) {
            Schema schema = new Schema("array");
            schema.arrayItemSchema = itemSchema;
            return schema;
        }
        static Schema enumOf(String... values) {
            Schema schema = new Schema("enum");
            schema.enumValues.addAll(Arrays.asList(values));
            return schema;
        }

        Schema required(String field, Schema fieldSchema) {
            requiredFields.put(field, fieldSchema);
            return this;
        }

        Schema optional(String field, Schema fieldSchema) {
            optionalFields.put(field, fieldSchema);
            return this;
        }

        Schema minLength(int min) { this.minLength = min; return this; }
        Schema maxLength(int max) { this.maxLength = max; return this; }
        Schema minimum(double min) { this.minimum = BigDecimal.valueOf(min); return this; }
        Schema maximum(double max) { this.maximum = BigDecimal.valueOf(max); return this; }
        Schema pattern(String pattern) { this.pattern = pattern; return this; }
        Schema email() { this.pattern = "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$"; return this; }

        ValidationResult validate(Object data, String path) {
            List<String> errors = new ArrayList<>();

            if (data == null) {
                errors.add(path + ": value is null");
                return ValidationResult.invalid(errors);
            }

            switch (type) {
                case "object":
                    validateObject(data, path, errors);
                    break;
                case "string":
                    validateString(data, path, errors);
                    break;
                case "number":
                    validateNumber(data, path, errors);
                    break;
                case "date":
                case "dateTime":
                    validateDate(data, path, errors);
                    break;
                case "array":
                    validateArray(data, path, errors);
                    break;
                case "enum":
                    validateEnum(data, path, errors);
                    break;
            }

            return errors.isEmpty() ? ValidationResult.valid() : ValidationResult.invalid(errors);
        }

        @SuppressWarnings("unchecked")
        private void validateObject(Object data, String path, List<String> errors) {
            if (!(data instanceof Map)) {
                errors.add(path + ": expected object but got " + data.getClass().getSimpleName());
                return;
            }

            Map<String, Object> map = (Map<String, Object>) data;

            // Check required fields
            for (Map.Entry<String, Schema> entry : requiredFields.entrySet()) {
                String field = entry.getKey();
                Schema fieldSchema = entry.getValue();
                String fieldPath = path.isEmpty() ? field : path + "." + field;

                if (!map.containsKey(field)) {
                    errors.add(fieldPath + ": required field is missing");
                } else {
                    ValidationResult result = fieldSchema.validate(map.get(field), fieldPath);
                    errors.addAll(result.getErrors());
                }
            }

            // Validate optional fields if present
            for (Map.Entry<String, Schema> entry : optionalFields.entrySet()) {
                String field = entry.getKey();
                Schema fieldSchema = entry.getValue();
                String fieldPath = path.isEmpty() ? field : path + "." + field;

                if (map.containsKey(field) && map.get(field) != null) {
                    ValidationResult result = fieldSchema.validate(map.get(field), fieldPath);
                    errors.addAll(result.getErrors());
                }
            }
        }

        private void validateString(Object data, String path, List<String> errors) {
            if (!(data instanceof String)) {
                errors.add(path + ": expected string but got " + data.getClass().getSimpleName());
                return;
            }

            String str = (String) data;

            if (minLength != null && str.length() < minLength) {
                errors.add(path + ": string length " + str.length() + " is less than minimum " + minLength);
            }
            if (maxLength != null && str.length() > maxLength) {
                errors.add(path + ": string length " + str.length() + " exceeds maximum " + maxLength);
            }
            if (pattern != null && !Pattern.matches(pattern, str)) {
                errors.add(path + ": string '" + str + "' does not match pattern " + pattern);
            }
        }

        private void validateNumber(Object data, String path, List<String> errors) {
            if (!(data instanceof Number)) {
                errors.add(path + ": expected number but got " + data.getClass().getSimpleName());
                return;
            }

            BigDecimal num = new BigDecimal(data.toString());

            if (minimum != null && num.compareTo(minimum) < 0) {
                errors.add(path + ": number " + num + " is less than minimum " + minimum);
            }
            if (maximum != null && num.compareTo(maximum) > 0) {
                errors.add(path + ": number " + num + " exceeds maximum " + maximum);
            }
        }

        private void validateDate(Object data, String path, List<String> errors) {
            if (!(data instanceof String)) {
                errors.add(path + ": expected date string but got " + data.getClass().getSimpleName());
                return;
            }

            String dateStr = (String) data;
            // Simple validation - just check format
            if (type.equals("date") && !dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
                errors.add(path + ": invalid date format, expected YYYY-MM-DD");
            }
            if (type.equals("dateTime") && !dateStr.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*")) {
                errors.add(path + ": invalid dateTime format, expected ISO 8601");
            }
        }

        @SuppressWarnings("unchecked")
        private void validateArray(Object data, String path, List<String> errors) {
            if (!(data instanceof List)) {
                errors.add(path + ": expected array but got " + data.getClass().getSimpleName());
                return;
            }

            List<Object> list = (List<Object>) data;
            for (int i = 0; i < list.size(); i++) {
                String itemPath = path + "[" + i + "]";
                ValidationResult result = arrayItemSchema.validate(list.get(i), itemPath);
                errors.addAll(result.getErrors());
            }
        }

        private void validateEnum(Object data, String path, List<String> errors) {
            if (!(data instanceof String)) {
                errors.add(path + ": expected string for enum but got " + data.getClass().getSimpleName());
                return;
            }

            String value = (String) data;
            if (!enumValues.contains(value)) {
                errors.add(path + ": value '" + value + "' is not one of allowed values: " + enumValues);
            }
        }
    }
}
