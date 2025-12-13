package com.simpleaccounts.rest.payroll.service.Impl;


import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.dao.SalaryComponentDao;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("salaryComponentService")
@Transactional
@RequiredArgsConstructor
public class SalaryComponentServiceImpl extends SalaryComponentService {

    private final SalaryComponentDao salaryComponentDao;

    @Override
    protected Dao<Integer, SalaryComponent> getDao() {
        return this.salaryComponentDao;
    }

    public List<DropdownObjectModel> getSalaryComponentForDropdownObjectModel(Integer id){

        return salaryComponentDao.getSalaryComponentsForDropdownObjectModel(id);
    }

    public PaginationResponseModel getSalaryComponentList(Map<Object, Object> filterDataMap, PaginationModel paginationModel){

        return salaryComponentDao.getSalaryComponentList(filterDataMap,paginationModel);
    }

    public  List<SalaryComponent> getDefaultSalaryComponentList(){

        return salaryComponentDao.getDefaultSalaryComponentList();
    }
}
