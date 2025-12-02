package com.simplevat.parserengine;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.simplevat.criteria.enums.TransactionEnum;
import com.simplevat.dao.DateFormatDao;
import com.simplevat.entity.DateFormat;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simplevat.rest.transactionparsingcontroller.TransactionParsingSettingPersistModel;

@Component
public class ExcelParser implements TransactionFileParser {

	private final Logger logger = LoggerFactory.getLogger(ExcelParser.class);

	@Autowired
	private DateFormatDao dateformatDao;

	@Override
	public List<Map<String, String>> parseSmaple(TransactionParsingSettingPersistModel model) {

		final Integer firstRowIndex = model.getHeaderRowNo() != null ? model.getHeaderRowNo() - 1 : 0;

		if (model.getFile() != null) {

			Map<Integer, String> indexHeaderMap = new HashMap<>();

			List<Map<String, String>> list = new ArrayList<>();

			// Creating a Workbook from an Excel file (.xls or .xlsx)
			try (Workbook workbook = WorkbookFactory.create(model.getFile().getInputStream())) {
				// Create a DataFormatter to format and get each cell's value as String
				DataFormatter dataFormatter = new DataFormatter();

				workbook.forEach(sheet -> {
					sheet.forEach(row -> {
						Map<String, String> dataeMap = new LinkedHashMap<>();
						row.forEach(cell -> {
							String cellValue = dataFormatter.formatCellValue(cell);
							if(!cellValue.isEmpty())
							{
							if (cell.getRow().getRowNum() == firstRowIndex) {
								indexHeaderMap.put(cell.getColumnIndex(), cellValue);
							} else if (cell.getRow().getRowNum() > firstRowIndex) {
								dataeMap.put(indexHeaderMap.get(cell.getColumnIndex()), cellValue);
							}
							}
						});
						if (!dataeMap.isEmpty())
							list.add(dataeMap);
					});
				});

				return list;
			} catch (EncryptedDocumentException | IOException | InvalidFormatException e) {
				logger.error("ERROR = ", e);
			}

		}
		return new ArrayList<Map<String, String>>();

	}

	// consider for singel page in sheet
	public Map parseImportData(TransactionParsingSettingDetailModel model, MultipartFile file) {

		Integer firstRowIndex = model.getHeaderRowNo() != null ? model.getHeaderRowNo() - 1 : 0;

		if (file != null) {
			Map<Integer, Set<Integer>> errorRowCellIndexMap = new HashMap<>();
			List<String> errorList = new ArrayList<>();
			Map<Integer, TransactionEnum> headerIndexMap = new HashMap<>();
			for (TransactionEnum transactionEnum : model.getIndexMap().keySet()) {
				headerIndexMap.put(model.getIndexMap().get(transactionEnum), transactionEnum);
			}
			List<Map<String, String>> list = new ArrayList<>();

			// Creating a Workbook from an Excel file (.xls or .xlsx)
			try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

				// Create a DataFormatter to format and get each cell's value as String
				DateFormat format = dateformatDao.findByPK(model.getDateFormatId());

				DataFormatter dataFormatter = new DataFormatter();

				Sheet sheet = workbook.getSheetAt(0);
				Iterator<Row> iterator = sheet.rowIterator();
				while(iterator.hasNext()) {
					Row row = iterator.next();
					if(isEmptyRow(row))
						continue;
					//				}
//				for (Row row : sheet) {
					Map<String, String> dataMap = new LinkedHashMap<>();

					for (Cell cell : row) {
						String cellValue = dataFormatter.formatCellValue(cell);
						if (cell.getRow().getRowNum() > firstRowIndex) {
							if (headerIndexMap.containsKey(cell.getColumnIndex())) {

								//
								String displayName = headerIndexMap.get(cell.getColumnIndex()).getDisplayName();
								// check for date format
								if (model.getDateFormatId() != null
										&& displayName.equals(TransactionEnum.TRANSACTION_DATE.getDisplayName())) {

									String validDate = isValidDate(cellValue, format);

									if (validDate.isEmpty()) {
										errorRowCellIndexMap = addErrorCellInRow(errorRowCellIndexMap,
												cell.getRow().getRowNum(), cell.getColumnIndex());
										errorList.add(cell.getRow().getRowNum() + "," + cell.getColumnIndex());

									} else {
										cellValue = validDate;
									}
								}

								// chcek for credit amount
								if (displayName.equals(TransactionEnum.CR_AMOUNT.getDisplayName())) {
									try {
										if(cellValue!=null&&cellValue.trim().isEmpty())
											cellValue ="0";
										new BigDecimal(cellValue.trim());
									} catch (Exception e) {
										errorRowCellIndexMap = addErrorCellInRow(errorRowCellIndexMap,
												cell.getRow().getRowNum(), cell.getColumnIndex());
										errorList.add(cell.getRow().getRowNum() + "," + cell.getColumnIndex());
									}
								}

								// chcek for Debit amount
								if (displayName.equals(TransactionEnum.DR_AMOUNT.getDisplayName())) {
									try {
										if(cellValue!=null&&cellValue.trim().isEmpty())
											cellValue ="0";
										new BigDecimal(cellValue.trim());
									} catch (Exception e) {
										errorRowCellIndexMap = addErrorCellInRow(errorRowCellIndexMap,
												cell.getRow().getRowNum(), cell.getColumnIndex());
										errorList.add(cell.getRow().getRowNum() + "," + cell.getColumnIndex());
									}
								}

								//
								dataMap.put(headerIndexMap.get(cell.getColumnIndex()).getDisplayName(), cellValue);
							}
						}
					}
					if (!dataMap.isEmpty()) {
						list.add(dataMap);
					}
				}

				Map responseMap = new LinkedHashMap<>();
				responseMap.put("data", list);
				responseMap.put("error", errorList);

				return responseMap;
			} catch (EncryptedDocumentException | IOException | InvalidFormatException e) {
				logger.error("ERROR = ", e);
			}

		}
		return new HashMap<>();

	}
	boolean isEmptyRow(Row row){
		boolean isEmptyRow = true;
		for(int cellNum = row.getFirstCellNum(); cellNum < row.getLastCellNum(); cellNum++){
			Cell cell = row.getCell(cellNum);
			if(cell != null && cell.getCellType() != Cell.CELL_TYPE_BLANK && StringUtils.isNotBlank(cell.toString())){
				isEmptyRow = false;
			}
		}
		return isEmptyRow;
	}
	@Override
	public List<com.simplevat.entity.bankaccount.Transaction> getModelListFromFile(
			TransactionParsingSettingDetailModel model, MultipartFile file, Integer bankId) {

		Integer firstRowIndex = model.getHeaderRowNo() != null ? model.getHeaderRowNo() - 1 : 0;

		if (file != null) {

			Map<TransactionEnum, Integer> dataColIndexMap = model.getIndexMap();

			List<Transaction> list = new ArrayList<>();

			// Creating a Workbook from an Excel file (.xls or .xlsx)
			try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
				// Create a DataFormatter to format and get each cell's value as String
				workbook.forEach(sheet -> {
					sheet.forEach(row -> {
						if (row.getRowNum() > firstRowIndex) {
							com.simplevat.entity.bankaccount.Transaction trnx = new Transaction();
							for (TransactionEnum transactionEnum : dataColIndexMap.keySet()) {
								// switch statement
							}
							list.add(trnx);
						}

					});
				});
				return list;
			} catch (EncryptedDocumentException | IOException | InvalidFormatException e) {
				logger.error("ERROR = ", e);
			}

		}
		return null;

	}

	public Map<Integer, Set<Integer>> addErrorCellInRow(Map<Integer, Set<Integer>> map, Integer row, Integer cell) {

		Set<Integer> cellSet = new HashSet<>();

		if (map.containsKey(row)) {
			cellSet = map.get(row);
		}

		cellSet.add(cell);
		map.put(row, cellSet);

		return map;
	}

	private String isValidDate(String dateStr, DateFormat format) {
		try {
			// bydefault excel give dd/mm/yyyy convert to specific format
			SimpleDateFormat formatter = new SimpleDateFormat(format.getFormat());
			Date date = formatter.parse(dateStr);

			formatter = new SimpleDateFormat(format.getFormat());
			return formatter.format(date);
		} catch (ParseException e) {
			return "";
		}
	}
}
