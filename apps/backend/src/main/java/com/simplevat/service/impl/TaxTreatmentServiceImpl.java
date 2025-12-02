package com.simplevat.service.impl;

import com.simplevat.entity.TaxTreatment;
import com.simplevat.repository.TaxTreatmentRepository;
import com.simplevat.rest.contactcontroller.TaxtTreatmentdto;
import com.simplevat.service.TaxTreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class TaxTreatmentServiceImpl implements TaxTreatmentService {
    @Autowired
    private TaxTreatmentRepository taxTreatmentRepository;

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
