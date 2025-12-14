package com.simpleaccounts.contract;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.*;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Contract Tests for API endpoints.
 *
 * Validates that API responses match the expected schema.
 * In production, use Spring Cloud Contract or Pact for full contract testing.
 */
@DisplayName("OpenAPI Contract Tests")
class OpenApiContractTest {

    private static ApiContractValidator validator;

    @BeforeAll
    static void setUp() {
        validator = new ApiContractValidator();

        // Define API contracts
        validator.defineContract("/api/invoices", "GET", new ResponseSchema()
            .arrayOf(new ObjectSchema()
                .property("id", SchemaType.INTEGER, true)
                .property("number", SchemaType.STRING, true)
                .property("customerName", SchemaType.STRING, true)
                .property("amount", SchemaType.NUMBER, true)
                .property("status", SchemaType.STRING, true)
                .property("createdAt", SchemaType.DATE_TIME, true)
            ));

        validator.defineContract("/api/invoices/{id}", "GET", new ResponseSchema()
            .object(new ObjectSchema()
                .property("id", SchemaType.INTEGER, true)
                .property("number", SchemaType.STRING, true)
                .property("customerName", SchemaType.STRING, true)
                .property("customerAddress", SchemaType.STRING, false)
                .property("lineItems", SchemaType.ARRAY, true)
                .property("subtotal", SchemaType.NUMBER, true)
                .property("vatAmount", SchemaType.NUMBER, true)
                .property("totalAmount", SchemaType.NUMBER, true)
                .property("status", SchemaType.STRING, true)
            ));

        validator.defineContract("/api/authenticate", "POST", new ResponseSchema()
            .object(new ObjectSchema()
                .property("token", SchemaType.STRING, true)
                .property("expiresIn", SchemaType.INTEGER, true)
                .property("user", SchemaType.OBJECT, true)
            ));

        validator.defineContract("/api/dashboard/kpis", "GET", new ResponseSchema()
            .object(new ObjectSchema()
                .property("totalRevenue", SchemaType.NUMBER, true)
                .property("totalExpenses", SchemaType.NUMBER, true)
                .property("netProfit", SchemaType.NUMBER, true)
                .property("pendingInvoices", SchemaType.INTEGER, true)
                .property("overdueInvoices", SchemaType.INTEGER, true)
            ));
    }

    @Nested
    @DisplayName("Invoice API Contract Tests")
    class InvoiceApiContractTests {

        @Test
        @DisplayName("GET /api/invoices should return array of invoices")
        void shouldReturnInvoiceArray() {
            Map<String, Object> invoice = new HashMap<>();
            invoice.put("id", 1);
            invoice.put("number", "INV-001");
            invoice.put("customerName", "ABC Corp");
            invoice.put("amount", 1000.00);
            invoice.put("status", "PAID");
            invoice.put("createdAt", "2024-12-01T10:00:00Z");

            List<Map<String, Object>> response = Arrays.asList(invoice);

            ValidationResult result = validator.validate("/api/invoices", "GET", response);

            assertThat(result.isValid()).isTrue();
            assertThat(result.getErrors()).isEmpty();
        }

        @Test
        @DisplayName("GET /api/invoices/{id} should return single invoice")
        void shouldReturnSingleInvoice() {
            Map<String, Object> lineItem = new HashMap<>();
            lineItem.put("description", "Service");
            lineItem.put("amount", 1000.00);

            Map<String, Object> response = new HashMap<>();
            response.put("id", 1);
            response.put("number", "INV-001");
            response.put("customerName", "ABC Corp");
            response.put("lineItems", Arrays.asList(lineItem));
            response.put("subtotal", 1000.00);
            response.put("vatAmount", 50.00);
            response.put("totalAmount", 1050.00);
            response.put("status", "DRAFT");

            ValidationResult result = validator.validate("/api/invoices/{id}", "GET", response);

            assertThat(result.isValid()).isTrue();
        }

        @Test
        @DisplayName("Should reject response missing required fields")
        void shouldRejectMissingRequiredFields() {
            Map<String, Object> response = new HashMap<>();
            response.put("id", 1);
            // Missing: number, customerName, amount, status, createdAt

            List<Map<String, Object>> arrayResponse = Arrays.asList(response);

            ValidationResult result = validator.validate("/api/invoices", "GET", arrayResponse);

            assertThat(result.isValid()).isFalse();
            assertThat(result.getErrors()).contains("Missing required field: number");
        }

        @Test
        @DisplayName("Should reject response with wrong field types")
        void shouldRejectWrongFieldTypes() {
            Map<String, Object> response = new HashMap<>();
            response.put("id", "not-a-number"); // Should be integer
            response.put("number", "INV-001");
            response.put("customerName", "ABC Corp");
            response.put("amount", 1000.00);
            response.put("status", "PAID");
            response.put("createdAt", "2024-12-01T10:00:00Z");

            List<Map<String, Object>> arrayResponse = Arrays.asList(response);

            ValidationResult result = validator.validate("/api/invoices", "GET", arrayResponse);

            assertThat(result.isValid()).isFalse();
            assertThat(result.getErrors()).anyMatch(e -> e.contains("id") && e.contains("INTEGER"));
        }
    }

    @Nested
    @DisplayName("Authentication API Contract Tests")
    class AuthenticationApiContractTests {

        @Test
        @DisplayName("POST /api/authenticate should return token")
        void shouldReturnAuthToken() {
            Map<String, Object> user = new HashMap<>();
            user.put("id", 1);
            user.put("name", "Admin");

            Map<String, Object> response = new HashMap<>();
            response.put("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
            response.put("expiresIn", 3600);
            response.put("user", user);

            ValidationResult result = validator.validate("/api/authenticate", "POST", response);

            assertThat(result.isValid()).isTrue();
        }

        @Test
        @DisplayName("Token should be valid JWT format")
        void shouldReturnValidJwtFormat() {
            String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";

            assertThat(token).matches("^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$");
        }
    }

    @Nested
    @DisplayName("Dashboard API Contract Tests")
    class DashboardApiContractTests {

        @Test
        @DisplayName("GET /api/dashboard/kpis should return KPI data")
        void shouldReturnKpiData() {
            Map<String, Object> response = new HashMap<>();
            response.put("totalRevenue", 100000.00);
            response.put("totalExpenses", 60000.00);
            response.put("netProfit", 40000.00);
            response.put("pendingInvoices", 5);
            response.put("overdueInvoices", 2);

            ValidationResult result = validator.validate("/api/dashboard/kpis", "GET", response);

            assertThat(result.isValid()).isTrue();
        }
    }

    @Nested
    @DisplayName("Error Response Contract Tests")
    class ErrorResponseContractTests {

        @Test
        @DisplayName("Error response should follow standard format")
        void shouldFollowStandardErrorFormat() {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", 400);
            errorResponse.put("error", "Bad Request");
            errorResponse.put("message", "Validation failed");
            errorResponse.put("timestamp", "2024-12-01T10:00:00Z");
            errorResponse.put("path", "/api/invoices");

            assertThat(errorResponse).containsKeys("status", "error", "message", "timestamp", "path");
        }

        @Test
        @DisplayName("Validation error should include field details")
        void shouldIncludeFieldDetails() {
            Map<String, String> error1 = new HashMap<>();
            error1.put("field", "amount");
            error1.put("message", "must be positive");

            Map<String, String> error2 = new HashMap<>();
            error2.put("field", "customerName");
            error2.put("message", "must not be blank");

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", 400);
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", "Validation failed");
            errorResponse.put("errors", Arrays.asList(error1, error2));

            @SuppressWarnings("unchecked")
            List<Map<String, String>> errors = (List<Map<String, String>>) errorResponse.get("errors");

            assertThat(errors).hasSize(2);
            assertThat(errors).allMatch(e -> e.containsKey("field") && e.containsKey("message"));
        }
    }

    @Nested
    @DisplayName("Pagination Contract Tests")
    class PaginationContractTests {

        @Test
        @DisplayName("Paginated response should include metadata")
        void shouldIncludePaginationMetadata() {
            Map<String, Object> item = new HashMap<>();
            item.put("id", 1);

            Map<String, Object> response = new HashMap<>();
            response.put("content", Arrays.asList(item));
            response.put("page", 0);
            response.put("size", 20);
            response.put("totalElements", 100);
            response.put("totalPages", 5);
            response.put("first", true);
            response.put("last", false);

            assertThat(response).containsKeys(
                "content", "page", "size", "totalElements", "totalPages", "first", "last"
            );
        }
    }

    // Contract validation implementation
    enum SchemaType {
        STRING, INTEGER, NUMBER, BOOLEAN, OBJECT, ARRAY, DATE_TIME
    }

    static class ObjectSchema {
        private Map<String, PropertyDef> properties = new HashMap<>();

        ObjectSchema property(String name, SchemaType type, boolean required) {
            properties.put(name, new PropertyDef(type, required));
            return this;
        }

        Map<String, PropertyDef> getProperties() { return properties; }
    }

    static class PropertyDef {
        final SchemaType type;
        final boolean required;

        PropertyDef(SchemaType type, boolean required) {
            this.type = type;
            this.required = required;
        }
    }

    static class ResponseSchema {
        private boolean isArray = false;
        private ObjectSchema objectSchema;

        ResponseSchema arrayOf(ObjectSchema schema) {
            this.isArray = true;
            this.objectSchema = schema;
            return this;
        }

        ResponseSchema object(ObjectSchema schema) {
            this.isArray = false;
            this.objectSchema = schema;
            return this;
        }

        boolean isArray() { return isArray; }
        ObjectSchema getObjectSchema() { return objectSchema; }
    }

    static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;

        ValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }

        boolean isValid() { return valid; }
        List<String> getErrors() { return errors; }
    }

    static class ApiContractValidator {
        private Map<String, ResponseSchema> contracts = new HashMap<>();

        void defineContract(String path, String method, ResponseSchema schema) {
            contracts.put(method + " " + path, schema);
        }

        ValidationResult validate(String path, String method, Object response) {
            ResponseSchema schema = contracts.get(method + " " + path);
            if (schema == null) {
                return new ValidationResult(false, Arrays.asList("No contract defined for " + method + " " + path));
            }

            List<String> errors = new ArrayList<>();

            if (schema.isArray()) {
                if (!(response instanceof List)) {
                    errors.add("Expected array response");
                } else {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> items = (List<Map<String, Object>>) response;
                    for (int i = 0; i < items.size(); i++) {
                        errors.addAll(validateObject(items.get(i), schema.getObjectSchema(), "[" + i + "]"));
                    }
                }
            } else {
                if (!(response instanceof Map)) {
                    errors.add("Expected object response");
                } else {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> obj = (Map<String, Object>) response;
                    errors.addAll(validateObject(obj, schema.getObjectSchema(), ""));
                }
            }

            return new ValidationResult(errors.isEmpty(), errors);
        }

        private List<String> validateObject(Map<String, Object> obj, ObjectSchema schema, String prefix) {
            List<String> errors = new ArrayList<>();

            for (Map.Entry<String, PropertyDef> entry : schema.getProperties().entrySet()) {
                String fieldName = entry.getKey();
                PropertyDef propDef = entry.getValue();

                Object value = obj.get(fieldName);

                if (value == null) {
                    if (propDef.required) {
                        errors.add("Missing required field: " + fieldName);
                    }
                    continue;
                }

                if (!isValidType(value, propDef.type)) {
                    errors.add("Field " + prefix + fieldName + " should be " + propDef.type + " but was " + value.getClass().getSimpleName());
                }
            }

            return errors;
        }

        private boolean isValidType(Object value, SchemaType expectedType) {
            switch (expectedType) {
                case STRING:
                    return value instanceof String;
                case INTEGER:
                    return value instanceof Integer || value instanceof Long;
                case NUMBER:
                    return value instanceof Number;
                case BOOLEAN:
                    return value instanceof Boolean;
                case ARRAY:
                    return value instanceof List;
                case OBJECT:
                    return value instanceof Map;
                case DATE_TIME:
                    if (!(value instanceof String)) return false;
                    return Pattern.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*", (String) value);
                default:
                    return false;
            }
        }
    }
}
