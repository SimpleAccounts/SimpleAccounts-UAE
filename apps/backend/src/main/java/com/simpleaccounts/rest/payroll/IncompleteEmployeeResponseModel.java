package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.rest.payroll.service.IncompleteEmployeeProfileModel;
import java.util.List;
import lombok.Data;

@Data
public class IncompleteEmployeeResponseModel {

    private List<IncompleteEmployeeProfileModel> incompleteEmployeeList;

}
