package com.simpleaccounts.rest.transactionimportcontroller;

import java.io.BufferedReader;
import lombok.RequiredArgsConstructor;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.MathContext;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import com.simpleaccounts.service.DateFormatService;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

import com.simpleaccounts.constant.TransactionCreationMode;
import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.constant.TransactionStatusConstant;
import com.simpleaccounts.model.TransactionModel;
import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.dao.TransactionParsingSettingDao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@Component
@RequiredArgsConstructor
public class TransactionImportRestHelper {
	private final Logger LOGGER = LoggerFactory.getLogger(TransactionImportRestHelper.class);

	private String transactionDate = "Transaction Date";

	private String description = "Description";

	private String debitAmount = "Debit Amount";

	private String creditAmount = "Credit Amount";
	private List<TransactionModel> creditTransaction = new ArrayList<>();
	private boolean transactionDateBoolean = false;
	private boolean descriptionBoolean = false;
	private List<TransactionModel> transactionList = new ArrayList<>();
	private boolean debitAmountBoolean = false;
	private boolean creditAmountBoolean = false;
	List<String> headerText = new ArrayList<String>();
	List<String> headerTextData = new ArrayList<String>();
	private boolean isDataRepeated = false;
	private boolean tableChange = true;
	Integer transcationDatePosition = -1;
	Integer transcationDescriptionPosition = -1;
	Integer transcationDebitPosition = -1;
	Integer transcationCreditPosition = -1;
	private List<String> invalidHeaderTransactionList = new ArrayList<>();
	private Integer totalErrorRows = 0;
	private boolean renderButtonOnValidData;
	private boolean headerIncluded = true;
	private Integer headerCount;
	private String dateFormat;

	private final BankAccountService bankAccountService;

	private final DateFormatDao dateFormatDao;

	private final TransactionParsingSettingDao transactionParsingSettingDao;

	private final TransactionService transactionService;

	private final DateFormatService dateFormatService;

	public void handleFileUpload(@ModelAttribute("modelCircular") MultipartFile fileattached) {
		List<CSVRecord> listParser = new ArrayList<>();
		transactionDate = "Transaction Date";
		description = "Description";
		debitAmount = "Debit Amount";
		creditAmount = "Credit Amount";
		try {
			InputStream inputStream = fileattached.getInputStream();
			BufferedReader br = new BufferedReader(new InputStreamReader(inputStream));
			CSVParser parser = CSVFormat.EXCEL.parse(br);
			listParser = parser.getRecords();
		} catch (IOException e) {
			LOGGER.error(ERROR, e);
		}
		populateTranscationOnFileUpload(listParser);
	}

	public void populateTranscationOnFileUpload(List<CSVRecord> listParser) {
		headerText.clear();
		headerTextData.clear();
		transactionList.clear();
		creditTransaction.clear();
		invalidHeaderTransactionList.clear();
		totalErrorRows = 0;
		renderButtonOnValidData = true;
		isDataRepeated = false;
		Integer headerValue = 0;
		getHeaderListData();
		Set<String> setToReturn = new HashSet<>();
		for (String name : headerTextData) {
			if (!setToReturn.add(name)) {
				// your duplicate element
				isDataRepeated = true;
				break;
			}
		}

		try {
			if (listParser != null) {
				int recordNo = 0;
				int headerIndex = 0;
				Integer header;
				Integer headerIndexPosition = 0;
				Integer headerIndexPositionCounter = 0;

				for (CSVRecord cSVRecord : listParser) {
					if (headerIncluded) {
						header = headerCount + 1;
						headerIndexPosition = header;
						headerValue = 1;
					} else {
						header = headerCount;
						headerIndexPosition = header;
						headerValue = 0;
					}
					if (headerIndexPosition.equals(header)) {
						if (headerIndexPositionCounter == header - headerValue) {
							int i = 0;
							boolean isDataPresent = true;
							while (isDataPresent) {
								try {
									if (tableChange) {
										if (cSVRecord.get(i).equals(transactionDate)) {
											transactionDateBoolean = true;
											transcationDatePosition = i;
										} else if (cSVRecord.get(i).equals(description)) {
											descriptionBoolean = true;
											transcationDescriptionPosition = i;
										} else if (cSVRecord.get(i).equals(debitAmount)) {
											debitAmountBoolean = true;
											transcationDebitPosition = i;
										} else if (cSVRecord.get(i).equals(creditAmount)) {
											creditAmountBoolean = true;
											transcationCreditPosition = i;
										}
									}
									headerText.add(cSVRecord.get(i));
									i = i + 1;
								} catch (Exception e) {
									isDataPresent = false;
								}
							}

							headerIndexPosition++;
							if (isDataRepeated) {
								break;
							}
							if (!transactionDateBoolean && !descriptionBoolean && !debitAmountBoolean
									&& !creditAmountBoolean) {
								break;
							}
						}
						headerIndexPositionCounter++;
					}

					if (headerIndex < header) {
						headerIndex++;
					} else {
						TransactionModel transaction = new TransactionModel();
						transaction.setId(++recordNo);
						int i = 0;
						String date = cSVRecord.get(transcationDatePosition);
						String description = cSVRecord.get(transcationDescriptionPosition);
						String drAmount = cSVRecord.get(transcationDebitPosition);
						String crAmount = cSVRecord.get(transcationCreditPosition);

						try {
							transaction.setDate("date");
							TemporalAccessor ta = DateTimeFormatter.ofPattern(dateFormat).parse(date);
							DateFormat formatter = new SimpleDateFormat(dateFormat, Locale.US);
							Date dateTranscation = (Date) formatter.parse(date);
							LocalDateTime transactionDate = Instant.ofEpochMilli(dateTranscation.getTime())
									.atZone(ZoneId.systemDefault()).toLocalDateTime();
							DateFormat df = new SimpleDateFormat(dateFormat);
							String reportDate = df.format(dateTranscation);
							transaction.setDate("");
							if (!drAmount.isEmpty()) {
								transaction.setDebit("debit");
								new BigDecimal(Float.valueOf(drAmount));
								transaction.setDebit("");
							}
							if (!crAmount.isEmpty()) {
								transaction.setCredit("credit");
								new BigDecimal(Float.valueOf(crAmount));
								transaction.setCredit("");
							}
							transaction.setTransactionDate(date);
							transaction.setDescription(description);
							transaction.setDebit(drAmount);
							transaction.setCredit(crAmount);
							transaction.setValidData(Boolean.TRUE);
							transaction.setFormat(TransactionStatusConstant.VALID);
							transactionList.add(transaction);
						} catch (Exception e) {
							totalErrorRows = totalErrorRows + 1;
							transaction.setTransactionDate(date);
							transaction.setDescription(description);
							transaction.setDebit(drAmount);
							transaction.setCredit(crAmount);
							transaction.setValidData(Boolean.FALSE);
							transaction.setFormat(TransactionStatusConstant.INVALID);
							transactionList.add(transaction);
							renderButtonOnValidData = false;
						}

						if (transaction.getCredit() != null && !transaction.getCredit().trim().isEmpty()) {
							creditTransaction.add(transaction);
						}
					}
				}
				if (transactionDateBoolean && descriptionBoolean && debitAmountBoolean && creditAmountBoolean) {
					transactionDateBoolean = false;
					descriptionBoolean = false;
					debitAmountBoolean = false;
					creditAmountBoolean = false;

				}

				if (!invalidHeaderTransactionList.isEmpty()) {
					StringBuilder validationMessage = new StringBuilder("Heading mismatch  ");
					for (String invalidHeading : invalidHeaderTransactionList) {
						validationMessage.append(invalidHeading).append("  ");
					}
				}
			}
		} catch (Exception ex) {
			LOGGER.error(ERROR, ex);
		}
	}

	private void getHeaderListData() {
		headerTextData.add(transactionDate);
		headerTextData.add(description);
		headerTextData.add(debitAmount);
		headerTextData.add(creditAmount);
	}

	public List<com.simpleaccounts.entity.bankaccount.Transaction> getEntity(TransactionImportModel transactionImportModel) {

		if (transactionImportModel != null && transactionImportModel.getImportDataMap() != null
				&& !transactionImportModel.getImportDataMap().isEmpty()) {

			List<com.simpleaccounts.entity.bankaccount.Transaction> transactions = new ArrayList<>();

			BankAccount bankAcc = bankAccountService.findByPK(transactionImportModel.getBankId());

			dateFormat = transactionParsingSettingDao.getDateFormatByTemplateId(transactionImportModel.getTemplateId());
			DateFormat formatter = new SimpleDateFormat(dateFormat);

			for (Map<String, Object> dataMap : transactionImportModel.getImportDataMap()) {
				com.simpleaccounts.entity.bankaccount.Transaction trnx = new com.simpleaccounts.entity.bankaccount.Transaction();
				trnx.setBankAccount(bankAcc);

				for (String dbColName : dataMap.keySet()) {

					TransactionEnum dbColEnum = TransactionEnum.getByDisplayName(dbColName);

					String data = (String) dataMap.get(dbColEnum.getDbColumnName());
					switch (dbColEnum) {

					case CR_AMOUNT:
					case DR_AMOUNT:
//					case AMOUNT:

						MathContext mc = new MathContext(4); // 2 precision

////							if (dataMap.get(TransactionEnum.CREDIT_DEBIT_FLAG.getDisplayName()).equals("C")) {
////								currentBalance = currentBalance.add(trnx.getTransactionAmount());
////							} else {
////								currentBalance = currentBalance.subtract(trnx.getTransactionAmount());
////							}

							if (dbColEnum.equals(TransactionEnum.DR_AMOUNT)) {
								data = (String) dataMap.get(TransactionEnum.DR_AMOUNT.getDbColumnName());
								if (!data.isEmpty() && !data.equals("-")) {
									BigDecimal debitAmt = BigDecimal.valueOf((Float.valueOf(data)));
									if (debitAmt.compareTo(BigDecimal.ZERO) > 0) {
										trnx.setTransactionAmount(debitAmt);
										trnx.setTransactionDueAmount(debitAmt);
									//	currentBalance = currentBalance.subtract(trnx.getTransactionAmount());
										trnx.setDebitCreditFlag('D');
									}
								}
							}
							if (dbColEnum.equals(TransactionEnum.CR_AMOUNT)) {
								data = (String) dataMap.get(TransactionEnum.CR_AMOUNT.getDbColumnName());
								if (!data.isEmpty() && !data.equals("-")) {
									BigDecimal creditAmt = BigDecimal.valueOf(Float.parseFloat(data));
									if (creditAmt.compareTo(BigDecimal.ZERO) > 0) {
										trnx.setTransactionAmount(creditAmt);
										trnx.setTransactionDueAmount(creditAmt);
									//	currentBalance = currentBalance.add(trnx.getTransactionAmount());
										trnx.setDebitCreditFlag('C');
									}
								}
							}

					//	trnx.setCurrentBalance(currentBalance);
						break;

					case DESCRIPTION:
						trnx.setTransactionDescription(data);
						break;

					case TRANSACTION_DATE:

						Date dateTranscation;
						try {
							dateTranscation = (Date) formatter.parse(data);
							LocalDateTime dateTime = LocalDateTime.ofInstant(dateTranscation.toInstant(), ZoneId.systemDefault());
							trnx.setTransactionDate(dateTime);
						} catch (ParseException e) {
							LOGGER.error(ERROR, e);
						}
						break;
					default:
						// Unknown transaction enum - no action needed
						break;
					}

				}
				trnx.setCreatedBy(transactionImportModel.getCreatedBy());
				trnx.setCreatedDate(LocalDateTime.now());
				trnx.setCreationMode(TransactionCreationMode.IMPORT);
				trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.NOT_EXPLAIN);
				transactions.add(trnx);

			}

			return transactions;
		}
		return null;
	}

	public List<com.simpleaccounts.entity.bankaccount.Transaction> getEntityWithoutTemplate(TransactionImportModel transactionImportModel) {

		if (transactionImportModel != null && transactionImportModel.getImportDataMap() != null
				&& !transactionImportModel.getImportDataMap().isEmpty()) {

			List<com.simpleaccounts.entity.bankaccount.Transaction> transactions = new ArrayList<>();

			BankAccount bankAcc = bankAccountService.findByPK(transactionImportModel.getBankId());

			com.simpleaccounts.entity.DateFormat dateFormat = dateFormatService.findByPK(transactionImportModel.getDateFormatId());
			DateFormat formatter = new SimpleDateFormat(dateFormat.getFormat());

			for (Map<String, Object> dataMap : transactionImportModel.getImportDataMap()) {
				com.simpleaccounts.entity.bankaccount.Transaction trnx = new com.simpleaccounts.entity.bankaccount.Transaction();
				trnx.setBankAccount(bankAcc);

				for (String dbColName : dataMap.keySet()) {

					TransactionEnum dbColEnum = TransactionEnum.getByDisplayName(dbColName);

					String data = (String) dataMap.get(dbColEnum.getDisplayName());
					switch (dbColEnum) {

						case CR_AMOUNT:
						case DR_AMOUNT:
//					case AMOUNT:

							MathContext mc = new MathContext(4); // 2 precision

////							if (dataMap.get(TransactionEnum.CREDIT_DEBIT_FLAG.getDisplayName()).equals("C")) {
////								currentBalance = currentBalance.add(trnx.getTransactionAmount());
////							} else {
////								currentBalance = currentBalance.subtract(trnx.getTransactionAmount());
////							}

							if (dbColEnum.equals(TransactionEnum.DR_AMOUNT)) {
								data = (String) dataMap.get(TransactionEnum.DR_AMOUNT.getDisplayName());
								if (!data.equals("-")) {
									BigDecimal debitAmt = BigDecimal.valueOf((Float.valueOf(data)));
									if (debitAmt.compareTo(BigDecimal.ZERO) > 0) {
										trnx.setTransactionAmount(debitAmt);
										trnx.setTransactionDueAmount(debitAmt);
										//	currentBalance = currentBalance.subtract(trnx.getTransactionAmount());
										trnx.setDebitCreditFlag('D');
									}
								}
							}
							if (dbColEnum.equals(TransactionEnum.CR_AMOUNT)) {
								data = (String) dataMap.get(TransactionEnum.CR_AMOUNT.getDisplayName());
								if (!data.equals("-")) {
									BigDecimal creditAmt = BigDecimal.valueOf(Float.valueOf(data));
									if (creditAmt.compareTo(BigDecimal.ZERO) > 0) {
										trnx.setTransactionAmount(creditAmt);
										trnx.setTransactionDueAmount(creditAmt);
										//	currentBalance = currentBalance.add(trnx.getTransactionAmount());
										trnx.setDebitCreditFlag('C');
									}
								}
							}

							//	trnx.setCurrentBalance(currentBalance);
							break;

						case DESCRIPTION:
							trnx.setTransactionDescription(data);
							break;

						case TRANSACTION_DATE:

							Date dateTranscation;
							try {
								dateTranscation = (Date) formatter.parse(data);
								LocalDateTime transactionDate = Instant.ofEpochMilli(dateTranscation.getTime())
										.atZone(ZoneId.systemDefault()).toLocalDateTime();
								trnx.setTransactionDate(transactionDate);
							} catch (ParseException e) {
								LOGGER.error(ERROR, e);
							}
							break;
						default:
							// Unknown transaction enum - no action needed
							break;
						}
				}
				trnx.setCreatedBy(transactionImportModel.getCreatedBy());
				trnx.setCreatedDate(LocalDateTime.now());
				trnx.setCreationMode(TransactionCreationMode.IMPORT);
				trnx.setTransactionExplinationStatusEnum(TransactionExplinationStatusEnum.NOT_EXPLAIN);
				transactions.add(trnx);

			}

			return transactions;
		}
		return null;
	}
}
