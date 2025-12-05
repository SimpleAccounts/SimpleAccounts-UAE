package com.simpleaccounts.rest.reports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.simpleaccounts.entity.ReportsConfiguration;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.UserService;
import java.time.LocalDateTime;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class ReportsConfigurationRestControllerTest {

    @Mock
    private ReportsColumnConfigurationRepository repository;
    @Mock
    private JwtTokenUtil jwtTokenUtil;
    @Mock
    private UserService userService;
    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private ReportsConfigurationRestController controller;

    @Test
    void getReportConfigurationByIdShouldReturnParsedJson() {
        ReportsConfiguration configuration = new ReportsConfiguration();
        configuration.setId(42);
        configuration.setColumnNames("{\"columns\":[\"debit\",\"credit\"]}");
        when(repository.findById(42)).thenReturn(Optional.of(configuration));

        ResponseEntity<?> response = controller.getReportConfigurationById(42);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(JsonNode.class);
        JsonNode node = (JsonNode) response.getBody();
        assertThat(node.path("columns").get(0).asText()).isEqualTo("debit");
    }

    @Test
    void updateShouldPersistConfigurationWithSanitizedColumns() {
        ReportsConfiguration existing = new ReportsConfiguration();
        existing.setId(5);
        existing.setColumnNames("{\"columns\":[]}");
        existing.setLastUpdateDate(LocalDateTime.MIN);
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(10);
        when(userService.findByPK(10)).thenReturn(new User());
        when(repository.findById(5)).thenReturn(Optional.of(existing));

        ReportsConfigurationModel model = new ReportsConfigurationModel();
        model.setId(5);
        model.setReportName("Profit & Loss");
        model.setColumnNames("{\\\"columns\\\":[\\\"amount\\\"]}");

        ResponseEntity<?> response = controller.update(model, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<ReportsConfiguration> captor =
                ArgumentCaptor.forClass(ReportsConfiguration.class);
        verify(repository).save(captor.capture());
        ReportsConfiguration saved = captor.getValue();
        assertThat(saved.getReportName()).isEqualTo("Profit & Loss");
        assertThat(saved.getColumnNames()).isEqualTo("{\"columns\":[\"amount\"]}");
        assertThat(saved.getLastUpdatedBy()).isEqualTo(10);
        assertThat(saved.getLastUpdateDate()).isNotNull();
    }

    @Test
    void updateShouldReturnInternalServerErrorWhenRepositoryFails() {
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(7);
        when(userService.findByPK(7)).thenReturn(new User());
        when(repository.findById(any())).thenThrow(new RuntimeException("boom"));

        ReportsConfigurationModel model = new ReportsConfigurationModel();
        model.setId(9);

        ResponseEntity<?> response = controller.update(model, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        verify(repository, times(0)).save(any());
    }
}

