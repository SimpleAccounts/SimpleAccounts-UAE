package com.simplevat.rest.payroll;

import lombok.Data;

import java.util.List;

@Data
public class SalaryResponseModel {

    List<SalaryModel> salaryList;

}
