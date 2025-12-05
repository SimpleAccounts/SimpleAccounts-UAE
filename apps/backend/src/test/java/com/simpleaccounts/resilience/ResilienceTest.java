package com.simpleaccounts.resilience;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Resilience Tests for SimpleAccounts-UAE.
 *
 * Tests fault tolerance, circuit breakers, timeouts, and retry mechanisms.
 * Uses simulated fault injection (Toxiproxy patterns) for testing resilience.
 *
 * In production, use actual Toxiproxy container for network-level fault injection.
 */
@DisplayName("Resilience Tests")
class ResilienceTest {

    private FaultInjector faultInjector;
    private CircuitBreaker circuitBreaker;
    private RetryPolicy retryPolicy;

    @BeforeEach
    void setUp() {
        faultInjector = new FaultInjector();
        circuitBreaker = new CircuitBreaker(5, Duration.ofSeconds(30));
        retryPolicy = new RetryPolicy(3, Duration.ofMillis(100));
    }

    @Nested
    @DisplayName("Network Latency Tests")
    class NetworkLatencyTests {

        @Test
        @DisplayName("Should handle slow responses gracefully")
        @Timeout(10)
        void shouldHandleSlowResponses() throws Exception {
            faultInjector.addLatency(Duration.ofMillis(500));

            long startTime = System.currentTimeMillis();
            String result = faultInjector.executeWithFaults(() -> "success");
            long duration = System.currentTimeMillis() - startTime;

            assertThat(result).isEqualTo("success");
            assertThat(duration).isGreaterThanOrEqualTo(500);
        }

        @Test
        @DisplayName("Should timeout on excessive latency")
        void shouldTimeoutOnExcessiveLatency() {
            faultInjector.addLatency(Duration.ofSeconds(10));

            assertThatThrownBy(() -> faultInjector.executeWithFaultsWithTimeout(() -> "success", Duration.ofMillis(500)))
                .isInstanceOf(java.util.concurrent.TimeoutException.class);
        }

        @Test
        @DisplayName("Should handle intermittent latency spikes")
        void shouldHandleIntermittentLatencySpikes() throws Exception {
            faultInjector.addIntermittentLatency(Duration.ofMillis(500), 0.3); // 30% chance

            int successCount = 0;
            int totalCalls = 20;

            for (int i = 0; i < totalCalls; i++) {
                try {
                    faultInjector.executeWithFaultsWithTimeout(() -> "success", Duration.ofSeconds(1));
                    successCount++;
                } catch (Exception e) {
                    // Expected for some calls
                }
            }

            assertThat(successCount).isGreaterThan(0);
        }
    }

    @Nested
    @DisplayName("Connection Failure Tests")
    class ConnectionFailureTests {

        @Test
        @DisplayName("Should retry on transient connection failure")
        void shouldRetryOnTransientConnectionFailure() throws Exception {
            AtomicInteger attempts = new AtomicInteger(0);
            faultInjector.addConnectionFailure(2); // Fail first 2 attempts

            String result = retryPolicy.execute(() -> {
                attempts.incrementAndGet();
                try {
                    return faultInjector.executeWithFaults(() -> "success");
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });

            assertThat(result).isEqualTo("success");
            assertThat(attempts.get()).isEqualTo(3); // 2 failures + 1 success
        }

        @Test
        @DisplayName("Should fail after max retries exceeded")
        void shouldFailAfterMaxRetriesExceeded() {
            faultInjector.addConnectionFailure(10); // Always fail

            assertThatThrownBy(() -> retryPolicy.execute(() -> {
                try {
                    return faultInjector.executeWithFaults(() -> "success");
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })).isInstanceOf(RuntimeException.class)
              .hasMessageContaining("Max retries exceeded");
        }

        @Test
        @DisplayName("Should not retry on non-retryable errors")
        void shouldNotRetryOnNonRetryableErrors() {
            AtomicInteger attempts = new AtomicInteger(0);
            retryPolicy.setRetryableExceptions(IOException.class);

            assertThatThrownBy(() -> retryPolicy.execute(() -> {
                attempts.incrementAndGet();
                throw new IllegalArgumentException("Bad request");
            })).isInstanceOf(RuntimeException.class)
              .hasCauseInstanceOf(IllegalArgumentException.class);

            assertThat(attempts.get()).isEqualTo(1); // No retry
        }
    }

    @Nested
    @DisplayName("Circuit Breaker Tests")
    class CircuitBreakerTests {

        @Test
        @DisplayName("Should open circuit after threshold failures")
        void shouldOpenCircuitAfterThresholdFailures() {
            // Trigger 5 failures
            for (int i = 0; i < 5; i++) {
                try {
                    circuitBreaker.execute(() -> {
                        throw new RuntimeException("Service unavailable");
                    });
                } catch (Exception e) {
                    // Expected
                }
            }

            assertThat(circuitBreaker.isOpen()).isTrue();

            // Should fail fast without executing
            assertThatThrownBy(() -> circuitBreaker.execute(() -> "success"))
                .isInstanceOf(CircuitBreakerOpenException.class);
        }

        @Test
        @DisplayName("Should allow half-open state after cooldown")
        void shouldAllowHalfOpenStateAfterCooldown() throws Exception {
            circuitBreaker = new CircuitBreaker(2, Duration.ofMillis(100));

            // Open the circuit
            for (int i = 0; i < 2; i++) {
                try {
                    circuitBreaker.execute(() -> {
                        throw new RuntimeException("Failure");
                    });
                } catch (Exception e) {
                    // Expected
                }
            }

            assertThat(circuitBreaker.isOpen()).isTrue();

            // Wait for cooldown
            Thread.sleep(150);

            // Trigger state update by attempting an operation
            // After cooldown, circuit should transition to half-open and allow the request
            String result = circuitBreaker.execute(() -> "success");
            assertThat(result).isEqualTo("success");

            // After successful execution in half-open, circuit should be closed
            assertThat(circuitBreaker.isClosed()).isTrue();
        }

        @Test
        @DisplayName("Should close circuit on successful request in half-open state")
        void shouldCloseCircuitOnSuccessInHalfOpenState() throws Exception {
            circuitBreaker = new CircuitBreaker(2, Duration.ofMillis(100));

            // Open the circuit
            for (int i = 0; i < 2; i++) {
                try {
                    circuitBreaker.execute(() -> {
                        throw new RuntimeException("Failure");
                    });
                } catch (Exception e) {
                    // Expected
                }
            }

            // Wait for cooldown
            Thread.sleep(150);

            // Success in half-open state should close circuit
            String result = circuitBreaker.execute(() -> "success");

            assertThat(result).isEqualTo("success");
            assertThat(circuitBreaker.isClosed()).isTrue();
        }

        @Test
        @DisplayName("Should re-open circuit on failure in half-open state")
        void shouldReopenCircuitOnFailureInHalfOpenState() throws Exception {
            circuitBreaker = new CircuitBreaker(2, Duration.ofMillis(100));

            // Open the circuit
            for (int i = 0; i < 2; i++) {
                try {
                    circuitBreaker.execute(() -> {
                        throw new RuntimeException("Failure");
                    });
                } catch (Exception e) {
                    // Expected
                }
            }

            // Wait for cooldown
            Thread.sleep(150);

            // Failure in half-open state should re-open circuit
            try {
                circuitBreaker.execute(() -> {
                    throw new RuntimeException("Still failing");
                });
            } catch (Exception e) {
                // Expected
            }

            assertThat(circuitBreaker.isOpen()).isTrue();
        }
    }

    @Nested
    @DisplayName("Bulkhead Pattern Tests")
    class BulkheadTests {

        @Test
        @DisplayName("Should limit concurrent requests")
        void shouldLimitConcurrentRequests() throws Exception {
            Bulkhead bulkhead = new Bulkhead(3); // Max 3 concurrent
            AtomicInteger concurrentCount = new AtomicInteger(0);
            AtomicInteger maxConcurrent = new AtomicInteger(0);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch endLatch = new CountDownLatch(5);

            ExecutorService executor = Executors.newFixedThreadPool(5);

            for (int i = 0; i < 5; i++) {
                executor.submit(() -> {
                    try {
                        startLatch.await();
                        bulkhead.execute(() -> {
                            int current = concurrentCount.incrementAndGet();
                            maxConcurrent.updateAndGet(max -> Math.max(max, current));
                            Thread.sleep(100);
                            concurrentCount.decrementAndGet();
                            return "done";
                        });
                    } catch (Exception e) {
                        // Some may be rejected
                    } finally {
                        endLatch.countDown();
                    }
                });
            }

            startLatch.countDown();
            endLatch.await(5, TimeUnit.SECONDS);
            executor.shutdown();

            assertThat(maxConcurrent.get()).isLessThanOrEqualTo(3);
        }

        @Test
        @DisplayName("Should reject requests when bulkhead is full")
        void shouldRejectWhenBulkheadFull() throws Exception {
            Bulkhead bulkhead = new Bulkhead(1);
            CountDownLatch blockingLatch = new CountDownLatch(1);
            AtomicInteger rejectedCount = new AtomicInteger(0);

            // Start a blocking request
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.submit(() -> {
                try {
                    bulkhead.execute(() -> {
                        blockingLatch.await();
                        return "done";
                    });
                } catch (Exception e) {
                    // Ignore
                }
            });

            // Give time for first request to acquire permit
            Thread.sleep(50);

            // Second request should be rejected
            try {
                bulkhead.tryExecute(() -> "should fail", Duration.ofMillis(100));
            } catch (BulkheadFullException e) {
                rejectedCount.incrementAndGet();
            }

            blockingLatch.countDown();
            executor.shutdown();

            assertThat(rejectedCount.get()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Timeout Pattern Tests")
    class TimeoutTests {

        @Test
        @DisplayName("Should timeout slow operations")
        void shouldTimeoutSlowOperations() {
            TimeoutWrapper timeout = new TimeoutWrapper(Duration.ofMillis(100));

            assertThatThrownBy(() -> timeout.execute(() -> {
                Thread.sleep(500);
                return "success";
            })).isInstanceOf(TimeoutException.class);
        }

        @Test
        @DisplayName("Should complete fast operations within timeout")
        void shouldCompleteFastOperationsWithinTimeout() throws Exception {
            TimeoutWrapper timeout = new TimeoutWrapper(Duration.ofSeconds(1));

            String result = timeout.execute(() -> {
                Thread.sleep(50);
                return "success";
            });

            assertThat(result).isEqualTo("success");
        }
    }

    @Nested
    @DisplayName("Fallback Pattern Tests")
    class FallbackTests {

        @Test
        @DisplayName("Should use fallback on failure")
        void shouldUseFallbackOnFailure() {
            FallbackWrapper<String> fallback = new FallbackWrapper<>(
                () -> { throw new RuntimeException("Primary failed"); },
                () -> "fallback value"
            );

            String result = fallback.execute();

            assertThat(result).isEqualTo("fallback value");
        }

        @Test
        @DisplayName("Should use primary when successful")
        void shouldUsePrimaryWhenSuccessful() {
            FallbackWrapper<String> fallback = new FallbackWrapper<>(
                () -> "primary value",
                () -> "fallback value"
            );

            String result = fallback.execute();

            assertThat(result).isEqualTo("primary value");
        }

        @Test
        @DisplayName("Should cache fallback results")
        void shouldCacheFallbackResults() {
            AtomicInteger fallbackCalls = new AtomicInteger(0);
            CachingFallback<String> cachingFallback = new CachingFallback<>(
                () -> { throw new RuntimeException("Always fails"); },
                () -> {
                    fallbackCalls.incrementAndGet();
                    return "cached fallback";
                },
                Duration.ofSeconds(10)
            );

            // Multiple calls should only invoke fallback once
            cachingFallback.execute();
            cachingFallback.execute();
            cachingFallback.execute();

            assertThat(fallbackCalls.get()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Database Connection Resilience Tests")
    class DatabaseResilienceTests {

        @Test
        @DisplayName("Should handle connection pool exhaustion")
        void shouldHandleConnectionPoolExhaustion() {
            ConnectionPool pool = new ConnectionPool(2);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failCount = new AtomicInteger(0);
            CountDownLatch latch = new CountDownLatch(5);

            ExecutorService executor = Executors.newFixedThreadPool(5);
            for (int i = 0; i < 5; i++) {
                executor.submit(() -> {
                    try {
                        pool.withConnection(conn -> {
                            Thread.sleep(100);
                            return "result";
                        }, Duration.ofMillis(50));
                        successCount.incrementAndGet();
                    } catch (Exception e) {
                        failCount.incrementAndGet();
                    } finally {
                        latch.countDown();
                    }
                });
            }

            try {
                latch.await(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            executor.shutdown();

            // Some should succeed (got connections), some should fail (timeout waiting)
            assertThat(successCount.get()).isGreaterThan(0);
            assertThat(failCount.get()).isGreaterThan(0);
        }

        @Test
        @DisplayName("Should retry on transient database errors")
        void shouldRetryOnTransientDatabaseErrors() {
            AtomicInteger attempts = new AtomicInteger(0);
            DatabaseOperation operation = new DatabaseOperation(3); // Fail 3 times

            String result = retryPolicy.execute(() -> {
                attempts.incrementAndGet();
                return operation.execute();
            });

            assertThat(result).isEqualTo("success");
            assertThat(attempts.get()).isEqualTo(4); // 3 failures + 1 success
        }
    }

    // Fault injection implementation for testing
    static class FaultInjector {
        private Duration latency = Duration.ZERO;
        private Duration timeout = Duration.ofSeconds(30);
        private double intermittentLatencyChance = 0;
        private Duration intermittentLatency = Duration.ZERO;
        private int connectionFailuresRemaining = 0;

        void addLatency(Duration latency) {
            this.latency = latency;
        }

        void setTimeout(Duration timeout) {
            this.timeout = timeout;
        }

        void addIntermittentLatency(Duration latency, double chance) {
            this.intermittentLatency = latency;
            this.intermittentLatencyChance = chance;
        }

        void addConnectionFailure(int times) {
            this.connectionFailuresRemaining = times;
        }

        <T> T executeWithFaults(Supplier<T> operation) throws Exception {
            if (connectionFailuresRemaining > 0) {
                connectionFailuresRemaining--;
                throw new IOException("Connection refused");
            }

            Duration actualLatency = latency;
            if (Math.random() < intermittentLatencyChance) {
                actualLatency = intermittentLatency;
            }

            if (!actualLatency.isZero()) {
                Thread.sleep(actualLatency.toMillis());
            }

            return operation.get();
        }

        <T> T executeWithFaultsWithTimeout(Supplier<T> operation, Duration timeout) throws Exception {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            Future<T> future = executor.submit(() -> executeWithFaults(operation));
            try {
                return future.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
            } finally {
                executor.shutdownNow();
            }
        }
    }

    // Circuit breaker implementation
    static class CircuitBreaker {
        private final int failureThreshold;
        private final Duration cooldownPeriod;
        private int failureCount = 0;
        private long lastFailureTime = 0;
        private State state = State.CLOSED;

        enum State { CLOSED, OPEN, HALF_OPEN }

        CircuitBreaker(int failureThreshold, Duration cooldownPeriod) {
            this.failureThreshold = failureThreshold;
            this.cooldownPeriod = cooldownPeriod;
        }

        synchronized <T> T execute(Supplier<T> operation) {
            updateState();

            if (state == State.OPEN) {
                throw new CircuitBreakerOpenException("Circuit breaker is open");
            }

            try {
                T result = operation.get();
                onSuccess();
                return result;
            } catch (Exception e) {
                onFailure();
                throw e;
            }
        }

        private synchronized void updateState() {
            if (state == State.OPEN) {
                long elapsed = System.currentTimeMillis() - lastFailureTime;
                if (elapsed >= cooldownPeriod.toMillis()) {
                    state = State.HALF_OPEN;
                }
            }
        }

        private synchronized void onSuccess() {
            failureCount = 0;
            state = State.CLOSED;
        }

        private synchronized void onFailure() {
            failureCount++;
            lastFailureTime = System.currentTimeMillis();
            if (failureCount >= failureThreshold) {
                state = State.OPEN;
            }
        }

        boolean isOpen() { return state == State.OPEN; }
        boolean isClosed() { return state == State.CLOSED; }
        boolean isHalfOpen() { return state == State.HALF_OPEN; }
    }

    static class CircuitBreakerOpenException extends RuntimeException {
        CircuitBreakerOpenException(String message) { super(message); }
    }

    // Retry policy implementation
    static class RetryPolicy {
        private final int maxRetries;
        private final Duration delay;
        private Class<? extends Exception>[] retryableExceptions;

        @SuppressWarnings("unchecked")
        RetryPolicy(int maxRetries, Duration delay) {
            this.maxRetries = maxRetries;
            this.delay = delay;
            this.retryableExceptions = new Class[] { Exception.class };
        }

        @SafeVarargs
        final void setRetryableExceptions(Class<? extends Exception>... exceptions) {
            this.retryableExceptions = exceptions;
        }

        <T> T execute(Supplier<T> operation) {
            Exception lastException = null;
            for (int attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    return operation.get();
                } catch (Exception e) {
                    lastException = e;
                    if (!isRetryable(e)) {
                        throw new RuntimeException(e);
                    }
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(delay.toMillis() * (attempt + 1)); // Exponential backoff
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Interrupted during retry", ie);
                        }
                    }
                }
            }
            throw new RuntimeException("Max retries exceeded", lastException);
        }

        private boolean isRetryable(Exception e) {
            for (Class<? extends Exception> retryable : retryableExceptions) {
                if (retryable.isInstance(e)) {
                    return true;
                }
            }
            return false;
        }
    }

    // Bulkhead implementation
    static class Bulkhead {
        private final Semaphore semaphore;

        Bulkhead(int maxConcurrent) {
            this.semaphore = new Semaphore(maxConcurrent);
        }

        <T> T execute(Callable<T> operation) throws Exception {
            semaphore.acquire();
            try {
                return operation.call();
            } finally {
                semaphore.release();
            }
        }

        <T> T tryExecute(Callable<T> operation, Duration timeout) throws Exception {
            if (!semaphore.tryAcquire(timeout.toMillis(), TimeUnit.MILLISECONDS)) {
                throw new BulkheadFullException("Bulkhead is full");
            }
            try {
                return operation.call();
            } finally {
                semaphore.release();
            }
        }
    }

    static class BulkheadFullException extends RuntimeException {
        BulkheadFullException(String message) { super(message); }
    }

    // Timeout wrapper implementation
    static class TimeoutWrapper {
        private final Duration timeout;

        TimeoutWrapper(Duration timeout) {
            this.timeout = timeout;
        }

        <T> T execute(Callable<T> operation) throws Exception {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            Future<T> future = executor.submit(operation);
            try {
                return future.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
            } catch (java.util.concurrent.TimeoutException e) {
                future.cancel(true);
                throw new TimeoutException("Operation timed out");
            } finally {
                executor.shutdownNow();
            }
        }
    }

    static class TimeoutException extends Exception {
        TimeoutException(String message) { super(message); }
    }

    // Fallback implementation
    static class FallbackWrapper<T> {
        private final Supplier<T> primary;
        private final Supplier<T> fallback;

        FallbackWrapper(Supplier<T> primary, Supplier<T> fallback) {
            this.primary = primary;
            this.fallback = fallback;
        }

        T execute() {
            try {
                return primary.get();
            } catch (Exception e) {
                return fallback.get();
            }
        }
    }

    static class CachingFallback<T> {
        private final Supplier<T> primary;
        private final Supplier<T> fallback;
        private final Duration cacheDuration;
        private T cachedValue;
        private long cacheTime = 0;

        CachingFallback(Supplier<T> primary, Supplier<T> fallback, Duration cacheDuration) {
            this.primary = primary;
            this.fallback = fallback;
            this.cacheDuration = cacheDuration;
        }

        synchronized T execute() {
            try {
                return primary.get();
            } catch (Exception e) {
                if (cachedValue != null && System.currentTimeMillis() - cacheTime < cacheDuration.toMillis()) {
                    return cachedValue;
                }
                cachedValue = fallback.get();
                cacheTime = System.currentTimeMillis();
                return cachedValue;
            }
        }
    }

    // Connection pool implementation
    static class ConnectionPool {
        private final Semaphore semaphore;

        ConnectionPool(int maxConnections) {
            this.semaphore = new Semaphore(maxConnections);
        }

        <T> T withConnection(ConnectionConsumer<T> consumer, Duration timeout) throws Exception {
            if (!semaphore.tryAcquire(timeout.toMillis(), TimeUnit.MILLISECONDS)) {
                throw new RuntimeException("Connection pool exhausted");
            }
            try {
                return consumer.accept(new Object()); // Simulated connection
            } finally {
                semaphore.release();
            }
        }

        interface ConnectionConsumer<T> {
            T accept(Object connection) throws Exception;
        }
    }

    // Database operation with transient failures
    static class DatabaseOperation {
        private int failuresRemaining;

        DatabaseOperation(int failures) {
            this.failuresRemaining = failures;
        }

        String execute() {
            if (failuresRemaining > 0) {
                failuresRemaining--;
                throw new RuntimeException("Transient database error");
            }
            return "success";
        }
    }
}
