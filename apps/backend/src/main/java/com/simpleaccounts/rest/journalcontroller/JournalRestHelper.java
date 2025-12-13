package com.simpleaccounts.rest.journalcontroller;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.CustomizeInvoiceTemplate;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
	@SuppressWarnings({"java:S3973", "java:S115"})
	@RequiredArgsConstructor
public class JournalRestHelper {
	private final Logger logger = LoggerFactory.getLogger(JournalRestHelper.class);
	private static final boolean IS_LIST = true;
	private final CurrencyService currencyService;

	private final JournalService journalService;

	private final ContactService contactService;

	private final UserService userService;

	private final VatCategoryService vatCategoryService;

	private final TransactionCategoryService transactionCategoryService;

	private final JournalLineItemService journalLineItemService;

	private final InvoiceNumberUtil invoiceNumberUtil;

	private final CustomizeInvoiceTemplateService customizeInvoiceTemplateService;

	private final DateFormatHelper dateFormatHelper;

	public Journal getEntity(JournalRequestModel journalRequestModel, Integer userId) {
		Journal journal = new Journal();
		if (journalRequestModel.getJournalId() != null) {
			Journal journal1 = journalService.getJournalByReferenceId(journalRequestModel.getJournalId());
			if (journal1.getPostingReferenceType()!=null) {
				journal.setPostingReferenceType(journal1.getPostingReferenceType());
			}
			if (journal1.getJournlReferencenNo()!=null) {
				journal.setJournlReferencenNo(journal1.getJournlReferencenNo());
			}
			List<Integer> list = new ArrayList<>();
			list.add(journal1.getId());
			journalService.deleteByIds(list);
		}
		if (journalRequestModel.getCurrencyCode() != null) {
			journal.setCurrency(currencyService.getCurrency(journalRequestModel.getCurrencyCode()));
		}
		journal.setJournlReferencenNo(journalRequestModel.getJournalReferenceNo());
		CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(11);
		if (journalRequestModel.getJournalReferenceNo()!=null && !journalRequestModel.getJournalReferenceNo().isEmpty()) {
			String suffix = invoiceNumberUtil.fetchSuffixFromString(journalRequestModel.getJournalReferenceNo());
			template.setSuffix(Integer.parseInt(suffix));
			String prefix = journal.getJournlReferencenNo().substring(0, journal.getJournlReferencenNo().lastIndexOf(suffix));
			template.setPrefix(prefix);
			customizeInvoiceTemplateService.persist(template);
		}
		getJournalDate(journalRequestModel, journal);
		journal.setDescription(journalRequestModel.getDescription());
		if (journalRequestModel.getSubTotalCreditAmount() != null) {
			journal.setSubTotalCreditAmount(journalRequestModel.getSubTotalCreditAmount());
		}
		if (journalRequestModel.getSubTotalDebitAmount() != null) {
			journal.setSubTotalDebitAmount(journalRequestModel.getSubTotalDebitAmount());
		}
		if (journalRequestModel.getTotalCreditAmount() != null) {
			journal.setTotalCreditAmount(journalRequestModel.getTotalCreditAmount());
		}
		if (journalRequestModel.getTotalDebitAmount() != null) {
			journal.setTotalDebitAmount(journalRequestModel.getTotalDebitAmount());
		}

		if (journalRequestModel.getJournalLineItems() != null && !journalRequestModel.getJournalLineItems().isEmpty()) {
			List<JournalLineItemRequestModel> itemModels = journalRequestModel.getJournalLineItems();
			if (!itemModels.isEmpty()) {
				List<JournalLineItem> lineItems = getLineItems(itemModels, journal, userId);
				journal.setJournalLineItems(!lineItems.isEmpty() ? lineItems : null);
			}
		}
		return journal;
	}

	private void getJournalDate(JournalRequestModel journalRequestModel, Journal journal) {
		if (journalRequestModel.getJournalDate() != null) {
			LocalDate journalDate = dateFormatHelper.convertToLocalDateViaSqlDate(journalRequestModel.getJournalDate());
			journal.setJournalDate(journalDate);
			journal.setTransactionDate(journalDate);
		}
	}

	public List<JournalLineItem> getLineItems(List<JournalLineItemRequestModel> itemModels, Journal journal,
			Integer userId) {
		List<JournalLineItem> lineItems = new ArrayList<>();
		for (JournalLineItemRequestModel model : itemModels) {
			try {
				JournalLineItem lineItem = new JournalLineItem();
				lineItem = getJournalLineItem(userId, model, lineItem);
				lineItem.setDescription(model.getDescription());
				if (model.getContactId() != null) {
					lineItem.setContact(contactService.findByPK(model.getContactId()));
				}
				if (model.getVatCategoryId() != null) {
					lineItem.setVatCategory(vatCategoryService.findByPK(model.getVatCategoryId()));
				}
				if (model.getCreditAmount() != null) {
					lineItem.setCreditAmount(model.getCreditAmount());
				}
				lineItem.setDebitAmount(model.getDebitAmount());

				if (model.getTransactionCategoryId() != null) {
					lineItem.setTransactionCategory(
							transactionCategoryService.findByPK(model.getTransactionCategoryId()));
				}
				lineItem.setJournal(journal);
				lineItem.setReferenceId(journal.getId());
				lineItem.setReferenceType(lineItem.getReferenceType() != null ? lineItem.getReferenceType()
						: PostingReferenceTypeEnum.MANUAL);
				lineItem.setCurrentBalance(model.getCreditAmount()!=null?model.getCreditAmount():model.getDebitAmount());
				lineItems.add(lineItem);
			} catch (Exception e) {
				logger.error("Error", e);
				return new ArrayList<>();
			}
		}
		return lineItems;
	}

	private JournalLineItem getJournalLineItem(Integer userId, JournalLineItemRequestModel model, JournalLineItem lineItem) {
		if (model.getId() != null) {
			lineItem = journalLineItemService.findByPK(model.getId());
			lineItem.setLastUpdateBy(userId);
			lineItem.setLastUpdateDate(LocalDateTime.now());
		} else {
			lineItem.setCreatedBy(userId);
			lineItem.setCreatedDate(LocalDateTime.now());
			lineItem.setDeleteFlag(false);
		}
		return lineItem;
	}

	public PaginationResponseModel getListModel(PaginationResponseModel responseModel) {

		if (responseModel != null) {

			List<JournalModel> journalModelList = new ArrayList<>();
			if (responseModel.getData() != null) {
				for (Journal journal : (List<Journal>) responseModel.getData()) {
					journalModelList.add(getModel(journal, IS_LIST));
				}
				responseModel.setData(journalModelList);
				return responseModel;
			}
		}
		return null;
	}

	public JournalModel getModel(Journal journal, boolean list) {

		boolean isManual = journal.getPostingReferenceType().equals(PostingReferenceTypeEnum.MANUAL);

		JournalModel model = new JournalModel();
		model.setJournalId(journal.getId());
		model.setDescription(journal.getDescription());

		if (journal.getJournlReferencenNo()!=null){
			model.setJournalReferenceNo(journal.getJournlReferencenNo());
		}
		else {
			model.setJournalReferenceNo(isManual ? journal.getJournlReferencenNo() : " ");
		}
		BigDecimal totalCreditAmount = getTotalCreditAmount(journal.getJournalLineItems());
		BigDecimal totalDebitAmount = getTotalDebitAmount(journal.getJournalLineItems());

		model.setSubTotalCreditAmount(isManual ? journal.getSubTotalCreditAmount() : totalCreditAmount);
		model.setSubTotalDebitAmount(isManual ? journal.getSubTotalDebitAmount() : totalDebitAmount);
		model.setTotalCreditAmount(isManual ? journal.getTotalCreditAmount() : totalCreditAmount);
		model.setTotalDebitAmount(isManual ? journal.getTotalDebitAmount() : totalDebitAmount);
		if (journal.getJournalDate() != null) {
			ZoneId timeZone = ZoneId.systemDefault();
			Date date = Date.from(journal.getJournalDate().atStartOfDay(timeZone).toInstant());
			model.setJournalDate(date);

		}
		if (journal.getCurrency() != null) {
			model.setCurrencyCode(journal.getCurrency().getCurrencyCode());
		}
		if (journal.getCreatedBy() != null) {
			User user = userService.findByPK(journal.getCreatedBy());
			if (user != null) {
				model.setCreatedByName(user.getFirstName() + " " + user.getLastName());
			}
		}
		model.setPostingReferenceType(journal.getPostingReferenceType());
		model.setPostingReferenceTypeDisplayName(journal.getPostingReferenceType().getDisplayName());
		List<JournalLineItemRequestModel> requestModels = new ArrayList<>();
		if (journal.getJournalLineItems() != null && !journal.getJournalLineItems().isEmpty()) {
			for (JournalLineItem lineItem : journal.getJournalLineItems()) {
				if (lineItem.getTransactionCategory()!=null && lineItem.getTransactionCategory().getChartOfAccount().getChartOfAccountName()!=null) {
					model.setJournalTransactionCategoryLabel(lineItem.getTransactionCategory().getChartOfAccount().getChartOfAccountName());
				}
				JournalLineItemRequestModel requestModel = getLineItemModel(lineItem, list);
				requestModels.add(requestModel);

			}
			model.setJournalLineItems(requestModels);
		}
		return model;
	}

	public JournalLineItemRequestModel getLineItemModel(JournalLineItem lineItem, boolean list) {
		JournalLineItemRequestModel requestModel = new JournalLineItemRequestModel();
		requestModel.setId(lineItem.getId());
		if (lineItem.getContact() != null) {
			requestModel.setContactId(lineItem.getContact().getContactId());
		}
		if (lineItem.getTransactionCategory() != null) {
			requestModel.setTransactionCategoryId(lineItem.getTransactionCategory().getTransactionCategoryId());
			requestModel.setTransactionCategoryName(lineItem.getTransactionCategory().getTransactionCategoryName());
			requestModel.setJournalTransactionCategoryLabel(lineItem.getTransactionCategory().getChartOfAccount().getChartOfAccountName());
		}
		BigDecimal creditVatAmt = BigDecimal.valueOf(0);
		BigDecimal debitVatAmt = BigDecimal.valueOf(0);

		if (lineItem.getVatCategory() != null) {
			requestModel.setVatCategoryId(lineItem.getVatCategory().getId());
			if (list && !lineItem.getVatCategory().getVat().equals(BigDecimal.valueOf(0))) {
				creditVatAmt = lineItem.getVatCategory().getVat().divide(BigDecimal.valueOf(100))
						.multiply(lineItem.getCreditAmount());
				debitVatAmt = lineItem.getVatCategory().getVat().divide(BigDecimal.valueOf(100))
						.multiply(lineItem.getDebitAmount());
			}
		}
		requestModel.setDescription(lineItem.getDescription());

		requestModel.setCreditAmount(lineItem.getCreditAmount() != null ? lineItem.getCreditAmount().add(creditVatAmt)
				: BigDecimal.valueOf(0));
		requestModel.setDebitAmount(
				lineItem.getDebitAmount() != null ? lineItem.getDebitAmount().add(debitVatAmt) : BigDecimal.valueOf(0));
		requestModel.setPostingReferenceType(lineItem.getReferenceType());
		return requestModel;
	}

	public Collection<JournalLineItem> setReferenceId(Collection<JournalLineItem> journalLineItemList, Integer id) {
		for (JournalLineItem journalLineItem : journalLineItemList) {
			journalLineItem.setReferenceId(id);
		}
		return journalLineItemList;
	}

	public BigDecimal getTotalDebitAmount(Collection<JournalLineItem> lineItem) {

		BigDecimal totalDebitAmount = BigDecimal.valueOf(0);
		if (lineItem != null && !lineItem.isEmpty()) {
			for (JournalLineItem item : lineItem) {
				if (item.getDebitAmount() != null) {
					totalDebitAmount = totalDebitAmount.add(item.getDebitAmount());
				}
			}
			return totalDebitAmount;
		}

		return totalDebitAmount;
	}

	public BigDecimal getTotalCreditAmount(Collection<JournalLineItem> lineItem) {

		BigDecimal totalCreditAmount = BigDecimal.valueOf(0);
		if (lineItem != null && !lineItem.isEmpty()) {
			for (JournalLineItem item : lineItem) {
				if (item.getCreditAmount() != null) {
					totalCreditAmount = totalCreditAmount.add(item.getCreditAmount());
				}
			}
			return totalCreditAmount;
		}

		return BigDecimal.valueOf(0);
	}

	public PaginationResponseModel getCsvListModel(PaginationResponseModel responseModel) {

		if (responseModel != null) {

			List<JournalCsvModel> journalModelList = new ArrayList<>();
			if (responseModel.getData() != null) {

				List<JournalLineItem> lineItemList = new ArrayList<>();
				Map<Integer, Journal> journalMap = new HashMap<>();
				for (Journal journal : (List<Journal>) responseModel.getData()) {
					for (JournalLineItem item : journal.getJournalLineItems()) {
						lineItemList.add(item);
						journalMap.put(item.getId(), journal);
					}
				}

				journalCsvLineList(responseModel, journalModelList, lineItemList, journalMap);
				responseModel.setData(journalModelList);
			}

		}
		return responseModel;
	}

	private void journalCsvLineList(PaginationResponseModel responseModel, List<JournalCsvModel> journalModelList, List<JournalLineItem> lineItemList, Map<Integer, Journal> journalMap) {
		for (JournalLineItem lineItem : lineItemList) {
			JournalCsvModel model = new JournalCsvModel();
			Journal journal = journalMap.get(lineItem.getId());

			boolean isManual = journal.getPostingReferenceType().equals(PostingReferenceTypeEnum.MANUAL);

			model.setJournalReferenceNo(isManual ? journal.getJournlReferencenNo() : " ");

			if (journal.getJournalDate() != null) {
				ZoneId timeZone = ZoneId.systemDefault();
				Date date = Date.from(journal.getJournalDate().atStartOfDay(timeZone).toInstant());
				model.setJournalDate(date);
			}
			model.setPostingReferenceTypeDisplayName(journal.getPostingReferenceType().getDisplayName());

			getTransactionCategory(lineItem, model);
			BigDecimal creditVatAmt = BigDecimal.ZERO;
			BigDecimal debitVatAmt = BigDecimal.ZERO;

			if (lineItem.getVatCategory() != null) {
				if (!lineItem.getVatCategory().getVat().equals(BigDecimal.valueOf(0))) {
					creditVatAmt = lineItem.getVatCategory().getVat().divide(BigDecimal.valueOf(100))
							.multiply(lineItem.getCreditAmount());
					debitVatAmt = lineItem.getVatCategory().getVat().divide(BigDecimal.valueOf(100))
							.multiply(lineItem.getDebitAmount());
				}
			}
			model.setDescription(lineItem.getDescription());

			model.setCreditAmount(
					lineItem.getCreditAmount() != null ? lineItem.getCreditAmount().add(creditVatAmt)
							: BigDecimal.valueOf(0));
			model.setDebitAmount(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount().add(debitVatAmt)
					: BigDecimal.valueOf(0));
			responseModel.setData(journalModelList);
			journalModelList.add(model);
		}
	}

	private void getTransactionCategory(JournalLineItem lineItem, JournalCsvModel model) {
		if (lineItem.getTransactionCategory() != null) {
			model.setTransactionCategoryName(
					lineItem.getTransactionCategory().getTransactionCategoryName());
		}
	}

	public List<JournalModel> getEntriesListModel(List<Journal> journalList) {
		List<JournalModel> journalModelList = new ArrayList<>();
		for (Journal journal : journalList) {
			journalModelList.add(getModel(journal, IS_LIST));
		}
		return journalModelList;
	}
}
