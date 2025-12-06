package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.bankaccount.BankAccountStatusDao;
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("BankAccountStatusServiceImpl Tests")
class BankAccountStatusServiceImplTest {

    @Mock
    private BankAccountStatusDao bankAccountStatusDao;

    @InjectMocks
    private BankAccountStatusServiceImpl bankAccountStatusService;

    private BankAccountStatus testStatus;
    private Integer statusId;

    @BeforeEach
    void setUp() {
        statusId = 1;
        testStatus = createTestBankAccountStatus(statusId, "ACTIVE");
    }

    private BankAccountStatus createTestBankAccountStatus(Integer id, String status) {
        BankAccountStatus bankAccountStatus = new BankAccountStatus();
        bankAccountStatus.setId(id);
        bankAccountStatus.setStatus(status);
        bankAccountStatus.setCreatedDate(LocalDateTime.now());
        bankAccountStatus.setLastUpdateDate(LocalDateTime.now());
        bankAccountStatus.setDeleteFlag(false);
        return bankAccountStatus;
    }

    @Nested
    @DisplayName("getBankAccountStatuses() Tests")
    class GetBankAccountStatusesTests {

        @Test
        @DisplayName("Should get all bank account statuses")
        void shouldGetAllBankAccountStatuses() {
            List<BankAccountStatus> expectedStatuses = Arrays.asList(
                    createTestBankAccountStatus(1, "ACTIVE"),
                    createTestBankAccountStatus(2, "INACTIVE"),
                    createTestBankAccountStatus(3, "SUSPENDED")
            );

            when(bankAccountStatusDao.getBankAccountStatuses()).thenReturn(expectedStatuses);

            List<BankAccountStatus> result = bankAccountStatusService.getBankAccountStatuses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
            assertThat(result).containsExactlyElementsOf(expectedStatuses);
            verify(bankAccountStatusDao, times(1)).getBankAccountStatuses();
        }

        @Test
        @DisplayName("Should return empty list when no statuses exist")
        void shouldReturnEmptyListWhenNoStatusesExist() {
            when(bankAccountStatusDao.getBankAccountStatuses()).thenReturn(Collections.emptyList());

            List<BankAccountStatus> result = bankAccountStatusService.getBankAccountStatuses();

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatuses();
        }

        @Test
        @DisplayName("Should handle single status")
        void shouldHandleSingleStatus() {
            List<BankAccountStatus> singleStatus = Collections.singletonList(testStatus);
            when(bankAccountStatusDao.getBankAccountStatuses()).thenReturn(singleStatus);

            List<BankAccountStatus> result = bankAccountStatusService.getBankAccountStatuses();

            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testStatus);
            verify(bankAccountStatusDao, times(1)).getBankAccountStatuses();
        }

        @Test
        @DisplayName("Should return all status types")
        void shouldReturnAllStatusTypes() {
            List<BankAccountStatus> allStatuses = Arrays.asList(
                    createTestBankAccountStatus(1, "ACTIVE"),
                    createTestBankAccountStatus(2, "INACTIVE"),
                    createTestBankAccountStatus(3, "SUSPENDED"),
                    createTestBankAccountStatus(4, "CLOSED")
            );

            when(bankAccountStatusDao.getBankAccountStatuses()).thenReturn(allStatuses);

            List<BankAccountStatus> result = bankAccountStatusService.getBankAccountStatuses();

            assertThat(result).hasSize(4);
            assertThat(result.stream().map(BankAccountStatus::getStatus))
                    .containsExactly("ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED");
        }

        @Test
        @DisplayName("Should delegate to DAO correctly")
        void shouldDelegateToDaoCorrectly() {
            List<BankAccountStatus> statuses = Collections.singletonList(testStatus);
            when(bankAccountStatusDao.getBankAccountStatuses()).thenReturn(statuses);

            bankAccountStatusService.getBankAccountStatuses();

            verify(bankAccountStatusDao, times(1)).getBankAccountStatuses();
        }

        @Test
        @DisplayName("Should handle multiple calls")
        void shouldHandleMultipleCalls() {
            List<BankAccountStatus> statuses = Arrays.asList(testStatus);
            when(bankAccountStatusDao.getBankAccountStatuses()).thenReturn(statuses);

            bankAccountStatusService.getBankAccountStatuses();
            bankAccountStatusService.getBankAccountStatuses();
            bankAccountStatusService.getBankAccountStatuses();

            verify(bankAccountStatusDao, times(3)).getBankAccountStatuses();
        }
    }

    @Nested
    @DisplayName("getBankAccountStatus() Tests")
    class GetBankAccountStatusTests {

        @Test
        @DisplayName("Should get bank account status by ID")
        void shouldGetBankAccountStatusById() {
            when(bankAccountStatusDao.getBankAccountStatus(statusId)).thenReturn(testStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(statusId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testStatus);
            assertThat(result.getId()).isEqualTo(statusId);
            assertThat(result.getStatus()).isEqualTo("ACTIVE");
            verify(bankAccountStatusDao, times(1)).getBankAccountStatus(statusId);
        }

        @Test
        @DisplayName("Should return null when status not found")
        void shouldReturnNullWhenStatusNotFound() {
            when(bankAccountStatusDao.getBankAccountStatus(999)).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(999);

            assertThat(result).isNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatus(999);
        }

        @Test
        @DisplayName("Should handle null ID")
        void shouldHandleNullId() {
            when(bankAccountStatusDao.getBankAccountStatus(null)).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(null);

            assertThat(result).isNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatus(null);
        }

        @Test
        @DisplayName("Should handle zero ID")
        void shouldHandleZeroId() {
            when(bankAccountStatusDao.getBankAccountStatus(0)).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(0);

            assertThat(result).isNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatus(0);
        }

        @Test
        @DisplayName("Should handle negative ID")
        void shouldHandleNegativeId() {
            when(bankAccountStatusDao.getBankAccountStatus(-1)).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(-1);

            assertThat(result).isNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatus(-1);
        }

        @Test
        @DisplayName("Should get different statuses by different IDs")
        void shouldGetDifferentStatusesByDifferentIds() {
            BankAccountStatus status1 = createTestBankAccountStatus(1, "ACTIVE");
            BankAccountStatus status2 = createTestBankAccountStatus(2, "INACTIVE");

            when(bankAccountStatusDao.getBankAccountStatus(1)).thenReturn(status1);
            when(bankAccountStatusDao.getBankAccountStatus(2)).thenReturn(status2);

            BankAccountStatus result1 = bankAccountStatusService.getBankAccountStatus(1);
            BankAccountStatus result2 = bankAccountStatusService.getBankAccountStatus(2);

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            assertThat(result1.getStatus()).isEqualTo("ACTIVE");
            assertThat(result2.getStatus()).isEqualTo("INACTIVE");
        }

        @Test
        @DisplayName("Should delegate to DAO correctly")
        void shouldDelegateToDaoCorrectly() {
            when(bankAccountStatusDao.getBankAccountStatus(statusId)).thenReturn(testStatus);

            bankAccountStatusService.getBankAccountStatus(statusId);

            verify(bankAccountStatusDao, times(1)).getBankAccountStatus(statusId);
        }

        @Test
        @DisplayName("Should handle large ID values")
        void shouldHandleLargeIdValues() {
            Integer largeId = Integer.MAX_VALUE;
            BankAccountStatus largeIdStatus = createTestBankAccountStatus(largeId, "ACTIVE");

            when(bankAccountStatusDao.getBankAccountStatus(largeId)).thenReturn(largeIdStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(largeId);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(largeId);
        }
    }

    @Nested
    @DisplayName("getBankAccountStatusByName() Tests")
    class GetBankAccountStatusByNameTests {

        @Test
        @DisplayName("Should get bank account status by name")
        void shouldGetBankAccountStatusByName() {
            String statusName = "ACTIVE";
            when(bankAccountStatusDao.getBankAccountStatusByName(statusName)).thenReturn(testStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName(statusName);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testStatus);
            assertThat(result.getStatus()).isEqualTo(statusName);
            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName(statusName);
        }

        @Test
        @DisplayName("Should return null when status name not found")
        void shouldReturnNullWhenStatusNameNotFound() {
            when(bankAccountStatusDao.getBankAccountStatusByName("UNKNOWN")).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("UNKNOWN");

            assertThat(result).isNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName("UNKNOWN");
        }

        @Test
        @DisplayName("Should handle null status name")
        void shouldHandleNullStatusName() {
            when(bankAccountStatusDao.getBankAccountStatusByName(null)).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName(null);

            assertThat(result).isNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName(null);
        }

        @Test
        @DisplayName("Should handle empty status name")
        void shouldHandleEmptyStatusName() {
            when(bankAccountStatusDao.getBankAccountStatusByName("")).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("");

            assertThat(result).isNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName("");
        }

        @Test
        @DisplayName("Should get status by INACTIVE name")
        void shouldGetStatusByInactiveName() {
            BankAccountStatus inactiveStatus = createTestBankAccountStatus(2, "INACTIVE");
            when(bankAccountStatusDao.getBankAccountStatusByName("INACTIVE")).thenReturn(inactiveStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("INACTIVE");

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("INACTIVE");
        }

        @Test
        @DisplayName("Should get status by SUSPENDED name")
        void shouldGetStatusBySuspendedName() {
            BankAccountStatus suspendedStatus = createTestBankAccountStatus(3, "SUSPENDED");
            when(bankAccountStatusDao.getBankAccountStatusByName("SUSPENDED")).thenReturn(suspendedStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("SUSPENDED");

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("SUSPENDED");
        }

        @Test
        @DisplayName("Should get status by CLOSED name")
        void shouldGetStatusByClosedName() {
            BankAccountStatus closedStatus = createTestBankAccountStatus(4, "CLOSED");
            when(bankAccountStatusDao.getBankAccountStatusByName("CLOSED")).thenReturn(closedStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("CLOSED");

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("CLOSED");
        }

        @Test
        @DisplayName("Should handle lowercase status name")
        void shouldHandleLowercaseStatusName() {
            when(bankAccountStatusDao.getBankAccountStatusByName("active")).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("active");

            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName("active");
        }

        @Test
        @DisplayName("Should handle mixed case status name")
        void shouldHandleMixedCaseStatusName() {
            when(bankAccountStatusDao.getBankAccountStatusByName("Active")).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("Active");

            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName("Active");
        }

        @Test
        @DisplayName("Should delegate to DAO correctly")
        void shouldDelegateToDaoCorrectly() {
            String statusName = "ACTIVE";
            when(bankAccountStatusDao.getBankAccountStatusByName(statusName)).thenReturn(testStatus);

            bankAccountStatusService.getBankAccountStatusByName(statusName);

            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName(statusName);
        }

        @Test
        @DisplayName("Should handle status name with spaces")
        void shouldHandleStatusNameWithSpaces() {
            when(bankAccountStatusDao.getBankAccountStatusByName("  ACTIVE  ")).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName("  ACTIVE  ");

            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName("  ACTIVE  ");
        }

        @Test
        @DisplayName("Should handle very long status name")
        void shouldHandleVeryLongStatusName() {
            String longName = "A".repeat(255);
            when(bankAccountStatusDao.getBankAccountStatusByName(longName)).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName(longName);

            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName(longName);
        }

        @Test
        @DisplayName("Should handle status name with special characters")
        void shouldHandleStatusNameWithSpecialCharacters() {
            String specialName = "ACTIVE@#$%";
            when(bankAccountStatusDao.getBankAccountStatusByName(specialName)).thenReturn(null);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatusByName(specialName);

            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName(specialName);
        }
    }

    @Nested
    @DisplayName("Service Behavior Tests")
    class ServiceBehaviorTests {

        @Test
        @DisplayName("Should be annotated with @Service")
        void shouldBeAnnotatedWithService() {
            assertThat(bankAccountStatusService.getClass().isAnnotationPresent(
                    org.springframework.stereotype.Service.class)).isTrue();
        }

        @Test
        @DisplayName("Should have correct service name")
        void shouldHaveCorrectServiceName() {
            org.springframework.stereotype.Service annotation =
                    bankAccountStatusService.getClass().getAnnotation(
                            org.springframework.stereotype.Service.class);
            assertThat(annotation.value()).isEqualTo("bankAccountStatusService");
        }

        @Test
        @DisplayName("Should implement BankAccountStatusService interface")
        void shouldImplementBankAccountStatusServiceInterface() {
            assertThat(bankAccountStatusService)
                    .isInstanceOf(com.simpleaccounts.service.BankAccountStatusService.class);
        }

        @Test
        @DisplayName("Should have BankAccountStatusDao autowired")
        void shouldHaveBankAccountStatusDaoAutowired() {
            assertThat(bankAccountStatusDao).isNotNull();
        }
    }

    @Nested
    @DisplayName("Integration Tests")
    class IntegrationTests {

        @Test
        @DisplayName("Should work with consecutive calls to different methods")
        void shouldWorkWithConsecutiveCallsToDifferentMethods() {
            List<BankAccountStatus> statuses = Arrays.asList(testStatus);
            when(bankAccountStatusDao.getBankAccountStatuses()).thenReturn(statuses);
            when(bankAccountStatusDao.getBankAccountStatus(statusId)).thenReturn(testStatus);
            when(bankAccountStatusDao.getBankAccountStatusByName("ACTIVE")).thenReturn(testStatus);

            List<BankAccountStatus> result1 = bankAccountStatusService.getBankAccountStatuses();
            BankAccountStatus result2 = bankAccountStatusService.getBankAccountStatus(statusId);
            BankAccountStatus result3 = bankAccountStatusService.getBankAccountStatusByName("ACTIVE");

            assertThat(result1).isNotEmpty();
            assertThat(result2).isNotNull();
            assertThat(result3).isNotNull();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatuses();
            verify(bankAccountStatusDao, times(1)).getBankAccountStatus(statusId);
            verify(bankAccountStatusDao, times(1)).getBankAccountStatusByName("ACTIVE");
        }

        @Test
        @DisplayName("Should handle repeated calls with same parameters")
        void shouldHandleRepeatedCallsWithSameParameters() {
            when(bankAccountStatusDao.getBankAccountStatus(statusId)).thenReturn(testStatus);

            bankAccountStatusService.getBankAccountStatus(statusId);
            bankAccountStatusService.getBankAccountStatus(statusId);
            bankAccountStatusService.getBankAccountStatus(statusId);

            verify(bankAccountStatusDao, times(3)).getBankAccountStatus(statusId);
        }

        @Test
        @DisplayName("Should maintain consistency across method calls")
        void shouldMaintainConsistencyAcrossMethodCalls() {
            when(bankAccountStatusDao.getBankAccountStatus(1)).thenReturn(testStatus);
            when(bankAccountStatusDao.getBankAccountStatusByName("ACTIVE")).thenReturn(testStatus);

            BankAccountStatus resultById = bankAccountStatusService.getBankAccountStatus(1);
            BankAccountStatus resultByName = bankAccountStatusService.getBankAccountStatusByName("ACTIVE");

            assertThat(resultById).isEqualTo(resultByName);
            assertThat(resultById.getId()).isEqualTo(resultByName.getId());
            assertThat(resultById.getStatus()).isEqualTo(resultByName.getStatus());
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle status with null fields")
        void shouldHandleStatusWithNullFields() {
            BankAccountStatus nullFieldsStatus = new BankAccountStatus();
            nullFieldsStatus.setId(99);
            when(bankAccountStatusDao.getBankAccountStatus(99)).thenReturn(nullFieldsStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(99);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(99);
        }

        @Test
        @DisplayName("Should handle status with delete flag set")
        void shouldHandleStatusWithDeleteFlagSet() {
            testStatus.setDeleteFlag(true);
            when(bankAccountStatusDao.getBankAccountStatus(statusId)).thenReturn(testStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(statusId);

            assertThat(result).isNotNull();
            assertThat(result.getDeleteFlag()).isTrue();
        }

        @Test
        @DisplayName("Should handle status with very old created date")
        void shouldHandleStatusWithVeryOldCreatedDate() {
            testStatus.setCreatedDate(LocalDateTime.of(2000, 1, 1, 0, 0));
            when(bankAccountStatusDao.getBankAccountStatus(statusId)).thenReturn(testStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(statusId);

            assertThat(result).isNotNull();
            assertThat(result.getCreatedDate()).isBefore(LocalDateTime.now());
        }

        @Test
        @DisplayName("Should handle status with future last update date")
        void shouldHandleStatusWithFutureLastUpdateDate() {
            testStatus.setLastUpdateDate(LocalDateTime.now().plusYears(1));
            when(bankAccountStatusDao.getBankAccountStatus(statusId)).thenReturn(testStatus);

            BankAccountStatus result = bankAccountStatusService.getBankAccountStatus(statusId);

            assertThat(result).isNotNull();
            assertThat(result.getLastUpdateDate()).isAfter(LocalDateTime.now());
        }
    }
}
