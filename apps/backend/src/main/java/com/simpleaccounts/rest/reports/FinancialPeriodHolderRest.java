/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.reports;

import com.simpleaccounts.model.FinancialPeriodRestModel;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 *
 * @author admin
 */
public class FinancialPeriodHolderRest {

    private static final int INITIALYEAR = 2015;

    public static List<FinancialPeriodRestModel> getFinancialPeriodList() {
        List<FinancialPeriodRestModel> financialPeriodList = new ArrayList<>();
        Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int id = 1;
        if (year >= INITIALYEAR) {
            financialPeriodList.clear();
            FinancialPeriodRestModel financialCustomPeriod = new FinancialPeriodRestModel();
            financialCustomPeriod.setId(id);
            financialCustomPeriod.setLastDate(null);
            financialCustomPeriod.setStartDate(null);
            financialCustomPeriod.setName("Custom");
            financialPeriodList.add(financialCustomPeriod);
            id++;
            for (int i = 0; i <= year - INITIALYEAR; i++) {
                String name = "";
                FinancialPeriodRestModel financialPeriod = new FinancialPeriodRestModel();
                if (i == 0) {
                    FinancialPeriodRestModel financialPeriod1 = new FinancialPeriodRestModel();
                    Calendar calendar1 = Calendar.getInstance();
                    calendar1.set(Calendar.YEAR, year - i);
                    calendar1.set(Calendar.DAY_OF_MONTH, 01);
                    Date startCurrentMonthDate = calendar1.getTime();
                    calendar1.set(Calendar.YEAR, year - i);
                    calendar1.set(Calendar.DAY_OF_MONTH, calendar1.getActualMaximum(Calendar.DATE));
                    Date endCurrentMonthDate = calendar1.getTime();
                    financialPeriod1.setId(id);
                    financialPeriod1.setLastDate(endCurrentMonthDate);
                    financialPeriod1.setStartDate(startCurrentMonthDate);
                    name = "Current Month";
                    financialPeriod1.setName(name);
                    financialPeriodList.add(financialPeriod1);
                    id++;
                    Calendar calendar2 = Calendar.getInstance();
                    FinancialPeriodRestModel financialPeriod2 = new FinancialPeriodRestModel();
                    calendar2.set(Calendar.YEAR, year - i);
                    calendar2.add(Calendar.MONTH, -1);
                    calendar2.set(Calendar.DAY_OF_MONTH, 01);
                    Date startPreviousMonthDate = calendar2.getTime();
                    calendar2.set(Calendar.YEAR, year - i);
                    calendar2.add(Calendar.MONTH, 0);
                    calendar2.set(Calendar.DAY_OF_MONTH, calendar2.getActualMaximum(Calendar.DATE));
                    Date endPreviousMonthDate = calendar2.getTime();
                    financialPeriod2.setId(id);
                    financialPeriod2.setLastDate(endPreviousMonthDate);
                    financialPeriod2.setStartDate(startPreviousMonthDate);
                    name = "Previous Month";
                    financialPeriod2.setName(name);
                    financialPeriodList.add(financialPeriod2);
                }
                id++;
                calendar.set(Calendar.YEAR, year - i);
                calendar.set(Calendar.MONTH, 00);
                calendar.set(Calendar.DAY_OF_MONTH, 01);
                Date startDate = calendar.getTime();
                calendar.set(Calendar.YEAR, year - i);
                calendar.set(Calendar.MONTH, 11);
                calendar.set(Calendar.DAY_OF_MONTH, 31);
                Date endDate = calendar.getTime();
                financialPeriod.setId(id);
                financialPeriod.setLastDate(endDate);
                financialPeriod.setStartDate(startDate);

                if (i > 1) {
                    name = new SimpleDateFormat("MM/dd/yyyy").format(startDate) + " To " + new SimpleDateFormat("MM/dd/yyyy").format(endDate);
                } else if (i == 1) {
                    name = "Previous Year";
                } else {
                    name = "Current Year";
                }
                financialPeriod.setName(name);
                financialPeriodList.add(financialPeriod);
            }
        }
        return financialPeriodList;
    }
}
