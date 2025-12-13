package com.simpleaccounts.service;
import com.simpleaccounts.entity.ExciseTax;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.repository.ExciseTaxRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExciseTaxServiceImpl implements ExciseTaxService {

    private final ExciseTaxRepository exciseTaxRepository;

    @Override
    public List<ExciseTax> findAll(){
        return exciseTaxRepository.findAll();
    }
    @Override
    public ExciseTax getExciseTax(Integer id){
        return exciseTaxRepository.findById(id);
    }

}
