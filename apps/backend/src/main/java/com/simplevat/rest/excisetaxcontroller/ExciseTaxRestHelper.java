package com.simplevat.rest.excisetaxcontroller;

import com.simplevat.entity.ExciseTax;
import com.simplevat.repository.ExciseTaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExciseTaxRestHelper {
    @Autowired
    private ExciseTaxRepository exciseTaxRepository;

    /**
     * @return ExciseTax List
     */
    public List<ExciseTax> getExciseTaxList() {
        return exciseTaxRepository.findAll();
    }
}
