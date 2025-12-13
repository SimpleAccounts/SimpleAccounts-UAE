package com.simpleaccounts.service.impl;

import com.simpleaccounts.entity.TaxTreatment;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.repository.TaxTreatmentRepository;
import com.simpleaccounts.rest.contactcontroller.TaxtTreatmentdto;
import com.simpleaccounts.service.TaxTreatmentService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaxTreatmentServiceImpl implements TaxTreatmentService {
    private final TaxTreatmentRepository taxTreatmentRepository;

    public List<TaxtTreatmentdto> getList(){
        List<TaxtTreatmentdto> taxTreatmentDtoList = new ArrayList<>();
        List<TaxTreatment> taxTreatmentList = taxTreatmentRepository.findAll();
        for (TaxTreatment taxTreatment:taxTreatmentList){
            TaxtTreatmentdto taxTreatmentObj = new TaxtTreatmentdto();
            taxTreatmentObj.setId(taxTreatment.getId());
            taxTreatmentObj.setName(taxTreatment.getTaxTreatment());
            taxTreatmentDtoList.add(taxTreatmentObj);
        }
       return taxTreatmentDtoList;
    }
    public TaxTreatment getTaxTreatment(Integer id){
        TaxTreatment taxTreatment = taxTreatmentRepository.findById(id);
        return taxTreatment;
    }
}
