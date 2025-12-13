package com.simpleaccounts.rest.excisetaxcontroller;

import com.simpleaccounts.entity.ExciseTax;
import com.simpleaccounts.repository.ExciseTaxRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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
