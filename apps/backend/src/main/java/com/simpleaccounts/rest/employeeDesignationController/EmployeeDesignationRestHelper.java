package com.simpleaccounts.rest.employeeDesignationController;

import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.entity.SalaryTemplate;
import com.simpleaccounts.model.EmployeeDesignationListModel;
import com.simpleaccounts.model.EmployeeDesignationPersistModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateListModal;
import com.simpleaccounts.service.EmployeeDesignationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class EmployeeDesignationRestHelper {

    @Autowired
    private EmployeeDesignationService employeeDesignationService;
    //SalaryDesignation

    public EmployeeDesignation getEmployeeDesignationEntity(EmployeeDesignationPersistModel employeeDesignationPersistModel) throws IOException
    {
        EmployeeDesignation employeeDesignation = new EmployeeDesignation();

        if (employeeDesignationPersistModel.getId() != null) {
            employeeDesignation = employeeDesignationService.findByPK(employeeDesignationPersistModel.getId());
        }
        if (employeeDesignationPersistModel.getDesignationName() != null) {
            employeeDesignation.setDesignationName(employeeDesignationPersistModel.getDesignationName() );
        }
        if (employeeDesignationPersistModel.getDesignationId() != null) {
            employeeDesignation.setDesignationId(employeeDesignationPersistModel.getDesignationId());
        }
        if (employeeDesignationPersistModel.getParentId()!=null)
            employeeDesignation.setParentId(employeeDesignationPersistModel.getParentId());
        return employeeDesignation;
    }


    public EmployeeDesignationPersistModel getEmployeeDesignationModel(EmployeeDesignation employeeDesignation)
    {
        EmployeeDesignationPersistModel employeeDesignationPersistModel =new EmployeeDesignationPersistModel();

        employeeDesignationPersistModel.setId(employeeDesignation.getId());
        employeeDesignationPersistModel.setDesignationName(employeeDesignation.getDesignationName());
        employeeDesignationPersistModel.setDesignationId(employeeDesignation.getDesignationId());
        if (employeeDesignation.getParentId()!=null)
            employeeDesignationPersistModel.setParentId(employeeDesignation.getParentId());
        employeeDesignationPersistModel.setDeleteFlag(employeeDesignation.getDeleteFlag());
        return employeeDesignationPersistModel;
    }

    public PaginationResponseModel getEmployeeDesignationListModel(PaginationResponseModel paginationResponseModel) {

        List<EmployeeDesignationListModel> modelList = new ArrayList<>();
        if (paginationResponseModel != null && paginationResponseModel.getData() != null) {
            List<EmployeeDesignation> employeeDesignationListModel = (List<EmployeeDesignation>) paginationResponseModel.getData();
            for (EmployeeDesignation employeeDesignationModel : employeeDesignationListModel) {
                EmployeeDesignationListModel model = new EmployeeDesignationListModel();
               model.setId(employeeDesignationModel.getId());
               model.setDesignationName(employeeDesignationModel.getDesignationName());
                model.setDesignationId(employeeDesignationModel.getDesignationId());
                if (employeeDesignationModel.getParentId()!=null)
                    model.setParentId(employeeDesignationModel.getParentId());
                modelList.add(model);
            }
            paginationResponseModel.setData(modelList);
        }
        Collections.reverse(modelList);
    return  paginationResponseModel;
    }
}
