package com.simpleaccounts.rest.payroll.daoimpl;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayrollJpaTest;
import com.simpleaccounts.rest.payroll.SalaryStructureDao;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;

@PayrollJpaTest
@Import(SalaryStructureDaoImpl.class)
class SalaryStructureDaoImplTest {

    @Autowired
    private SalaryStructureDao salaryStructureDao;

    @Test
    void getSalaryStructureListShouldReturnPersistedStructures() {
        persistStructure("Allowance");
        persistStructure("Deduction");

        PaginationResponseModel response =
                salaryStructureDao.getSalaryStructureList(Collections.emptyMap(), new PaginationModel());

        assertThat(response.getCount()).isEqualTo(2);

        @SuppressWarnings("unchecked")
        List<SalaryStructure> structures = (List<SalaryStructure>) response.getData();
        assertThat(structures).hasSize(2);
    }

    @Test
    void getSalaryStructureDropdownShouldReturnOrderedNames() {
        SalaryStructure allowance = persistStructure("Allowance");
        SalaryStructure deduction = persistStructure("Deduction");

        List<DropdownObjectModel> dropdown = salaryStructureDao.getSalaryStructureDropdown();

        assertThat(dropdown)
                .hasSize(2)
                .extracting(DropdownObjectModel::getValue)
                .containsExactly(allowance.getId(), deduction.getId());
    }

    private SalaryStructure persistStructure(String name) {
        SalaryStructure structure = new SalaryStructure();
        structure.setName(name);
        structure.setType("PAYROLL");
        return salaryStructureDao.persist(structure);
    }
}
