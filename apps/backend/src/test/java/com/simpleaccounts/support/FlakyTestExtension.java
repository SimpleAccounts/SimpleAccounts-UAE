package com.simpleaccounts.support;

import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.io.InputStream;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.HashSet;
import java.util.Set;

/**
 * JUnit 5 extension for handling flaky tests.
 *
 * Features:
 * - Skip quarantined tests in CI
 * - Retry flaky tests with configurable attempts
 * - Track test stability over time
 *
 * Usage:
 * {@code
 * @Flaky(reason = "Network timing issues", jiraTicket = "SA-123")
 * @Test
 * void flakyTest() { ... }
 * }
 *
 * @see FlakyTestRegistry
 */
public class FlakyTestExtension implements ExecutionCondition {

    private static final Set<String> QUARANTINED_TESTS = loadQuarantinedTests();
    private static final boolean IS_CI = System.getenv("CI") != null;
    private static final boolean SKIP_FLAKY = Boolean.parseBoolean(
        System.getProperty("skipFlakyTests", "true")
    );

    @Override
    public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext context) {
        // Check if test is annotated as flaky
        Flaky flakyAnnotation = context.getRequiredTestMethod().getAnnotation(Flaky.class);

        if (flakyAnnotation != null) {
            String testId = getTestId(context);

            // If quarantined and running in CI with skip enabled
            if (QUARANTINED_TESTS.contains(testId) && IS_CI && SKIP_FLAKY) {
                return ConditionEvaluationResult.disabled(
                    String.format("Test '%s' is quarantined: %s (JIRA: %s)",
                        testId,
                        flakyAnnotation.reason(),
                        flakyAnnotation.jiraTicket())
                );
            }

            // Log warning but run the test
            System.out.printf("[FLAKY] Running flaky test: %s - %s%n",
                testId, flakyAnnotation.reason());
        }

        return ConditionEvaluationResult.enabled("Test is not quarantined");
    }

    private String getTestId(ExtensionContext context) {
        return context.getRequiredTestClass().getName() + "#" +
               context.getRequiredTestMethod().getName();
    }

    private static Set<String> loadQuarantinedTests() {
        Set<String> quarantined = new HashSet<>();
        try (InputStream is = FlakyTestExtension.class.getResourceAsStream("/flaky-tests.json")) {
            if (is != null) {
                // Simple JSON parsing without external dependencies (Java 8 compatible)
                java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream();
                int nRead;
                byte[] data = new byte[1024];
                while ((nRead = is.read(data, 0, data.length)) != -1) {
                    buffer.write(data, 0, nRead);
                }
                String content = buffer.toString("UTF-8");
                // Extract quarantined test IDs (simplified parsing)
                int start = content.indexOf("\"quarantined\"");
                if (start != -1) {
                    int arrayStart = content.indexOf('[', start);
                    int arrayEnd = content.indexOf(']', arrayStart);
                    if (arrayStart != -1 && arrayEnd != -1) {
                        String array = content.substring(arrayStart + 1, arrayEnd);
                        // Parse test IDs from array
                        for (String item : array.split(",")) {
                            String testId = item.replaceAll("[\"\\s{}]", "")
                                               .replaceAll("testId:", "")
                                               .trim();
                            if (!testId.isEmpty() && testId.contains("#")) {
                                quarantined.add(testId);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[FLAKY] Could not load flaky-tests.json: " + e.getMessage());
        }
        return quarantined;
    }

    /**
     * Annotation to mark a test as flaky.
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface Flaky {
        /**
         * Reason why the test is flaky.
         */
        String reason();

        /**
         * JIRA ticket tracking the fix.
         */
        String jiraTicket() default "";

        /**
         * Maximum retry attempts for this test.
         */
        int maxRetries() default 3;

        /**
         * Whether this test is quarantined (skipped in CI).
         */
        boolean quarantined() default false;
    }

    /**
     * Retry mechanism for flaky tests.
     */
    public static class RetryTestExtension implements org.junit.jupiter.api.extension.TestExecutionExceptionHandler {

        @Override
        public void handleTestExecutionException(ExtensionContext context, Throwable throwable) throws Throwable {
            Flaky flaky = context.getRequiredTestMethod().getAnnotation(Flaky.class);

            if (flaky == null) {
                throw throwable;
            }

            int maxRetries = flaky.maxRetries();
            String testName = context.getDisplayName();

            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    System.out.printf("[FLAKY] Retry attempt %d/%d for %s%n", attempt, maxRetries, testName);
                    // Re-invoke the test method
                    context.getRequiredTestMethod().invoke(context.getRequiredTestInstance());
                    System.out.printf("[FLAKY] Test %s passed on retry %d%n", testName, attempt);
                    return; // Success
                } catch (Throwable retryError) {
                    if (attempt == maxRetries) {
                        System.out.printf("[FLAKY] Test %s failed after %d retries%n", testName, maxRetries);
                        throw retryError;
                    }
                    // Wait before retry with exponential backoff
                    Thread.sleep(100L * (1 << attempt));
                }
            }

            throw throwable;
        }
    }
}
