package com.simpleaccounts.service;


import com.simpleaccounts.entity.TaxTreatment;
import com.simpleaccounts.rest.contactcontroller.TaxtTreatmentdto;

import java.util.List;

public interface TaxTreatmentService {
     List<TaxtTreatmentdto> getList();
     TaxTreatment getTaxTreatment(Integer id);
}
