package com.simplevat.service;


import com.simplevat.entity.TaxTreatment;
import com.simplevat.rest.contactcontroller.TaxtTreatmentdto;

import java.util.List;

public interface TaxTreatmentService {
     List<TaxtTreatmentdto> getList();
     TaxTreatment getTaxTreatment(Integer id);
}
