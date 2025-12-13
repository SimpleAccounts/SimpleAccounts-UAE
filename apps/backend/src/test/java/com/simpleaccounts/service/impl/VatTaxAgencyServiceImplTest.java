package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("VatTaxAgencyServiceImpl Unit Tests")
class VatTaxAgencyServiceImplTest {

    @InjectMocks
    private VatTaxAgencyServiceImpl vatTaxAgencyService;

    @Test
    @DisplayName("Should create service instance")
    void shouldCreateServiceInstance() {
        // The service is empty and only implements the interface
        assertThat(vatTaxAgencyService).isNotNull();
    }

    @Test
    @DisplayName("Service should implement VatTaxAgencyService interface")
    void shouldImplementVatTaxAgencyServiceInterface() {
        // Verify the service implements the correct interface
        assertThat(vatTaxAgencyService).isInstanceOf(com.simpleaccounts.service.VatTaxAgencyService.class);
    }
}
