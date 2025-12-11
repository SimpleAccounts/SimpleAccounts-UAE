package com.simpleaccounts.helper;

import com.simpleaccounts.rest.dashboardcontroller.DateRequestModel;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DashboardRestHelperTest {

    private final DashboardRestHelper helper = new DashboardRestHelper();

    @Test
    void shouldReturnRequestedMonthCount() {
        List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(3);

        assertThat(ranges).hasSize(3);
    }

    @Test
    void shouldClampMonthCountBetweenOneAndTwelve() {
        assertThat(helper.getStartDateEndDateForEveryMonth(null)).hasSize(12);
        assertThat(helper.getStartDateEndDateForEveryMonth(24)).hasSize(12);
        assertThat(helper.getStartDateEndDateForEveryMonth(-5)).hasSize(1);
    }
}
