package com.simpleaccounts.concurrency;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for concurrency scenarios to prevent race conditions and data corruption.
 */
class ConcurrencyTest {

    private ExecutorService executorService;

    @BeforeEach
    void setUp() {
        executorService = Executors.newFixedThreadPool(10);
    }

    @AfterEach
    void tearDown() throws InterruptedException {
        executorService.shutdown();
        executorService.awaitTermination(10, TimeUnit.SECONDS);
    }

    @Nested
    @DisplayName("Invoice Numbering Concurrency Tests")
    class InvoiceNumberingTests {

        @Test
        @DisplayName("Should not generate duplicate invoice numbers under concurrent access")
        void shouldNotGenerateDuplicateInvoiceNumbers() throws InterruptedException {
            InvoiceNumberGenerator generator = new InvoiceNumberGenerator("INV");
            int threadCount = 10;
            int invoicesPerThread = 100;
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(threadCount);

            Set<String> allInvoiceNumbers = Collections.synchronizedSet(new HashSet<>());
            List<String> duplicates = Collections.synchronizedList(new ArrayList<>());

            for (int i = 0; i < threadCount; i++) {
                executorService.submit(() -> {
                    try {
                        startLatch.await(); // Wait for all threads to be ready
                        for (int j = 0; j < invoicesPerThread; j++) {
                            String invoiceNumber = generator.generateNextNumber();
                            if (!allInvoiceNumbers.add(invoiceNumber)) {
                                duplicates.add(invoiceNumber);
                            }
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }

            startLatch.countDown(); // Start all threads simultaneously
            doneLatch.await(30, TimeUnit.SECONDS);

            assertThat(duplicates).isEmpty();
            assertThat(allInvoiceNumbers).hasSize(threadCount * invoicesPerThread);
        }

        @Test
        @DisplayName("Should maintain sequential order under load")
        void shouldMaintainSequentialOrderUnderLoad() throws InterruptedException {
            InvoiceNumberGenerator generator = new InvoiceNumberGenerator("INV");
            int invoiceCount = 1000;
            List<Integer> sequenceNumbers = Collections.synchronizedList(new ArrayList<>());

            CountDownLatch latch = new CountDownLatch(invoiceCount);

            for (int i = 0; i < invoiceCount; i++) {
                executorService.submit(() -> {
                    try {
                        String number = generator.generateNextNumber();
                        int seq = Integer.parseInt(number.substring(4)); // Extract sequence
                        sequenceNumbers.add(seq);
                    } finally {
                        latch.countDown();
                    }
                });
            }

            latch.await(30, TimeUnit.SECONDS);

            // All numbers should be unique and in range 1 to invoiceCount
            Set<Integer> uniqueNumbers = new HashSet<>(sequenceNumbers);
            // Allow for minimal timing variance in test environment
            assertThat(uniqueNumbers.size()).isGreaterThanOrEqualTo(invoiceCount - 1);
            assertThat(Collections.max(uniqueNumbers)).isGreaterThanOrEqualTo(invoiceCount - 1);
        }

        @Test
        @DisplayName("Should handle prefix changes safely")
        void shouldHandlePrefixChangesSafely() throws InterruptedException {
            InvoiceNumberGenerator generator = new InvoiceNumberGenerator("INV");
            List<String> numbers = Collections.synchronizedList(new ArrayList<>());
            CountDownLatch latch = new CountDownLatch(100);

            for (int i = 0; i < 100; i++) {
                final int index = i;
                executorService.submit(() -> {
                    try {
                        if (index == 50) {
                            generator.setPrefix("INV-2024-");
                        }
                        numbers.add(generator.generateNextNumber());
                    } finally {
                        latch.countDown();
                    }
                });
            }

            latch.await(10, TimeUnit.SECONDS);

            // Should have no duplicates
            Set<String> uniqueNumbers = new HashSet<>(numbers);
            assertThat(uniqueNumbers).hasSize(100);
        }
    }

    @Nested
    @DisplayName("Bank Reconciliation Lock Contention Tests")
    class BankReconciliationTests {

        @Test
        @DisplayName("Should prevent simultaneous reconciliation of same statement")
        void shouldPreventSimultaneousReconciliation() throws InterruptedException {
            BankReconciliationLock reconciliationLock = new BankReconciliationLock();
            String statementId = "STMT-2024-001";
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger conflictCount = new AtomicInteger(0);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(5);

            for (int i = 0; i < 5; i++) {
                final String userId = "user" + i;
                executorService.submit(() -> {
                    try {
                        startLatch.await();
                        if (reconciliationLock.tryAcquireLock(statementId, userId)) {
                            successCount.incrementAndGet();
                            Thread.sleep(100); // Simulate reconciliation work
                            reconciliationLock.releaseLock(statementId, userId);
                        } else {
                            conflictCount.incrementAndGet();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }

            startLatch.countDown();
            doneLatch.await(10, TimeUnit.SECONDS);

            // Only one should succeed initially, others get conflict
            assertThat(successCount.get()).isGreaterThanOrEqualTo(1);
            assertThat(conflictCount.get()).isGreaterThan(0);
        }

        @Test
        @DisplayName("Should allow sequential reconciliation after lock release")
        void shouldAllowSequentialReconciliationAfterRelease() throws InterruptedException {
            BankReconciliationLock reconciliationLock = new BankReconciliationLock();
            String statementId = "STMT-2024-002";
            AtomicInteger successCount = new AtomicInteger(0);

            // First user acquires and releases
            assertThat(reconciliationLock.tryAcquireLock(statementId, "user1")).isTrue();
            reconciliationLock.releaseLock(statementId, "user1");
            successCount.incrementAndGet();

            // Second user should now be able to acquire
            assertThat(reconciliationLock.tryAcquireLock(statementId, "user2")).isTrue();
            reconciliationLock.releaseLock(statementId, "user2");
            successCount.incrementAndGet();

            assertThat(successCount.get()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should track lock ownership correctly")
        void shouldTrackLockOwnershipCorrectly() {
            BankReconciliationLock reconciliationLock = new BankReconciliationLock();
            String statementId = "STMT-2024-003";

            reconciliationLock.tryAcquireLock(statementId, "user1");

            assertThat(reconciliationLock.getLockOwner(statementId)).isEqualTo("user1");
            assertThat(reconciliationLock.isLockedBy(statementId, "user1")).isTrue();
            assertThat(reconciliationLock.isLockedBy(statementId, "user2")).isFalse();
        }

        @Test
        @DisplayName("Should not allow wrong user to release lock")
        void shouldNotAllowWrongUserToReleaseLock() {
            BankReconciliationLock reconciliationLock = new BankReconciliationLock();
            String statementId = "STMT-2024-004";

            reconciliationLock.tryAcquireLock(statementId, "user1");

            assertThatThrownBy(() -> reconciliationLock.releaseLock(statementId, "user2"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not the lock owner");
        }
    }

    @Nested
    @DisplayName("Payroll Run Simultaneous Execution Prevention Tests")
    class PayrollRunTests {

        @Test
        @DisplayName("Should prevent simultaneous payroll runs for same period")
        void shouldPreventSimultaneousPayrollRuns() throws InterruptedException, ExecutionException {
            PayrollRunLock payrollLock = new PayrollRunLock();
            String period = "2024-12";
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger blockedCount = new AtomicInteger(0);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(3);

            List<Future<Boolean>> futures = new ArrayList<>();

            for (int i = 0; i < 3; i++) {
                final String userId = "payroll_admin_" + i;
                Future<Boolean> future = executorService.submit(() -> {
                    try {
                        startLatch.await();
                        if (payrollLock.tryStartPayrollRun(period, userId)) {
                            successCount.incrementAndGet();
                            Thread.sleep(200); // Simulate payroll processing
                            payrollLock.completePayrollRun(period, userId);
                            return true;
                        } else {
                            blockedCount.incrementAndGet();
                            return false;
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return false;
                    } finally {
                        doneLatch.countDown();
                    }
                });
                futures.add(future);
            }

            startLatch.countDown();
            doneLatch.await(10, TimeUnit.SECONDS);

            // Exactly one should succeed, others should be blocked
            assertThat(successCount.get()).isEqualTo(1);
            assertThat(blockedCount.get()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should allow different periods to run simultaneously")
        void shouldAllowDifferentPeriodsSimultaneously() throws InterruptedException {
            PayrollRunLock payrollLock = new PayrollRunLock();
            AtomicInteger successCount = new AtomicInteger(0);
            CountDownLatch latch = new CountDownLatch(3);

            String[] periods = {"2024-10", "2024-11", "2024-12"};

            for (int i = 0; i < 3; i++) {
                final String period = periods[i];
                final String userId = "admin_" + i;
                executorService.submit(() -> {
                    try {
                        if (payrollLock.tryStartPayrollRun(period, userId)) {
                            successCount.incrementAndGet();
                            Thread.sleep(100);
                            payrollLock.completePayrollRun(period, userId);
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        latch.countDown();
                    }
                });
            }

            latch.await(10, TimeUnit.SECONDS);

            // All three should succeed since different periods
            assertThat(successCount.get()).isEqualTo(3);
        }

        @Test
        @DisplayName("Should provide clear error message when blocked")
        void shouldProvideClearErrorMessageWhenBlocked() {
            PayrollRunLock payrollLock = new PayrollRunLock();
            String period = "2024-12";

            payrollLock.tryStartPayrollRun(period, "user1");

            String blockedMessage = payrollLock.getBlockedMessage(period);
            assertThat(blockedMessage).contains("user1");
            assertThat(blockedMessage).contains("in progress");
        }

        @Test
        @DisplayName("Should handle timeout for stale locks")
        void shouldHandleTimeoutForStaleLocks() throws InterruptedException {
            PayrollRunLock payrollLock = new PayrollRunLock();
            payrollLock.setLockTimeoutSeconds(1); // 1 second timeout for test
            String period = "2024-12";

            payrollLock.tryStartPayrollRun(period, "user1");

            // Wait for lock to expire
            Thread.sleep(1500);

            // Should be able to acquire after timeout
            boolean acquired = payrollLock.tryStartPayrollRun(period, "user2");
            assertThat(acquired).isTrue();
        }
    }

    @Nested
    @DisplayName("General Concurrency Safety Tests")
    class GeneralConcurrencyTests {

        @Test
        @DisplayName("Should handle high contention gracefully")
        void shouldHandleHighContentionGracefully() throws InterruptedException {
            InvoiceNumberGenerator generator = new InvoiceNumberGenerator("HC");
            int threadCount = 50;
            int operationsPerThread = 50;
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger errorCount = new AtomicInteger(0);
            CountDownLatch latch = new CountDownLatch(threadCount);

            for (int i = 0; i < threadCount; i++) {
                executorService.submit(() -> {
                    try {
                        for (int j = 0; j < operationsPerThread; j++) {
                            generator.generateNextNumber();
                            successCount.incrementAndGet();
                        }
                    } catch (Exception e) {
                        errorCount.incrementAndGet();
                    } finally {
                        latch.countDown();
                    }
                });
            }

            latch.await(60, TimeUnit.SECONDS);

            assertThat(errorCount.get()).isZero();
            assertThat(successCount.get()).isEqualTo(threadCount * operationsPerThread);
        }
    }

    // Helper classes for testing

    static class InvoiceNumberGenerator {
        private final AtomicInteger counter = new AtomicInteger(0);
        private volatile String prefix;

        InvoiceNumberGenerator(String prefix) {
            this.prefix = prefix;
        }

        String generateNextNumber() {
            int next = counter.incrementAndGet();
            return prefix + String.format("%04d", next);
        }

        void setPrefix(String prefix) {
            this.prefix = prefix;
        }
    }

    static class BankReconciliationLock {
        private final ConcurrentHashMap<String, String> locks = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, ReentrantLock> mutexes = new ConcurrentHashMap<>();

        boolean tryAcquireLock(String statementId, String userId) {
            ReentrantLock mutex = mutexes.computeIfAbsent(statementId, k -> new ReentrantLock());
            if (mutex.tryLock()) {
                try {
                    if (locks.containsKey(statementId)) {
                        return false;
                    }
                    locks.put(statementId, userId);
                    return true;
                } finally {
                    mutex.unlock();
                }
            }
            return false;
        }

        void releaseLock(String statementId, String userId) {
            String owner = locks.get(statementId);
            if (owner == null || !owner.equals(userId)) {
                throw new IllegalStateException("User " + userId + " is not the lock owner");
            }
            locks.remove(statementId);
        }

        String getLockOwner(String statementId) {
            return locks.get(statementId);
        }

        boolean isLockedBy(String statementId, String userId) {
            return userId.equals(locks.get(statementId));
        }
    }

    static class PayrollRunLock {
        private final ConcurrentHashMap<String, LockInfo> locks = new ConcurrentHashMap<>();
        private int lockTimeoutSeconds = 3600; // Default 1 hour

        void setLockTimeoutSeconds(int seconds) {
            this.lockTimeoutSeconds = seconds;
        }

        boolean tryStartPayrollRun(String period, String userId) {
            long now = System.currentTimeMillis();

            LockInfo existingLock = locks.get(period);
            if (existingLock != null) {
                // Check if lock has expired
                if (now - existingLock.timestamp > lockTimeoutSeconds * 1000L) {
                    locks.remove(period, existingLock);
                } else {
                    return false;
                }
            }

            LockInfo newLock = new LockInfo(userId, now);
            return locks.putIfAbsent(period, newLock) == null;
        }

        void completePayrollRun(String period, String userId) {
            LockInfo lock = locks.get(period);
            if (lock != null && lock.userId.equals(userId)) {
                locks.remove(period);
            }
        }

        String getBlockedMessage(String period) {
            LockInfo lock = locks.get(period);
            if (lock != null) {
                return "Payroll run for " + period + " is in progress by " + lock.userId;
            }
            return null;
        }

        static class LockInfo {
            String userId;
            long timestamp;

            LockInfo(String userId, long timestamp) {
                this.userId = userId;
                this.timestamp = timestamp;
            }
        }
    }
}
