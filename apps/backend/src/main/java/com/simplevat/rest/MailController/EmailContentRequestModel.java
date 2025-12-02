package com.simplevat.rest.MailController;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailContentRequestModel {

    private Integer id;
    private Integer type;
    private String amountInWords;
    private String taxInWords;
}
