package com.simpleaccounts.model;

import lombok.Data;

import javax.persistence.*;

@Data
public class UnitTypeModel {

    private Integer unitTypeId;

    private Integer  unitType;

    private Boolean  unitTypeStatus;

}
