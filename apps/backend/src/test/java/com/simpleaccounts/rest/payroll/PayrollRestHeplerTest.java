package com.simpleaccounts.rest.payroll;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.rest.payroll.service.SalaryRoleService;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.TextStyle;
import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PayrollRestHeplerTest {

    private static final DateTimeFormatter PAYROLL_DATE_FORMATTER = new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("E MMM d uuuu H:m:s")
            .appendLiteral(" ")
            .appendZoneId()
            .appendPattern("X")
            .appendLiteral(" ")
            .appendLiteral("(")
            .appendZoneText(TextStyle.FULL)
            .appendLiteral(')')
            .toFormatter(Locale.ENGLISH);

    @Mock
    private SalaryRoleService salaryRoleService;

    @InjectMocks
    private PayrollRestHepler payrollRestHepler;

    @Test
    void dateConvertIntoLocalDataTimeShouldParseIsoStrings() {
        ZonedDateTime zonedDateTime =
                ZonedDateTime.of(LocalDateTime.of(2023, 12, 1, 6, 30, 45), ZoneId.of("Asia/Dubai"));
        String formatted = PAYROLL_DATE_FORMATTER.format(zonedDateTime);

        LocalDateTime result = payrollRestHepler.dateConvertIntoLocalDataTime(formatted);

        assertThat(result).isEqualTo(LocalDateTime.of(2023, 12, 1, 6, 30, 45));
    }

    @Test
    void getSalaryRoleEntityShouldUpdateExistingRole() throws IOException {
        SalaryRole existing = new SalaryRole();
        existing.setId(42);
        existing.setRoleName("Old Name");
        when(salaryRoleService.findByPK(42)).thenReturn(existing);

        SalaryRolePersistModel persistModel = new SalaryRolePersistModel();
        persistModel.setId(42);
        persistModel.setSalaryRoleName("Updated Name");

        SalaryRole result = payrollRestHepler.getSalaryRoleEntity(persistModel);

        assertThat(result).isSameAs(existing);
        assertThat(result.getRoleName()).isEqualTo("Updated Name");
        verify(salaryRoleService).findByPK(42);
    }
}
