package com.simpleaccounts.rest.contactcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class ContactRequestFilterModel extends PaginationModel{
    private String name;
    private String email;
    private Integer contactType;

}
