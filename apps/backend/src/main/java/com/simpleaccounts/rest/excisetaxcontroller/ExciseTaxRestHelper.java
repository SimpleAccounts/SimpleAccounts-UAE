package com.simpleaccounts.rest.excisetaxcontroller;

import com.simpleaccounts.entity.ExciseTax;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.repository.ExciseTaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ExciseTaxRestHelper {
    private final ExciseTaxRepository exciseTaxRepository;

    /**
     * @return ExciseTax List
     */
    public List<ExciseTax> getExciseTaxList() {
        return exciseTaxRepository.findAll();
    }
}
