package com.simplevat.model;

import com.simplevat.entity.Country;
import com.simplevat.entity.Currency;
import java.io.Serializable;

import com.simplevat.entity.TaxTreatment;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author Hiren
 */
@Getter
@Setter
public class ContactModel implements Serializable {

    private static final long serialVersionUID = -7492170073928262949L;

    private Integer contactId;

    private String contactName;

    private Currency currency;

    private TaxTreatment taxTreatment;

}
