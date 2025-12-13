package com.simpleaccounts.model;

import javax.persistence.*;
import lombok.Data;

@Data
public class EmployeeDesignationListModel {
    private Integer id;
    private String designationName;
    private Integer designationId;
    private Integer parentId;
    public void setDesignationIdFromParent(Integer designationId) {
        this.designationId = designationId;
    }
}
