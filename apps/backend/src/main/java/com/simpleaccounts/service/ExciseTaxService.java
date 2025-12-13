package com.simpleaccounts.service;
import com.simpleaccounts.entity.ExciseTax;
import java.util.List;

public interface ExciseTaxService {
    public List<ExciseTax> findAll();
    ExciseTax getExciseTax(Integer id);
}