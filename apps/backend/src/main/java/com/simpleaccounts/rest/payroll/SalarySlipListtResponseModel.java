package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.rest.payroll.service.SalarySlipListtModel;
import java.util.List;
import lombok.Data;

@Data
public class SalarySlipListtResponseModel {

    private List<SalarySlipListtModel> resultSalarySlipList;

}
