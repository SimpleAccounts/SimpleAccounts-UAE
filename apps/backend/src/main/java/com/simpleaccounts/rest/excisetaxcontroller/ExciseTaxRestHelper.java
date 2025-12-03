package com.simpleaccounts.rest.excisetaxcontroller;

import com.simpleaccounts.entity.ExciseTax;
import com.simpleaccounts.repository.ExciseTaxRepository;
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
