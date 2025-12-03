package com.simpleaccounts.rest.reports;

import com.simpleaccounts.constant.ChartOfAccountCategoryIdEnumConstant;
import com.simpleaccounts.entity.ReportsConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportsColumnConfigurationRepository extends JpaRepository<ReportsConfiguration,Integer> {

}