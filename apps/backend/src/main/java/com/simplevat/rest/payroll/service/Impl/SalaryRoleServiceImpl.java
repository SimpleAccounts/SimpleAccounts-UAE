package com.simplevat.rest.payroll.service.Impl;

import com.simplevat.constant.dbfilter.BankAccounrFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.entity.SalaryRole;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.SalaryRoleDao;
import com.simplevat.rest.payroll.service.SalaryRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("salaryRoleService")
@Transactional
public class SalaryRoleServiceImpl extends SalaryRoleService {

    @Autowired
    private SalaryRoleDao salaryRoleDao;
    @Override
    protected Dao<Integer, SalaryRole> getDao() {
        return this.salaryRoleDao;
    }


    public  List<DropdownObjectModel> getSalaryRolesForDropdownObjectModel(){

        return salaryRoleDao.getSalaryRolesForDropdownObjectModel();
    }
    @Override
    public PaginationResponseModel getSalaryRoleList(Map<Object, Object> filterDataMap,
                                                   PaginationModel paginationModel) {
        return salaryRoleDao.getSalaryRoleList(filterDataMap, paginationModel);
    }

}