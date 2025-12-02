package com.simplevat.rest.payroll;

import com.simplevat.rest.payroll.service.SalarySlipListtModel;
import lombok.Data;

import java.util.List;

@Data
public class SalarySlipListtResponseModel {

    private List<SalarySlipListtModel> resultSalarySlipList;

}
