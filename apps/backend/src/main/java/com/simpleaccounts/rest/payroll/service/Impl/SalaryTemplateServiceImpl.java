package com.simpleaccounts.rest.payroll.service.Impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.*;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateService;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("salaryTemplateService")
@Transactional
@RequiredArgsConstructor
public class SalaryTemplateServiceImpl extends SalaryTemplateService {

    private final SalaryTemplateDao salaryTemplateDao;

    @Override
    protected Dao<Integer, com.simpleaccounts.entity.SalaryTemplate> getDao() {
        return this.salaryTemplateDao;
    }

    public  PaginationResponseModel getSalaryTemplateList(Map<Object, Object> filterDataMap,PaginationModel paginationModel){

        return salaryTemplateDao.getSalaryTemplateList(filterDataMap,paginationModel);
    }

    public  DefaultSalaryTemplateModel getDefaultSalaryTemplates(){

        DefaultSalaryTemplateModel defaultSalaryTemplateModel = new DefaultSalaryTemplateModel();
        Map<String , List<SalaryTemplateModel>> salaryTemplateMap = new LinkedHashMap<>();

        List salaryTemplateList =  salaryTemplateDao.getDefaultTemplates();

        if(salaryTemplateList != null &&!salaryTemplateList.isEmpty()) {

            for(Object object : salaryTemplateList)
            {
                Object[] objectArray = (Object[])object;

                String SalaryStructure = (String)objectArray[0];

                List salaryTemplateList1 = new ArrayList<>();
                SalaryTemplateModel salaryTemplateModel = new SalaryTemplateModel();
                salaryTemplateModel.setDescription((String)objectArray[1]);
                salaryTemplateModel.setFormula((String) objectArray[2]);
                if (objectArray[3]!=null){
                    salaryTemplateModel.setFlatAmount((String) objectArray[3]);
                }
                salaryTemplateModel.setId((Integer) objectArray[4]);
                salaryTemplateList1.add(salaryTemplateModel);

                salaryTemplateMap.put(SalaryStructure,salaryTemplateList1);

            }
        }
        defaultSalaryTemplateModel.setSalaryComponentResult(salaryTemplateMap);
        return  defaultSalaryTemplateModel;
    }

}

