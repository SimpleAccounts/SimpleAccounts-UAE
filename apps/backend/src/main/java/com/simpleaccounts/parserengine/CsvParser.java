package com.simpleaccounts.parserengine;

import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingDetailModel;
import com.simpleaccounts.rest.transactionparsingcontroller.TransactionParsingSettingPersistModel;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class CsvParser implements TransactionFileParser {

	private final Logger logger = LoggerFactory.getLogger(CsvParser.class);

	private final DateFormatDao dateformatDao;

	@Override
	public List<Map<String, String>> parseSmaple(TransactionParsingSettingPersistModel model) {
		String line = "";
		String cvsSplitBy = ",";
		Map<Integer, String> indexHeaderMap = new HashMap<>();
		List<Map<String, String>> list = new ArrayList<>();

		try (BufferedReader br = new BufferedReader(new InputStreamReader(model.getFile().getInputStream(), StandardCharsets.UTF_8))) {
			int rowCount = 0;
			while ((line = br.readLine()) != null) {

				String[] splitList = line.split(cvsSplitBy);
				Map<String, String> dataMap = new LinkedHashMap<>();
				if (rowCount == 0) {
					int j = 0;
					for (String data : splitList) {
						indexHeaderMap.put(j, data);
						j++;
					}
				} else {
					int cellCount = 0;
					for (String data : splitList) {
						dataMap.put(indexHeaderMap.get(cellCount), data);
						cellCount++;
					}
					int maxItr = indexHeaderMap.size() - splitList.length;
					if (indexHeaderMap.size() != splitList.length) {
						for (int loop = 1; loop <= maxItr; loop++) {
							dataMap.put(indexHeaderMap.get(cellCount), "-");
						}
					}
					list.add(dataMap);
				}
				rowCount++;

			}
			return list;
		} catch (IOException e) {
			logger.error("Error =", e);
		}
		return new ArrayList<>();
	}

	@Override
	public List<Transaction> getModelListFromFile(TransactionParsingSettingDetailModel model, MultipartFile file,
												  Integer bankId) {
		return new ArrayList<>();
	}

	public Map<String, Object> parseImportData(TransactionParsingSettingDetailModel model, InputStream inputStream) {
		String line = "";
		String cvsSplitBy = ",";

		List<Map<String, String>> list = new LinkedList<>();
		List<String> errorList = new ArrayList<>();

		try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

			Map<Integer, TransactionEnum> headerIndexMap = new LinkedHashMap<>();

			for (TransactionEnum transactionEnum : model.getIndexMap().keySet()) {
				headerIndexMap.put(model.getIndexMap().get(transactionEnum), transactionEnum);
			}

			int rowCount = 0;
			while ((line = br.readLine()) != null) {

				String[] splitList = splitCsvLinePreservingQuotes(line);
				Map<String, String> dataMap = new LinkedHashMap<>();

				if (rowCount > 0) {
					int cellCount = 0;
					for (String data : splitList) {
						if (headerIndexMap.containsKey(cellCount)) {
							String displayName = headerIndexMap.get(cellCount).getDisplayName();

							// check for date format
							if (model.getDateFormatId() != null
									&& displayName.equalsIgnoreCase(TransactionEnum.TRANSACTION_DATE.getDisplayName())) {

								try {
									DateFormat format = dateformatDao.findByPK(model.getDateFormatId());
									SimpleDateFormat formatter = new SimpleDateFormat(format.getFormat());
									formatter.parse(data);
									dataMap.put(displayName, data);
								} catch (ParseException e) {

									errorList.add(rowCount + "," + cellCount);
								}
							}

							// chcek for credit amount
							else if (displayName.equalsIgnoreCase(TransactionEnum.CR_AMOUNT.getDisplayName())) {
								try {
									if(data!=null&&data.trim().isEmpty())
										data ="0";
									if(data.contains("\"")){
										data = data.replace("\"","");
									}
									if(data.contains(",")){
										data = data.replace(",","");
									}
									new BigDecimal(data.trim());
									dataMap.put(displayName, data.trim());
								} catch (Exception e) {

									dataMap.put(displayName,"0");

								}
							}

							// chcek for Debit amount
							else if (displayName.equalsIgnoreCase(TransactionEnum.DR_AMOUNT.getDisplayName())) {
								try {
									if(data!=null&&data.trim().isEmpty())
										data ="0";
									if(data.contains("\"")){
										data = data.replace("\"","");
									}
									if(data.contains(",")){
										data = data.replace(",","");
									}

									new BigDecimal(data.trim());
									dataMap.put(displayName, data.trim());

								} catch (Exception e) {
									dataMap.put(displayName,"0");

								}
							}
							else
							{
								dataMap.put(displayName, data.trim());
							}
						}
						cellCount++;
					}
					if (headerIndexMap.size() != splitList.length) {
						for (TransactionEnum transactionEnum : model.getIndexMap().keySet()) {
							if (!dataMap.containsKey(transactionEnum.getDisplayName())) {
								if(TransactionEnum.CR_AMOUNT==transactionEnum || TransactionEnum.DR_AMOUNT==transactionEnum  )
								{
									dataMap.put(transactionEnum.getDisplayName(), "0");
								}
								else {
									dataMap.put(transactionEnum.getDisplayName(), "-");
									errorList.add(rowCount + "," + cellCount);
								}
							}
						}
					}

					list.add(dataMap);
				}
				rowCount++;

			}

			Map<String, Object> responseMap = new LinkedHashMap<>();
			responseMap.put("data", list);
			responseMap.put("error", errorList.isEmpty() ? null : errorList);

			return responseMap;
		} catch (IOException e) {
			logger.error("Error = ", e);
		}
		return new HashMap<>();
	}

	private static String[] splitCsvLinePreservingQuotes(String line) {
		List<String> fields = new ArrayList<>();
		StringBuilder current = new StringBuilder();
		boolean inQuotes = false;

		for (int i = 0; i < line.length(); i++) {
			char c = line.charAt(i);
			if (c == '"') {
				if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
					current.append('"').append('"');
					i++;
				} else {
					inQuotes = !inQuotes;
					current.append(c);
				}
			} else if (c == ',' && !inQuotes) {
				fields.add(current.toString());
				current.setLength(0);
			} else {
				current.append(c);
			}
		}

		fields.add(current.toString());
		return fields.toArray(new String[0]);
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

}
