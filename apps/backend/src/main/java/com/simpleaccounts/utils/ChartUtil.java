package com.simpleaccounts.utils;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.model.ChartData;
import com.simpleaccounts.model.DashboardInvoiceDataModel;
import com.simpleaccounts.service.report.model.BankAccountTransactionReportModel;

@Component
@RequiredArgsConstructor
public class ChartUtil {

	private final DateFormatUtil dateFormatUtil;

	public Map<Object, Number> getCashMap(List<Object[]> rows, Integer count) {
		Map<Object, Number> cashMap = new LinkedHashMap<>(0);
//		if (rows == null || rows.size() == 0) {
//			return cashMap;
//		}
		List<ChartData> chartDatas = convert(rows);
		Collections.sort(chartDatas);

		chartDatas = populateForAlltheMonths(chartDatas, count);

		for (ChartData chartData : chartDatas) {
			cashMap.put(chartData.getKey(), chartData.getAmount());
		}
		return cashMap;
	}

	public List<ChartData> convert(List<Object[]> rows) {
		List<ChartData> chartDatas = new ArrayList<>();
		for (Object[] row : rows) {
			String[] transactionDate = ((String) row[1]).split("-");
			ChartData chartData = new ChartData(Integer.parseInt(transactionDate[0]) - 1,
					Integer.parseInt(transactionDate[1]), (Number) row[0]);
			chartDatas.add(chartData);
		}

		return chartDatas;
	}

	public List<BankAccountTransactionReportModel> convertToTransactionReportModel(List<Object[]> rows) {
		List<BankAccountTransactionReportModel> list = new ArrayList<>();
		for (Object[] row : rows) {
			BankAccountTransactionReportModel model = new BankAccountTransactionReportModel();
			model.setAmount((BigDecimal) row[0]);
			model.setDate(localeDateTimeToDate((LocalDateTime) row[1]));
			model.setReference((String) row[2]);
			model.setType("TYPE-TBD");
			model.setTransaction("TRANSACTION-TBD");

			list.add(model);
		}

		return list;

	}

	public int addAmount(List<Object[]> rows) {
		int amount = 0;
		List<ChartData> chartDatas = convert(rows);
		for (ChartData chartData : chartDatas) {
			amount = amount + chartData.getMonth();
		}
		return amount;
	}

	public List<ChartData> populateForAlltheMonths(List<ChartData> chartDatas, Integer count) {
		List<ChartData> emptyChartDatas = getEmptyChartData(count);
		if (chartDatas == null || chartDatas.size() == 0) {
			return emptyChartDatas;
		}
		for (ChartData emptyChartData : emptyChartDatas) {
			for (ChartData chartData : chartDatas) {
				if (emptyChartData.equals(chartData)) {
					emptyChartData.setAmount(chartData.getAmount());
					break;
				}
			}
		}
		return emptyChartDatas;

	}

	public Calendar getStartDate(int calendarField, int value) {
		Calendar prevYear = Calendar.getInstance();
		prevYear.add(calendarField, value);
		prevYear.set(Calendar.DAY_OF_MONTH, 1);
		prevYear.add(Calendar.MONTH, 1);
		return prevYear;
	}

	public Calendar getEndDate() {
		Calendar preMonth = Calendar.getInstance();
		preMonth.set(Calendar.DAY_OF_MONTH, 1);
		preMonth.add(Calendar.MONTH, 1);
		preMonth.add(Calendar.DAY_OF_MONTH, -1);
		return preMonth;
	}

	private List<ChartData> getEmptyChartData(Integer count) {
		List<ChartData> emptyChartDatas = new ArrayList<>();
		for (int i = 0; i < count; i++) {
			Calendar calendar = getStartDate(Calendar.MONTH, -count);
			calendar.add(Calendar.MONTH, i);
			ChartData chartData = new ChartData(calendar.get(Calendar.MONTH), calendar.get(Calendar.YEAR), 0);
			emptyChartDatas.add(chartData);
		}
		return emptyChartDatas;
	}

	public Date modifyDate(Date date, int calendarField, int value) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		calendar.add(calendarField, value);
		return calendar.getTime();
	}

	public int getMaxValue(Map<Object, Number> data) {
		List<Number> list = new ArrayList<>(data.values());
		Number max = 0;
		for (int i = 0; i < list.size(); i++) {
			Number number = list.get(i);
			if (number != null) {
				if (number.doubleValue() > max.doubleValue()) {
					max = number;
				}
			}
		}
		int maxValue;
		if (max.doubleValue() < 10) {
			maxValue = max.intValue() * 2;
		} else {
			maxValue = max.intValue() + max.intValue() / 5;
		}
		return maxValue;

	}

	public Date localeDateTimeToDate(LocalDateTime ldt) {
		ZonedDateTime zdt = ldt.atZone(ZoneId.systemDefault());
		Date output = Date.from(zdt.toInstant());
		return output;
	}

	public Object getCashFlow(Map<Object, Number> inflow, Map<Object, Number> outFlow) {

		List<Object> months = new ArrayList<>();
		Map<String, Object> map = new HashMap<String, Object>();
		Map<String, Object> inflowMap = new HashMap<String, Object>();
		List<Number> inflowData = new ArrayList<>();
		List<Number> outflowData = new ArrayList<>();

		for (Object key : inflow.keySet()) {
			inflowData.add(inflow.get(key));
			outflowData.add(outFlow.get(key));
			months.add(key);
		}

		inflowMap.put("label", "Inflow");
		inflowMap.put("data", inflowData);
		inflowMap.put("sum", inflowData.stream().mapToInt(Number::intValue).sum());
		map.put("inflow", inflowMap);

		Map<String, Object> outflowMap = new HashMap<String, Object>();
		outflowMap.put("label", "Outflow");
		outflowMap.put("data", outflowData);
		outflowMap.put("sum", outflowData.stream().mapToInt(Number::intValue).sum());
		map.put("outflow", outflowMap);
		map.put("labels", months);
		return (map);
	}

	public Object getinvoiceData(List<Invoice> invList, int monthCount) {
		List<Invoice> paid = new ArrayList<>();
		List<Invoice> paidCustomerInvoice = new ArrayList<>();
		List<Invoice> paidSupplierInvoice = new ArrayList<>();

		List<Invoice> due = new ArrayList<>();
		List<Invoice> overDue = new ArrayList<>();

		for (Invoice invoice : invList) {
			if (invoice.getStatus() > CommonStatusEnum.PAID.ordinal()) {
			if(invoice.getType()==1){
				paidSupplierInvoice.add(invoice);
			}
			else {
				paidCustomerInvoice.add(invoice);
			}
				paid.add(invoice);
			}
			else if (invoice.getStatus() < CommonStatusEnum.PAID.ordinal()
					&& LocalDateTime.now().isBefore(invoice.getInvoiceDueDate().atStartOfDay()))
				due.add(invoice);
			else
				overDue.add(invoice);
		}

		Map<String, BigDecimal> paidMap = calculate(paid);
		Map<String, BigDecimal> dueMap = calculate(due);
		Map<String, BigDecimal> overDueMap = calculate(overDue);
		Map<String, BigDecimal> paidCustomerMap = calculate(paidCustomerInvoice);
		Map<String, BigDecimal> paidSupplierMap = calculate(paidSupplierInvoice);

		List<Object> paidAmountList = new LinkedList<Object>();
		List<Object> dueAmountList = new LinkedList<Object>();
		List<Object> overDueAmountList = new LinkedList<Object>();
		List<Object> paidCustomerList = new LinkedList<Object>();
		List<Object> paidSupplierList = new LinkedList<Object>();
		List<String> mntList = getEmptyInvoiceChartData(monthCount);

		for (String mnt : mntList) {
			paidCustomerList.add(paidCustomerMap.containsKey(mnt) ? paidCustomerMap.get(mnt) : 0);
			paidSupplierList.add(paidSupplierMap.containsKey(mnt) ? paidSupplierMap.get(mnt) : 0);
			paidAmountList.add(paidMap.containsKey(mnt) ? paidMap.get(mnt) : 0);
			dueAmountList.add(dueMap.containsKey(mnt) ? dueMap.get(mnt) : 0);
			overDueAmountList.add(overDueMap.containsKey(mnt) ? overDueMap.get(mnt) : 0);
		}

		DashboardInvoiceDataModel.data paidLabelData = new DashboardInvoiceDataModel.data("Paid", paidAmountList);
		DashboardInvoiceDataModel.data dueLabeleData = new DashboardInvoiceDataModel.data("Due", dueAmountList);
		DashboardInvoiceDataModel.data overDueLabelData = new DashboardInvoiceDataModel.data("OverDue",
				overDueAmountList);
		DashboardInvoiceDataModel.data paidCustomerData = new DashboardInvoiceDataModel.data("Customer Invoice",
				paidCustomerList);
		DashboardInvoiceDataModel.data paidSupplierData = new DashboardInvoiceDataModel.data("Supplier Invoice",
				paidSupplierList);

		DashboardInvoiceDataModel model = new DashboardInvoiceDataModel(mntList, paidLabelData, dueLabeleData,
				overDueLabelData,paidCustomerData,paidSupplierData);
		return model;
	}

	private Map<String, BigDecimal> calculate(List<Invoice> invList) {

		Map<String, BigDecimal> map = new HashMap<String, BigDecimal>();
		for (Invoice inv : invList) {
			String mnt = dateFormatUtil.getLocalDateTimeAsString(inv.getInvoiceDate().atStartOfDay(), "MMM yyyy");
			if (map.containsKey(mnt)) {
				BigDecimal totalAmt = map.get(mnt);
				totalAmt = totalAmt.add(inv.getTotalAmount());
				map.put(mnt, totalAmt);
			} else {
				map.put(mnt, inv.getTotalAmount());
			}
		}
		return map;
	}

	private List<String> getEmptyInvoiceChartData(Integer count) {
		List<String> emptyChartDatas = new ArrayList<>();
		for (int i = 0; i < count; i++) {
			Calendar calendar = getStartDate(Calendar.MONTH, -count);
			calendar.add(Calendar.MONTH, i);
			emptyChartDatas.add(new SimpleDateFormat("MMM yyyy").format(calendar.getTime()));
		}
		return emptyChartDatas;
	}

}
