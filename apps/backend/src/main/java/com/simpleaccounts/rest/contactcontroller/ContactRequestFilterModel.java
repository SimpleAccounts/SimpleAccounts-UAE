package com.simpleaccounts.rest.contactcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class ContactRequestFilterModel extends PaginationModel{
    private String name;
    private String email;
    private Integer contactType;

}
