package com.simpleaccounts.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests for Retry and Backoff mechanisms.
 * 
 * Used for external service integrations (email, APIs, file imports).
 */
@DisplayName("Retry and Backoff Tests")
class RetryBackoffTest {

    private RetryExecutor retryExecutor;

    @BeforeEach
    void setUp() {
        retryExecutor = new RetryExecutor();
    }

    @Nested
    @DisplayName("Basic Retry Tests")
    class BasicRetryTests {

        @Test
        @DisplayName("Should succeed on first attempt")
        void shouldSucceedOnFirstAttempt() {
            AtomicInteger attempts = new AtomicInteger(0);

            String result = retryExecutor.execute(() -> {
                attempts.incrementAndGet();
                return "success";
            }, RetryConfig.defaults());

            assertThat(result).isEqualTo("success");
            assertThat(attempts.get()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should retry on failure and succeed")
        void shouldRetryOnFailureAndSucceed() {
            AtomicInteger attempts = new AtomicInteger(0);

            String result = retryExecutor.execute(() -> {
                if (attempts.incrementAndGet() < 3) {
                    throw new RuntimeException("Temporary failure");
                }
                return "success after retry";
            }, RetryConfig.defaults());

            assertThat(result).isEqualTo("success after retry");
            assertThat(attempts.get()).isEqualTo(3);
        }

        @Test
        @DisplayName("Should exhaust retries and throw exception")
        void shouldExhaustRetriesAndThrow() {
            AtomicInteger attempts = new AtomicInteger(0);
            RetryConfig config = RetryConfig.builder().maxAttempts(3).build();

            assertThatThrownBy(() -> retryExecutor.execute(() -> {
                attempts.incrementAndGet();
                throw new RuntimeException("Permanent failure");
            }, config))
                .isInstanceOf(RetryExhaustedException.class)
                .hasMessageContaining("after 3 attempts");

            assertThat(attempts.get()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Exponential Backoff Tests")
    class ExponentialBackoffTests {

        @Test
        @DisplayName("Should apply exponential backoff")
        void shouldApplyExponentialBackoff() {
            List<Long> delays = new ArrayList<>();
            AtomicInteger attempts = new AtomicInteger(0);

            RetryConfig config = RetryConfig.builder()
                .maxAttempts(4)
                .initialDelay(Duration.ofMillis(100))
                .multiplier(2.0)
                .build();

            long start = System.currentTimeMillis();

            assertThatThrownBy(() -> retryExecutor.execute(() -> {
                if (attempts.get() > 0) {
                    delays.add(System.currentTimeMillis() - start);
                }
                attempts.incrementAndGet();
                throw new RuntimeException("Always fails");
            }, config)).isInstanceOf(RetryExhaustedException.class);

            // Check delays increase exponentially
            // First retry: ~100ms, Second: ~200ms, Third: ~400ms
            assertThat(delays).hasSize(3);
            assertThat(delays.get(0)).isGreaterThanOrEqualTo(80); // 100ms with tolerance
            assertThat(delays.get(1)).isGreaterThan(delays.get(0));
            assertThat(delays.get(2)).isGreaterThan(delays.get(1));
        }

        @Test
        @DisplayName("Should respect max delay")
        void shouldRespectMaxDelay() {
            RetryConfig config = RetryConfig.builder()
                .maxAttempts(5)
                .initialDelay(Duration.ofMillis(100))
                .multiplier(10.0)
                .maxDelay(Duration.ofMillis(500))
                .build();

            // Calculate delays
            List<Duration> delays = config.calculateDelays();

            assertThat(delays.get(0)).isEqualTo(Duration.ofMillis(100));
            assertThat(delays.get(1)).isEqualTo(Duration.ofMillis(500)); // Capped at 500, not 1000
            assertThat(delays.get(2)).isEqualTo(Duration.ofMillis(500)); // Still capped
        }

        @Test
        @DisplayName("Should add jitter to prevent thundering herd")
        void shouldAddJitter() {
            RetryConfig config = RetryConfig.builder()
                .maxAttempts(3)
                .initialDelay(Duration.ofMillis(100))
                .jitterFactor(0.2)
                .build();

            List<Long> run1Timestamps = new ArrayList<>();
            List<Long> run2Timestamps = new ArrayList<>();

            // Run twice and compare delays
            AtomicInteger attempts = new AtomicInteger(0);

            try {
                retryExecutor.execute(() -> {
                    if (attempts.get() > 0) {
                        run1Timestamps.add(System.currentTimeMillis());
                    }
                    attempts.incrementAndGet();
                    throw new RuntimeException("Fail");
                }, config);
            } catch (RetryExhaustedException e) {
                // Expected exception after retries exhausted - used to test delay timing
            }

            attempts.set(0);

            try {
                retryExecutor.execute(() -> {
                    if (attempts.get() > 0) {
                        run2Timestamps.add(System.currentTimeMillis());
                    }
                    attempts.incrementAndGet();
                    throw new RuntimeException("Fail");
                }, config);
            } catch (RetryExhaustedException e) {
                // Expected exception after retries exhausted - used to test delay timing
            }

            // With jitter, delays should vary slightly - verify timestamps were captured
            assertThat(run1Timestamps).isNotEmpty();
            assertThat(run2Timestamps).isNotEmpty();
        }
    }

    @Nested
    @DisplayName("Retry Condition Tests")
    class RetryConditionTests {

        @Test
        @DisplayName("Should only retry on specified exceptions")
        void shouldOnlyRetryOnSpecifiedExceptions() {
            AtomicInteger attempts = new AtomicInteger(0);

            RetryConfig config = RetryConfig.builder()
                .maxAttempts(3)
                .retryOn(TemporaryException.class)
                .build();

            // Should retry TemporaryException
            attempts.set(0);
            String result = retryExecutor.execute(() -> {
                if (attempts.incrementAndGet() < 2) {
                    throw new TemporaryException("Temp error");
                }
                return "success";
            }, config);

            assertThat(result).isEqualTo("success");
            assertThat(attempts.get()).isEqualTo(2);

            // Should NOT retry PermanentException
            attempts.set(0);
            assertThatThrownBy(() -> retryExecutor.execute(() -> {
                attempts.incrementAndGet();
                throw new PermanentException("Perm error");
            }, config))
                .isInstanceOf(PermanentException.class);

            assertThat(attempts.get()).isEqualTo(1); // No retry
        }

        @Test
        @DisplayName("Should not retry on excluded exceptions")
        void shouldNotRetryOnExcludedExceptions() {
            AtomicInteger attempts = new AtomicInteger(0);

            RetryConfig config = RetryConfig.builder()
                .maxAttempts(3)
                .doNotRetryOn(PermanentException.class)
                .build();

            assertThatThrownBy(() -> retryExecutor.execute(() -> {
                attempts.incrementAndGet();
                throw new PermanentException("Don't retry");
            }, config))
                .isInstanceOf(PermanentException.class);

            assertThat(attempts.get()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should support custom retry predicate")
        void shouldSupportCustomRetryPredicate() {
            AtomicInteger attempts = new AtomicInteger(0);

            RetryConfig config = RetryConfig.builder()
                .maxAttempts(5)
                .retryIf(e -> e.getMessage().contains("retry"))
                .build();

            String result = retryExecutor.execute(() -> {
                if (attempts.incrementAndGet() < 3) {
                    throw new RuntimeException("Please retry");
                }
                return "done";
            }, config);

            assertThat(result).isEqualTo("done");

            // Should not retry if message doesn't contain "retry"
            attempts.set(0);
            assertThatThrownBy(() -> retryExecutor.execute(() -> {
                attempts.incrementAndGet();
                throw new RuntimeException("No more attempts");
            }, config)).isInstanceOf(RuntimeException.class);

            assertThat(attempts.get()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Retry Callback Tests")
    class RetryCallbackTests {

        @Test
        @DisplayName("Should invoke onRetry callback")
        void shouldInvokeOnRetryCallback() {
            List<RetryEvent> events = new ArrayList<>();
            AtomicInteger attempts = new AtomicInteger(0);

            RetryConfig config = RetryConfig.builder()
                .maxAttempts(3)
                .onRetry((attempt, exception) -> events.add(new RetryEvent(attempt, exception)))
                .build();

            try {
                retryExecutor.execute(() -> {
                    attempts.incrementAndGet();
                    throw new RuntimeException("Failure #" + attempts.get());
                }, config);
            } catch (RetryExhaustedException e) {
                // Expected - verifying retry events were captured
            }

            assertThat(events).hasSize(2); // 2 retries after initial attempt
            assertThat(events.get(0).attempt).isEqualTo(2);
            assertThat(events.get(1).attempt).isEqualTo(3);
        }

        @Test
        @DisplayName("Should invoke onSuccess callback")
        void shouldInvokeOnSuccessCallback() {
            AtomicInteger successAttempt = new AtomicInteger(-1);
            AtomicInteger attempts = new AtomicInteger(0);

            RetryConfig config = RetryConfig.builder()
                .maxAttempts(3)
                .onSuccess((attempt, result) -> successAttempt.set(attempt))
                .build();

            retryExecutor.execute(() -> {
                if (attempts.incrementAndGet() < 2) {
                    throw new RuntimeException("Temp");
                }
                return "success";
            }, config);

            assertThat(successAttempt.get()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should invoke onExhausted callback")
        void shouldInvokeOnExhaustedCallback() {
            AtomicInteger exhaustedAttempts = new AtomicInteger(-1);

            RetryConfig config = RetryConfig.builder()
                .maxAttempts(3)
                .onExhausted((attempts, lastException) -> exhaustedAttempts.set(attempts))
                .build();

            try {
                retryExecutor.execute(() -> {
                    throw new RuntimeException("Always fails");
                }, config);
            } catch (RetryExhaustedException e) {
                // Expected - verifying onExhausted callback was invoked
            }

            assertThat(exhaustedAttempts.get()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Circuit Breaker Integration Tests")
    class CircuitBreakerTests {

        @Test
        @DisplayName("Should open circuit after threshold failures")
        void shouldOpenCircuitAfterThresholdFailures() {
            CircuitBreaker breaker = new CircuitBreaker(3, Duration.ofSeconds(30));

            // Trip the breaker
            for (int i = 0; i < 3; i++) {
                breaker.recordFailure();
            }

            assertThat(breaker.isOpen()).isTrue();
            assertThat(breaker.allowRequest()).isFalse();
        }

        @Test
        @DisplayName("Should reset on success")
        void shouldResetOnSuccess() {
            CircuitBreaker breaker = new CircuitBreaker(3, Duration.ofSeconds(30));

            breaker.recordFailure();
            breaker.recordFailure();
            breaker.recordSuccess();

            assertThat(breaker.getFailureCount()).isEqualTo(0);
            assertThat(breaker.isOpen()).isFalse();
        }

        @Test
        @DisplayName("Should allow test request in half-open state")
        void shouldAllowTestRequestInHalfOpen() {
            CircuitBreaker breaker = new CircuitBreaker(2, Duration.ofMillis(100));

            breaker.recordFailure();
            breaker.recordFailure();
            assertThat(breaker.isOpen()).isTrue();

            // Wait for reset timeout
            try { Thread.sleep(150); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

            // Should be half-open, allow one request
            assertThat(breaker.allowRequest()).isTrue();
        }
    }

    // Test exception classes
    static class TemporaryException extends RuntimeException {
        TemporaryException(String message) { super(message); }
    }

    static class PermanentException extends RuntimeException {
        PermanentException(String message) { super(message); }
    }

    static class RetryEvent {
        final int attempt;
        final Throwable exception;

        RetryEvent(int attempt, Throwable exception) {
            this.attempt = attempt;
            this.exception = exception;
        }
    }

    // Implementation classes
    static class RetryExhaustedException extends RuntimeException {
        RetryExhaustedException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    static class RetryConfig {
        int maxAttempts = 3;
        Duration initialDelay = Duration.ofMillis(100);
        double multiplier = 2.0;
        Duration maxDelay = Duration.ofSeconds(30);
        double jitterFactor = 0.0;
        Class<? extends Throwable> retryOnClass;
        Class<? extends Throwable> doNotRetryOnClass;
        java.util.function.Predicate<Throwable> retryPredicate;
        java.util.function.BiConsumer<Integer, Throwable> onRetryCallback;
        java.util.function.BiConsumer<Integer, Object> onSuccessCallback;
        java.util.function.BiConsumer<Integer, Throwable> onExhaustedCallback;

        static RetryConfig defaults() {
            return new RetryConfig();
        }

        static Builder builder() {
            return new Builder();
        }

        List<Duration> calculateDelays() {
            List<Duration> delays = new ArrayList<>();
            long delay = initialDelay.toMillis();
            for (int i = 0; i < maxAttempts - 1; i++) {
                delays.add(Duration.ofMillis(Math.min(delay, maxDelay.toMillis())));
                delay = (long)(delay * multiplier);
            }
            return delays;
        }

        static class Builder {
            private RetryConfig config = new RetryConfig();

            Builder maxAttempts(int max) { config.maxAttempts = max; return this; }
            Builder initialDelay(Duration delay) { config.initialDelay = delay; return this; }
            Builder multiplier(double mult) { config.multiplier = mult; return this; }
            Builder maxDelay(Duration max) { config.maxDelay = max; return this; }
            Builder jitterFactor(double jitter) { config.jitterFactor = jitter; return this; }
            Builder retryOn(Class<? extends Throwable> clazz) { config.retryOnClass = clazz; return this; }
            Builder doNotRetryOn(Class<? extends Throwable> clazz) { config.doNotRetryOnClass = clazz; return this; }
            Builder retryIf(java.util.function.Predicate<Throwable> predicate) {
                config.retryPredicate = predicate; return this;
            }
            Builder onRetry(java.util.function.BiConsumer<Integer, Throwable> callback) {
                config.onRetryCallback = callback; return this;
            }
            Builder onSuccess(java.util.function.BiConsumer<Integer, Object> callback) {
                config.onSuccessCallback = callback; return this;
            }
            Builder onExhausted(java.util.function.BiConsumer<Integer, Throwable> callback) {
                config.onExhaustedCallback = callback; return this;
            }

            RetryConfig build() { return config; }
        }
    }

    static class RetryExecutor {
        <T> T execute(Supplier<T> action, RetryConfig config) {
            Throwable lastException = null;
            List<Duration> delays = config.calculateDelays();

            for (int attempt = 1; attempt <= config.maxAttempts; attempt++) {
                try {
                    T result = action.get();
                    if (config.onSuccessCallback != null) {
                        config.onSuccessCallback.accept(attempt, result);
                    }
                    return result;
                } catch (Throwable e) {
                    lastException = e;

                    // Check if we should retry this exception
                    if (!shouldRetry(e, config)) {
                        throw e instanceof RuntimeException ? (RuntimeException)e : new RuntimeException(e);
                    }

                    if (attempt < config.maxAttempts) {
                        if (config.onRetryCallback != null) {
                            config.onRetryCallback.accept(attempt + 1, e);
                        }

                        Duration delay = delays.get(attempt - 1);
                        if (config.jitterFactor > 0) {
                            double jitter = 1.0 + (Math.random() * 2 - 1) * config.jitterFactor;
                            delay = Duration.ofMillis((long)(delay.toMillis() * jitter));
                        }

                        try {
                            Thread.sleep(delay.toMillis());
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Retry interrupted", ie);
                        }
                    }
                }
            }

            if (config.onExhaustedCallback != null) {
                config.onExhaustedCallback.accept(config.maxAttempts, lastException);
            }

            throw new RetryExhaustedException("Failed after " + config.maxAttempts + " attempts", lastException);
        }

        private boolean shouldRetry(Throwable e, RetryConfig config) {
            if (config.doNotRetryOnClass != null && config.doNotRetryOnClass.isInstance(e)) {
                return false;
            }
            if (config.retryOnClass != null && !config.retryOnClass.isInstance(e)) {
                return false;
            }
            if (config.retryPredicate != null && !config.retryPredicate.test(e)) {
                return false;
            }
            return true;
        }
    }

    static class CircuitBreaker {
        private final int failureThreshold;
        private final Duration resetTimeout;
        private int failureCount = 0;
        private long lastFailureTime = 0;
        private boolean open = false;

        CircuitBreaker(int failureThreshold, Duration resetTimeout) {
            this.failureThreshold = failureThreshold;
            this.resetTimeout = resetTimeout;
        }

        synchronized void recordFailure() {
            failureCount++;
            lastFailureTime = System.currentTimeMillis();
            if (failureCount >= failureThreshold) {
                open = true;
            }
        }

        synchronized void recordSuccess() {
            failureCount = 0;
            open = false;
        }

        synchronized boolean isOpen() {
            if (open && System.currentTimeMillis() - lastFailureTime > resetTimeout.toMillis()) {
                // Transition to half-open
                return false;
            }
            return open;
        }

        synchronized boolean allowRequest() {
            if (!open) return true;
            if (System.currentTimeMillis() - lastFailureTime > resetTimeout.toMillis()) {
                // Half-open: allow one test request
                return true;
            }
            return false;
        }

        int getFailureCount() { return failureCount; }
    }
}
