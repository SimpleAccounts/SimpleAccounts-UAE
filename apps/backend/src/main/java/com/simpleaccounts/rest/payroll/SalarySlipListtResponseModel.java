package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.rest.payroll.service.SalarySlipListtModel;
import lombok.Data;

import java.util.List;

@Data
public class SalarySlipListtResponseModel {

    private List<SalarySlipListtModel> resultSalarySlipList;

}
