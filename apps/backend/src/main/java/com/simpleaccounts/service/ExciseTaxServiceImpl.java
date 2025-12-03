package com.simpleaccounts.service;
import com.simpleaccounts.entity.ExciseTax;
import com.simpleaccounts.repository.ExciseTaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExciseTaxServiceImpl implements ExciseTaxService {

    @Autowired
    private ExciseTaxRepository exciseTaxRepository;

    @Override
    public List<ExciseTax> findAll(){
        return exciseTaxRepository.findAll();
    }
    @Override
    public ExciseTax getExciseTax(Integer id){
        return exciseTaxRepository.findById(id);
    }

}
