package com.simplevat.rest.reports;

import com.simplevat.constant.ChartOfAccountCategoryIdEnumConstant;
import com.simplevat.entity.ReportsConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportsColumnConfigurationRepository extends JpaRepository<ReportsConfiguration,Integer> {

}