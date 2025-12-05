package com.simpleaccounts.rest.payroll.daoimpl;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.SalaryRoleDao;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@DataJpaTest
@Import(SalaryRoleDaoImpl.class)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:salaryroletest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.properties.hibernate.hbm2ddl.auto=none",
        "spring.liquibase.enabled=false",
        "spring.datasource.initialization-mode=always",
        "spring.datasource.schema=classpath:/schema-payroll.sql"
})
class SalaryRoleDaoImplTest {

    @Autowired
    private SalaryRoleDao salaryRoleDao;

    @Test
    void getSalaryRolesForDropdownShouldReturnOrderedLabels() {
        SalaryRole analyst = persistSalaryRole("Analyst", false);
        SalaryRole manager = persistSalaryRole("Manager", false);

        List<DropdownObjectModel> dropdown = salaryRoleDao.getSalaryRolesForDropdownObjectModel();

        assertThat(dropdown)
                .extracting(DropdownObjectModel::getLabel)
                .containsExactly(analyst.getRoleName(), manager.getRoleName());
        assertThat(dropdown)
                .extracting(DropdownObjectModel::getValue)
                .containsExactly(analyst.getId(), manager.getId());
    }

    @Test
    void getSalaryRoleListShouldExcludeSoftDeletedRoles() {
        SalaryRole analyst = persistSalaryRole("Analyst", false);
        SalaryRole manager = persistSalaryRole("Manager", false);
        persistSalaryRole("Deprecated", true);

        PaginationModel pagination = new PaginationModel();
        pagination.setSortingCol("roleName");
        pagination.setOrder("ASC");
        pagination.setPageSize(10);
        pagination.setPageNo(0);

        PaginationResponseModel response =
                salaryRoleDao.getSalaryRoleList(Collections.emptyMap(), pagination);

        assertThat(response.getCount()).isEqualTo(2);

        @SuppressWarnings("unchecked")
        List<SalaryRole> roles = (List<SalaryRole>) response.getData();

        assertThat(roles)
                .extracting(SalaryRole::getRoleName)
                .containsExactly(analyst.getRoleName(), manager.getRoleName());
    }

    private SalaryRole persistSalaryRole(String roleName, boolean deleted) {
        SalaryRole role = new SalaryRole();
        role.setRoleName(roleName);
        role.setDeleteFlag(deleted);
        role.setCreatedBy(99);
        role.setCreatedDate(LocalDateTime.now());
        role.setLastUpdateDate(LocalDateTime.now());
        return salaryRoleDao.persist(role);
    }
}

