package com.simpleaccounts.rest.payroll.service.Impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.SalaryRoleDao;
import com.simpleaccounts.rest.payroll.service.SalaryRoleService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("salaryRoleService")
@Transactional
@RequiredArgsConstructor
public class SalaryRoleServiceImpl extends SalaryRoleService {

    private final SalaryRoleDao salaryRoleDao;
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