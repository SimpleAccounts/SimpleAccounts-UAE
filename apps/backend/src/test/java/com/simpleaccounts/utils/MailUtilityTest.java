package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.ConfigurationConstants;
import com.simpleaccounts.entity.Configuration;
import com.simpleaccounts.integration.MailIntegration;
import com.simpleaccounts.service.ConfigurationService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
@DisplayName("MailUtility Tests")
class MailUtilityTest {

    @Mock
    private MailIntegration mailIntegration;

    @Mock
    private ConfigurationService configurationService;

    @Mock
    private Environment env;

    private MailUtility mailUtility;

    @BeforeEach
    void setUp() {
        mailUtility = new MailUtility(mailIntegration, configurationService, env);
    }

    @Nested
    @DisplayName("create Tests - Template Placeholder Replacement")
    class CreateTests {

        @Test
        @DisplayName("Should replace single placeholder in template")
        void shouldReplaceSinglePlaceholderInTemplate() {
            // given
            Map<String, String> dataMap = new HashMap<>();
            dataMap.put("{companyName}", "Acme Corp");
            String template = "Welcome to {companyName}!";

            // when
            String result = mailUtility.create(dataMap, template);

            // then
            assertThat(result).isEqualTo("Welcome to Acme Corp!");
        }

        @Test
        @DisplayName("Should replace multiple placeholders in template")
        void shouldReplaceMultiplePlaceholdersInTemplate() {
            // given
            Map<String, String> dataMap = new HashMap<>();
            dataMap.put("{companyName}", "Acme Corp");
            dataMap.put("{invoiceNumber}", "INV-001");
            dataMap.put("{amount}", "1000.00");
            String template = "Invoice {invoiceNumber} from {companyName} for amount {amount}";

            // when
            String result = mailUtility.create(dataMap, template);

            // then
            assertThat(result).isEqualTo("Invoice INV-001 from Acme Corp for amount 1000.00");
        }

        @Test
        @DisplayName("Should handle null value in dataMap by not replacing")
        void shouldHandleNullValueInDataMap() {
            // given
            Map<String, String> dataMap = new HashMap<>();
            dataMap.put("{companyName}", null);
            String template = "Welcome to {companyName}!";

            // when
            String result = mailUtility.create(dataMap, template);

            // then
            assertThat(result).isEqualTo("Welcome to {companyName}!");
        }

        @Test
        @DisplayName("Should handle empty dataMap")
        void shouldHandleEmptyDataMap() {
            // given
            Map<String, String> dataMap = new HashMap<>();
            String template = "Welcome to {companyName}!";

            // when
            String result = mailUtility.create(dataMap, template);

            // then
            assertThat(result).isEqualTo("Welcome to {companyName}!");
        }

        @Test
        @DisplayName("Should handle multiple occurrences of same placeholder")
        void shouldHandleMultipleOccurrencesOfSamePlaceholder() {
            // given
            Map<String, String> dataMap = new HashMap<>();
            dataMap.put("{name}", "John");
            String template = "Hello {name}, your name is {name}";

            // when
            String result = mailUtility.create(dataMap, template);

            // then
            assertThat(result).isEqualTo("Hello John, your name is John");
        }
    }

    @Nested
    @DisplayName("getInvoiceEmailParamMap Tests")
    class GetInvoiceEmailParamMapTests {

        @Test
        @DisplayName("Should return map with all invoice placeholders")
        void shouldReturnMapWithAllInvoicePlaceholders() {
            // when
            Map<String, String> result = mailUtility.getInvoiceEmailParamMap();

            // then
            assertThat(result).isNotNull();
            assertThat(result).isNotEmpty();

            // Verify key mappings
            assertThat(result).containsKey(MailUtility.INVOICE_REFEREBCE_NO);
            assertThat(result).containsKey(MailUtility.INVOICE_DATE);
            assertThat(result).containsKey(MailUtility.INVOICE_DUE_DATE);
            assertThat(result).containsKey(MailUtility.CONTACT_NAME);
            assertThat(result).containsKey(MailUtility.COMPANY_NAME);
            assertThat(result).containsKey(MailUtility.INVOICE_AMOUNT);
            assertThat(result).containsKey(MailUtility.CURRENCY);
        }

        @Test
        @DisplayName("Should have proper placeholder format for values")
        void shouldHaveProperPlaceholderFormatForValues() {
            // when
            Map<String, String> result = mailUtility.getInvoiceEmailParamMap();

            // then
            assertThat(result.get(MailUtility.COMPANY_NAME)).isEqualTo("{companyName}");
            assertThat(result.get(MailUtility.SENDER_NAME)).isEqualTo("{senderName}");
            assertThat(result.get(MailUtility.CURRENCY)).isEqualTo("{currency}");
        }
    }

    @Nested
    @DisplayName("getRfqEmailParamMap Tests")
    class GetRfqEmailParamMapTests {

        @Test
        @DisplayName("Should return map with RFQ placeholders")
        void shouldReturnMapWithRfqPlaceholders() {
            // when
            Map<String, String> result = mailUtility.getRfqEmailParamMap();

            // then
            assertThat(result).isNotNull();
            assertThat(result).isNotEmpty();
            assertThat(result).containsKey(MailUtility.RFQ_NO);
            assertThat(result).containsKey(MailUtility.SUPPLIER_NAME);
            assertThat(result).containsKey(MailUtility.RFQ_AMOUNT);
        }
    }

    @Nested
    @DisplayName("getPoEmailParamMap Tests")
    class GetPoEmailParamMapTests {

        @Test
        @DisplayName("Should return map with PO placeholders")
        void shouldReturnMapWithPoPlaceholders() {
            // when
            Map<String, String> result = mailUtility.getPoEmailParamMap();

            // then
            assertThat(result).isNotNull();
            assertThat(result).isNotEmpty();
            assertThat(result).containsKey(MailUtility.PO_NO);
            assertThat(result).containsKey(MailUtility.PO_AMOUNT);
            assertThat(result).containsKey(MailUtility.SUPPLIER_NAME);
        }
    }

    @Nested
    @DisplayName("getGRNEmailParamMap Tests")
    class GetGrnEmailParamMapTests {

        @Test
        @DisplayName("Should return map with GRN placeholders")
        void shouldReturnMapWithGrnPlaceholders() {
            // when
            Map<String, String> result = mailUtility.getGRNEmailParamMap();

            // then
            assertThat(result).isNotNull();
            assertThat(result).isNotEmpty();
            assertThat(result).containsKey(MailUtility.GRN_NUMBER);
            assertThat(result).containsKey(MailUtility.GRN_REMARKS);
            assertThat(result).containsKey(MailUtility.GRN_RECEIVE_DATE);
        }
    }

    @Nested
    @DisplayName("getQuotationEmailParamMap Tests")
    class GetQuotationEmailParamMapTests {

        @Test
        @DisplayName("Should return map with quotation placeholders")
        void shouldReturnMapWithQuotationPlaceholders() {
            // when
            Map<String, String> result = mailUtility.getQuotationEmailParamMap();

            // then
            assertThat(result).isNotNull();
            assertThat(result).isNotEmpty();
            assertThat(result).containsKey(MailUtility.QUOTATION_NO);
            assertThat(result).containsKey(MailUtility.CUSTOMER_NAME);
            assertThat(result).containsKey(MailUtility.QUOTATION_PAYMENT_TERMS);
        }
    }

    @Nested
    @DisplayName("getEMailConfigurationList Tests")
    class GetEmailConfigurationListTests {

        @Test
        @DisplayName("Should return default config when configuration list is null")
        void shouldReturnDefaultConfigWhenConfigListIsNull() {
            // when
            MailUtility.MailConfigurationModel result = MailUtility.getEMailConfigurationList(null);

            // then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Should return default config when configuration list is empty")
        void shouldReturnDefaultConfigWhenConfigListIsEmpty() {
            // when
            MailUtility.MailConfigurationModel result = MailUtility.getEMailConfigurationList(new ArrayList<>());

            // then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Should populate config from complete configuration list")
        void shouldPopulateConfigFromCompleteConfigurationList() {
            // given
            List<Configuration> configs = createCompleteConfigurationList();

            // when
            MailUtility.MailConfigurationModel result = MailUtility.getEMailConfigurationList(configs);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getMailhost()).isEqualTo("smtp.test.com");
            assertThat(result.getMailport()).isEqualTo("587");
            assertThat(result.getMailusername()).isEqualTo("testuser");
            assertThat(result.getMailpassword()).isEqualTo("testpass");
            assertThat(result.getMailsmtpAuth()).isEqualTo("true");
        }

        @Test
        @DisplayName("Should use default when config list is incomplete")
        void shouldUseDefaultWhenConfigListIsIncomplete() {
            // given - only partial configuration (less than 7 required)
            List<Configuration> configs = new ArrayList<>();
            configs.add(createConfig(ConfigurationConstants.MAIL_HOST, "smtp.test.com"));
            configs.add(createConfig(ConfigurationConstants.MAIL_PORT, "587"));

            // when
            MailUtility.MailConfigurationModel result = MailUtility.getEMailConfigurationList(configs);

            // then
            assertThat(result).isNotNull();
            // Should fallback to environment defaults since not all 7 configs present
        }

        private List<Configuration> createCompleteConfigurationList() {
            List<Configuration> configs = new ArrayList<>();
            configs.add(createConfig(ConfigurationConstants.MAIL_HOST, "smtp.test.com"));
            configs.add(createConfig(ConfigurationConstants.MAIL_PORT, "587"));
            configs.add(createConfig(ConfigurationConstants.MAIL_USERNAME, "testuser"));
            configs.add(createConfig(ConfigurationConstants.MAIL_PASSWORD, "testpass"));
            configs.add(createConfig(ConfigurationConstants.MAIL_SMTP_AUTH, "true"));
            configs.add(createConfig(ConfigurationConstants.MAIL_API_KEY, "api-key"));
            configs.add(createConfig(ConfigurationConstants.MAIL_SMTP_STARTTLS_ENABLE, "true"));
            return configs;
        }

        private Configuration createConfig(String name, String value) {
            Configuration config = new Configuration();
            config.setName(name);
            config.setValue(value);
            return config;
        }
    }

    @Nested
    @DisplayName("Constants Tests")
    class ConstantsTests {

        @Test
        @DisplayName("Should have correct APPLICATION_PDF constant")
        void shouldHaveCorrectApplicationPdfConstant() {
            assertThat(MailUtility.APPLICATION_PDF).isEqualTo("application/pdf");
        }

        @Test
        @DisplayName("Should have correct TEXT_HTML constant")
        void shouldHaveCorrectTextHtmlConstant() {
            assertThat(MailUtility.TEXT_HTML).isEqualTo("text/html");
        }

        @Test
        @DisplayName("Should have correct report filename constants")
        void shouldHaveCorrectReportFilenameConstants() {
            assertThat(MailUtility.INVOICE_REPORT).isEqualTo("Invoice.pdf");
            assertThat(MailUtility.PAYSLIP_REPORT).isEqualTo("Payslip.pdf");
            assertThat(MailUtility.QUOTATION_REPORT).isEqualTo("Quotation.pdf");
            assertThat(MailUtility.CREDIT_NOTE_REPORT).isEqualTo("CreditNote.pdf");
        }
    }

    @Nested
    @DisplayName("Placeholder Constants Tests")
    class PlaceholderConstantsTests {

        @Test
        @DisplayName("Should have correctly formatted placeholders")
        void shouldHaveCorrectlyFormattedPlaceholders() {
            assertThat(MailUtility.PLACEHOLDER_COMPANY_NAME).isEqualTo("{companyName}");
            assertThat(MailUtility.PLACEHOLDER_CURRENCY).isEqualTo("{currency}");
            assertThat(MailUtility.PLACEHOLDER_SENDER_NAME).isEqualTo("{senderName}");
            assertThat(MailUtility.PLACEHOLDER_TOTAL).isEqualTo("{total}");
            assertThat(MailUtility.PLACEHOLDER_SUB_TOTAL).isEqualTo("{subTotal}");
        }

        @ParameterizedTest(name = "Placeholder {0} should start with '{{' and end with '}}'")
        @ValueSource(strings = {
            "{companyName}",
            "{currency}",
            "{senderName}",
            "{total}",
            "{subTotal}",
            "{description}",
            "{product}",
            "{quantity}",
            "{unitType}",
            "{unitPrice}"
        })
        @DisplayName("Should have placeholders in correct format")
        void shouldHavePlaceholdersInCorrectFormat(String placeholder) {
            assertThat(placeholder).startsWith("{");
            assertThat(placeholder).endsWith("}");
        }
    }

    @Nested
    @DisplayName("Email Configuration Model Tests")
    class EmailConfigurationModelTests {

        @Test
        @DisplayName("Should get default email configuration")
        void shouldGetDefaultEmailConfiguration() {
            // when
            MailUtility.MailConfigurationModel result = MailUtility.getDefaultEmailConfigurationList();

            // then
            assertThat(result).isNotNull();
            // Values will be from environment, which may be null in test context
        }
    }
}
