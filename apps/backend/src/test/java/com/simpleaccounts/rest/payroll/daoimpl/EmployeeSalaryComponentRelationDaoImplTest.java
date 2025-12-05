package com.simpleaccounts.rest.payroll.daoimpl;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeSalaryComponentRelation;
import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.rest.payroll.PayrollJpaTest;
import com.simpleaccounts.rest.payroll.dao.EmployeeSalaryComponentRelationDao;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;

@PayrollJpaTest
@Import(EmployeeSalaryComponentRelationDaoImpl.class)
class EmployeeSalaryComponentRelationDaoImplTest {

    @Autowired
    private EmployeeSalaryComponentRelationDao relationDao;

    @Autowired
    private EntityManager entityManager;

    @Test
    void getDefaultSalaryComponentByEmployeeIdShouldReturnPersistedRelations() {
        SalaryStructure structure = persistStructure("Allowance");
        SalaryComponent component = persistComponent(structure, "Housing Allowance");
        Employee employee = persistEmployee("Alice");

        EmployeeSalaryComponentRelation relation = new EmployeeSalaryComponentRelation();
        relation.setEmployeeId(employee);
        relation.setSalaryComponentId(component);
        relation.setSalaryStructure(structure);
        relation.setDescription("Housing");
        relation.setFormula("BASIC*0.3");
        relation.setNoOfDays(BigDecimal.valueOf(30));
        relation.setFlatAmount("0");
        relation.setMonthlyAmount(BigDecimal.valueOf(1000));
        relation.setYearlyAmount(BigDecimal.valueOf(12000));
        relation.setDeleteFlag(false);
        relation.setCreatedBy(1);
        relation.setCreatedDate(LocalDateTime.now());
        relation.setLastUpdateDate(LocalDateTime.now());
        relation.setVersionNumber(1);
        entityManager.persist(relation);

        List<EmployeeSalaryComponentRelation> result =
                relationDao.getDefaultSalaryComponentByEmployeeId(employee.getId());

        assertThat(result)
                .hasSize(1)
                .first()
                .extracting(EmployeeSalaryComponentRelation::getDescription)
                .isEqualTo("Housing");
    }

    private SalaryStructure persistStructure(String name) {
        SalaryStructure structure = new SalaryStructure();
        structure.setName(name);
        structure.setType("PAYROLL");
        structure.setDeleteFlag(false);
        structure.setCreatedBy(1);
        structure.setCreatedDate(LocalDateTime.now());
        structure.setLastUpdateDate(LocalDateTime.now());
        structure.setVersionNumber(1);
        entityManager.persist(structure);
        return structure;
    }

    private SalaryComponent persistComponent(SalaryStructure structure, String description) {
        SalaryComponent component = new SalaryComponent();
        component.setSalaryStructure(structure);
        component.setDescription(description);
        component.setFormula("BASIC*0.1");
        component.setFlatAmount("0");
        component.setDeleteFlag(false);
        component.setIsEditable(false);
        component.setCreatedBy(1);
        component.setCreatedDate(LocalDateTime.now());
        component.setLastUpdateDate(LocalDateTime.now());
        component.setVersionNumber(1);
        entityManager.persist(component);
        return component;
    }

    private Employee persistEmployee(String firstName) {
        Employee employee = new Employee();
        employee.setFirstName(firstName);
        employee.setLastName("Test");
        employee.setDob(LocalDateTime.now());
        employee.setEmail(firstName.toLowerCase() + "@example.com");
        employee.setIsActive(true);
        employee.setCreatedBy(1);
        employee.setCreatedDate(LocalDateTime.now());
        employee.setLastUpdateDate(LocalDateTime.now());
        employee.setDeleteFlag(false);
        employee.setVersionNumber(1);
        entityManager.persist(employee);
        return employee;
    }
}
