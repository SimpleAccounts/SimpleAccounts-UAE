package com.simpleaccounts.rest.payroll.daoimpl;

import static org.assertj.core.api.Assertions.assertThat;

import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.entity.SalaryTemplate;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayrollJpaTest;
import com.simpleaccounts.rest.payroll.SalaryTemplateDao;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;

@PayrollJpaTest
@Import(SalaryTemplateDaoImpl.class)
class SalaryTemplateDaoImplTest {

    @Autowired
    private SalaryTemplateDao salaryTemplateDao;

    @Autowired
    private EntityManager entityManager;

    @Test
    void getSalaryTemplateListShouldReturnPersistedTemplates() {
        persistTemplate("Allowance", "Housing", "BASIC*0.3", "1000");
        persistTemplate("Allowance", "Transport", "BASIC*0.1", "500");

        PaginationResponseModel response =
                salaryTemplateDao.getSalaryTemplateList(Collections.emptyMap(), new PaginationModel());

        assertThat(response.getCount()).isEqualTo(2);

        @SuppressWarnings("unchecked")
        List<SalaryTemplate> templates = (List<SalaryTemplate>) response.getData();
        assertThat(templates).hasSize(2);
    }

    @Test
    void getDefaultTemplatesShouldProjectComponentColumns() {
        persistTemplate("Allowance", "Medical", "BASIC*0.05", "250");

        List<?> defaults = salaryTemplateDao.getDefaultTemplates();

        assertThat(defaults).hasSize(1);
        Object[] row = (Object[]) defaults.get(0);
        assertThat(row[0]).isEqualTo("Allowance");
        assertThat(row[1]).isEqualTo("Medical");
        assertThat(row[2]).isEqualTo("BASIC*0.05");
        assertThat(row[3]).isEqualTo("250");
    }

    private void persistTemplate(String structureName, String description, String formula, String flatAmount) {
        SalaryStructure structure = new SalaryStructure();
        structure.setName(structureName);
        entityManager.persist(structure);

        SalaryComponent component = new SalaryComponent();
        component.setSalaryStructure(structure);
        component.setDescription(description);
        component.setFormula(formula);
        component.setFlatAmount(flatAmount);
        entityManager.persist(component);

        SalaryTemplate template = new SalaryTemplate();
        template.setSalaryComponentId(component);
        template.setIsActive(true);
        salaryTemplateDao.persist(template);
    }
}
