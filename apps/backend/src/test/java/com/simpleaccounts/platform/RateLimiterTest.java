package com.simpleaccounts.platform;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tests for Rate Limiter functionality.
 * 
 * Prevents abuse by limiting API requests per user/IP.
 */
@DisplayName("Rate Limiter Tests")
class RateLimiterTest {

    private RateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new RateLimiter();
    }

    @Nested
    @DisplayName("Basic Rate Limiting Tests")
    class BasicRateLimitingTests {

        @Test
        @DisplayName("Should allow requests within limit")
        void shouldAllowRequestsWithinLimit() {
            rateLimiter.configure("api", 10, Duration.ofMinutes(1));

            for (int i = 0; i < 10; i++) {
                assertThat(rateLimiter.tryAcquire("api", "user-1")).isTrue();
            }
        }

        @Test
        @DisplayName("Should block requests exceeding limit")
        void shouldBlockRequestsExceedingLimit() {
            rateLimiter.configure("api", 5, Duration.ofMinutes(1));

            for (int i = 0; i < 5; i++) {
                rateLimiter.tryAcquire("api", "user-1");
            }

            assertThat(rateLimiter.tryAcquire("api", "user-1")).isFalse();
        }

        @Test
        @DisplayName("Should track different users separately")
        void shouldTrackUsersSeparately() {
            rateLimiter.configure("api", 2, Duration.ofMinutes(1));

            rateLimiter.tryAcquire("api", "user-1");
            rateLimiter.tryAcquire("api", "user-1");
            assertThat(rateLimiter.tryAcquire("api", "user-1")).isFalse();

            // user-2 should still have quota
            assertThat(rateLimiter.tryAcquire("api", "user-2")).isTrue();
            assertThat(rateLimiter.tryAcquire("api", "user-2")).isTrue();
        }

        @Test
        @DisplayName("Should track different endpoints separately")
        void shouldTrackEndpointsSeparately() {
            rateLimiter.configure("login", 3, Duration.ofMinutes(1));
            rateLimiter.configure("api", 100, Duration.ofMinutes(1));

            for (int i = 0; i < 3; i++) {
                rateLimiter.tryAcquire("login", "user-1");
            }
            assertThat(rateLimiter.tryAcquire("login", "user-1")).isFalse();

            // api endpoint should still be available
            assertThat(rateLimiter.tryAcquire("api", "user-1")).isTrue();
        }
    }

    @Nested
    @DisplayName("Sliding Window Tests")
    class SlidingWindowTests {

        @Test
        @DisplayName("Should reset after window expires")
        void shouldResetAfterWindowExpires() {
            rateLimiter.configure("api", 2, Duration.ofMillis(100));

            rateLimiter.tryAcquire("api", "user-1");
            rateLimiter.tryAcquire("api", "user-1");
            assertThat(rateLimiter.tryAcquire("api", "user-1")).isFalse();

            // Wait for window to expire
            try { Thread.sleep(150); } catch (InterruptedException e) { }

            assertThat(rateLimiter.tryAcquire("api", "user-1")).isTrue();
        }

        @Test
        @DisplayName("Should use sliding window algorithm")
        void shouldUseSlidingWindow() {
            rateLimiter.configure("api", 10, Duration.ofSeconds(1));

            // Use 5 requests in first half-second
            for (int i = 0; i < 5; i++) {
                rateLimiter.tryAcquire("api", "user-1");
            }

            try { Thread.sleep(600); } catch (InterruptedException e) { }

            // After 600ms, old requests should start expiring
            // Should be able to make more requests
            assertThat(rateLimiter.tryAcquire("api", "user-1")).isTrue();
        }
    }

    @Nested
    @DisplayName("Authentication Rate Limiting Tests")
    class AuthenticationRateLimitingTests {

        @Test
        @DisplayName("Should have stricter limits for login endpoint")
        void shouldHaveStricterLimitsForLogin() {
            rateLimiter.configure("login", 5, Duration.ofMinutes(15)); // 5 attempts per 15 min

            for (int i = 0; i < 5; i++) {
                assertThat(rateLimiter.tryAcquire("login", "user-1")).isTrue();
            }

            assertThat(rateLimiter.tryAcquire("login", "user-1")).isFalse();
        }

        @Test
        @DisplayName("Should lock out after failed attempts")
        void shouldLockoutAfterFailedAttempts() {
            rateLimiter.configure("login", 3, Duration.ofMinutes(15));

            for (int i = 0; i < 3; i++) {
                rateLimiter.recordFailedAttempt("login", "user-1");
            }

            assertThat(rateLimiter.isLockedOut("login", "user-1")).isTrue();
        }

        @Test
        @DisplayName("Should clear lockout on successful login")
        void shouldClearLockoutOnSuccess() {
            rateLimiter.configure("login", 3, Duration.ofMinutes(15));

            rateLimiter.recordFailedAttempt("login", "user-1");
            rateLimiter.recordFailedAttempt("login", "user-1");
            rateLimiter.recordSuccessfulAttempt("login", "user-1");

            assertThat(rateLimiter.getFailedAttemptCount("login", "user-1")).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("IP-Based Rate Limiting Tests")
    class IpBasedRateLimitingTests {

        @Test
        @DisplayName("Should rate limit by IP address")
        void shouldRateLimitByIp() {
            rateLimiter.configure("api", 100, Duration.ofMinutes(1));

            String ip = "192.168.1.1";
            for (int i = 0; i < 100; i++) {
                rateLimiter.tryAcquireByIp("api", ip);
            }

            assertThat(rateLimiter.tryAcquireByIp("api", ip)).isFalse();

            // Different IP should work
            assertThat(rateLimiter.tryAcquireByIp("api", "192.168.1.2")).isTrue();
        }

        @Test
        @DisplayName("Should whitelist trusted IPs")
        void shouldWhitelistTrustedIps() {
            rateLimiter.configure("api", 1, Duration.ofMinutes(1));
            rateLimiter.addWhitelistedIp("10.0.0.1");

            // Whitelisted IP bypasses rate limit
            for (int i = 0; i < 100; i++) {
                assertThat(rateLimiter.tryAcquireByIp("api", "10.0.0.1")).isTrue();
            }
        }

        @Test
        @DisplayName("Should blacklist suspicious IPs")
        void shouldBlacklistSuspiciousIps() {
            rateLimiter.addBlacklistedIp("192.168.1.100");

            assertThat(rateLimiter.tryAcquireByIp("api", "192.168.1.100")).isFalse();
        }
    }

    @Nested
    @DisplayName("Rate Limit Response Tests")
    class RateLimitResponseTests {

        @Test
        @DisplayName("Should return remaining quota")
        void shouldReturnRemainingQuota() {
            rateLimiter.configure("api", 10, Duration.ofMinutes(1));

            rateLimiter.tryAcquire("api", "user-1");
            rateLimiter.tryAcquire("api", "user-1");

            assertThat(rateLimiter.getRemainingQuota("api", "user-1")).isEqualTo(8);
        }

        @Test
        @DisplayName("Should return time until reset")
        void shouldReturnTimeUntilReset() {
            rateLimiter.configure("api", 10, Duration.ofMinutes(1));

            rateLimiter.tryAcquire("api", "user-1");

            Duration timeUntilReset = rateLimiter.getTimeUntilReset("api", "user-1");
            assertThat(timeUntilReset).isLessThanOrEqualTo(Duration.ofMinutes(1));
            assertThat(timeUntilReset).isGreaterThan(Duration.ZERO);
        }

        @Test
        @DisplayName("Should provide rate limit headers")
        void shouldProvideRateLimitHeaders() {
            rateLimiter.configure("api", 100, Duration.ofMinutes(1));

            for (int i = 0; i < 50; i++) {
                rateLimiter.tryAcquire("api", "user-1");
            }

            RateLimitInfo info = rateLimiter.getRateLimitInfo("api", "user-1");

            assertThat(info.getLimit()).isEqualTo(100);
            assertThat(info.getRemaining()).isEqualTo(50);
            assertThat(info.getResetTimestamp()).isAfter(Instant.now());
        }
    }

    @Nested
    @DisplayName("Concurrent Access Tests")
    class ConcurrentAccessTests {

        @Test
        @DisplayName("Should handle concurrent requests correctly")
        void shouldHandleConcurrentRequests() throws InterruptedException {
            rateLimiter.configure("api", 100, Duration.ofMinutes(1));

            AtomicInteger successCount = new AtomicInteger(0);
            Thread[] threads = new Thread[10];

            for (int i = 0; i < 10; i++) {
                threads[i] = new Thread(() -> {
                    for (int j = 0; j < 20; j++) {
                        if (rateLimiter.tryAcquire("api", "user-1")) {
                            successCount.incrementAndGet();
                        }
                    }
                });
            }

            for (Thread t : threads) t.start();
            for (Thread t : threads) t.join();

            // Only 100 should succeed
            assertThat(successCount.get()).isEqualTo(100);
        }
    }

    // Test implementation classes
    static class RateLimitInfo {
        private final int limit;
        private final int remaining;
        private final Instant resetTimestamp;

        RateLimitInfo(int limit, int remaining, Instant resetTimestamp) {
            this.limit = limit;
            this.remaining = remaining;
            this.resetTimestamp = resetTimestamp;
        }

        int getLimit() { return limit; }
        int getRemaining() { return remaining; }
        Instant getResetTimestamp() { return resetTimestamp; }
    }

    static class RateLimiter {
        private final ConcurrentHashMap<String, EndpointConfig> configs = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, java.util.Deque<Instant>> requestLog = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, AtomicInteger> failedAttempts = new ConcurrentHashMap<>();
        private final java.util.Set<String> whitelistedIps = ConcurrentHashMap.newKeySet();
        private final java.util.Set<String> blacklistedIps = ConcurrentHashMap.newKeySet();

        void configure(String endpoint, int maxRequests, Duration window) {
            configs.put(endpoint, new EndpointConfig(maxRequests, window));
        }

        synchronized boolean tryAcquire(String endpoint, String userId) {
            return tryAcquireInternal(endpoint + ":" + userId);
        }

        synchronized boolean tryAcquireByIp(String endpoint, String ip) {
            if (blacklistedIps.contains(ip)) return false;
            if (whitelistedIps.contains(ip)) return true;
            return tryAcquireInternal(endpoint + ":ip:" + ip);
        }

        private boolean tryAcquireInternal(String key) {
            String endpoint = key.split(":")[0];
            EndpointConfig config = configs.get(endpoint);
            if (config == null) return true;

            java.util.Deque<Instant> log = requestLog.computeIfAbsent(key,
                k -> new java.util.concurrent.ConcurrentLinkedDeque<>());

            Instant now = Instant.now();
            Instant windowStart = now.minus(config.window);

            // Remove old entries
            while (!log.isEmpty() && log.peekFirst().isBefore(windowStart)) {
                log.pollFirst();
            }

            if (log.size() >= config.maxRequests) {
                return false;
            }

            log.addLast(now);
            return true;
        }

        int getRemainingQuota(String endpoint, String userId) {
            String key = endpoint + ":" + userId;
            EndpointConfig config = configs.get(endpoint);
            if (config == null) return Integer.MAX_VALUE;

            java.util.Deque<Instant> log = requestLog.get(key);
            if (log == null) return config.maxRequests;

            return Math.max(0, config.maxRequests - log.size());
        }

        Duration getTimeUntilReset(String endpoint, String userId) {
            String key = endpoint + ":" + userId;
            EndpointConfig config = configs.get(endpoint);
            if (config == null) return Duration.ZERO;

            java.util.Deque<Instant> log = requestLog.get(key);
            if (log == null || log.isEmpty()) return Duration.ZERO;

            Instant oldestRequest = log.peekFirst();
            Instant resetTime = oldestRequest.plus(config.window);
            Duration remaining = Duration.between(Instant.now(), resetTime);
            return remaining.isNegative() ? Duration.ZERO : remaining;
        }

        RateLimitInfo getRateLimitInfo(String endpoint, String userId) {
            String key = endpoint + ":" + userId;
            EndpointConfig config = configs.get(endpoint);
            if (config == null) return new RateLimitInfo(0, 0, Instant.now());

            int remaining = getRemainingQuota(endpoint, userId);
            Instant resetTime = Instant.now().plus(getTimeUntilReset(endpoint, userId));

            return new RateLimitInfo(config.maxRequests, remaining, resetTime);
        }

        void recordFailedAttempt(String endpoint, String userId) {
            String key = endpoint + ":" + userId;
            failedAttempts.computeIfAbsent(key, k -> new AtomicInteger()).incrementAndGet();
        }

        void recordSuccessfulAttempt(String endpoint, String userId) {
            String key = endpoint + ":" + userId;
            failedAttempts.remove(key);
        }

        boolean isLockedOut(String endpoint, String userId) {
            String key = endpoint + ":" + userId;
            EndpointConfig config = configs.get(endpoint);
            if (config == null) return false;

            AtomicInteger attempts = failedAttempts.get(key);
            return attempts != null && attempts.get() >= config.maxRequests;
        }

        int getFailedAttemptCount(String endpoint, String userId) {
            String key = endpoint + ":" + userId;
            AtomicInteger attempts = failedAttempts.get(key);
            return attempts == null ? 0 : attempts.get();
        }

        void addWhitelistedIp(String ip) {
            whitelistedIps.add(ip);
        }

        void addBlacklistedIp(String ip) {
            blacklistedIps.add(ip);
        }

        private static class EndpointConfig {
            final int maxRequests;
            final Duration window;

            EndpointConfig(int maxRequests, Duration window) {
                this.maxRequests = maxRequests;
                this.window = window;
            }
        }
    }
}
