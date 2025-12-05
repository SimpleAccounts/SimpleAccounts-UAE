package com.simpleaccounts.rest.payroll.daoimpl;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayrollJpaTest;
import com.simpleaccounts.rest.payroll.dao.SalaryComponentDao;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;

@PayrollJpaTest
@Import(SalaryComponentDaoImpl.class)
class SalaryComponentDaoImplTest {

    @Autowired
    private SalaryComponentDao salaryComponentDao;

    @Autowired
    private EntityManager entityManager;

    @Test
    void getSalaryComponentsForDropdownObjectModelShouldExcludeBasicSalary() {
        SalaryStructure structure = persistStructure("Allowance");
        SalaryStructure otherStructure = persistStructure("Deduction");

        persistComponent(structure, "Basic SALARY");
        SalaryComponent allowance = persistComponent(structure, "Housing Allowance");
        persistComponent(otherStructure, "Other Structure Component");

        List<DropdownObjectModel> dropdown =
                salaryComponentDao.getSalaryComponentsForDropdownObjectModel(structure.getId());

        assertThat(dropdown)
                .hasSize(1)
                .first()
                .extracting(DropdownObjectModel::getValue)
                .isEqualTo(allowance.getId());
    }

    @Test
    void getSalaryComponentListShouldReturnAllComponentsInResponse() {
        SalaryStructure structure = persistStructure("General");
        persistComponent(structure, "Housing");
        persistComponent(structure, "Transport");

        PaginationResponseModel response =
                salaryComponentDao.getSalaryComponentList(Collections.emptyMap(), new PaginationModel());

        assertThat(response.getCount()).isEqualTo(2);

        @SuppressWarnings("unchecked")
        List<SalaryComponent> components = (List<SalaryComponent>) response.getData();
        assertThat(components).hasSize(2);
    }

    @Test
    void getDefaultSalaryComponentListShouldReturnFirstThreeIds() {
        SalaryStructure structure = persistStructure("Defaults");
        persistComponent(structure, "Component One");
        persistComponent(structure, "Component Two");
        persistComponent(structure, "Component Three");
        persistComponent(structure, "Component Four");

        List<SalaryComponent> defaults = salaryComponentDao.getDefaultSalaryComponentList();

        assertThat(defaults)
                .hasSize(3)
                .allMatch(component -> component.getId() < 4);
    }

    private SalaryStructure persistStructure(String name) {
        SalaryStructure structure = new SalaryStructure();
        structure.setName(name);
        entityManager.persist(structure);
        return structure;
    }

    private SalaryComponent persistComponent(SalaryStructure structure, String description) {
        SalaryComponent component = new SalaryComponent();
        component.setSalaryStructure(structure);
        component.setDescription(description);
        component.setDeleteFlag(false);
        component.setIsEditable(false);
        entityManager.persist(component);
        return component;
    }
}
