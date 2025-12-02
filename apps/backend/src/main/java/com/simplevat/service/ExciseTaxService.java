package com.simplevat.service;
import com.simplevat.entity.ExciseTax;
import java.util.List;


public interface ExciseTaxService {
    public List<ExciseTax> findAll();
    ExciseTax getExciseTax(Integer id);
}