package com.simpleaccounts.rest.companycontroller;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HealthCheckApiResponseModel {
    private String message;
    private int statusCode;
}
