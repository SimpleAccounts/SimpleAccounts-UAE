package com.simpleaccounts.rest.datalistcontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.*;
import com.simpleaccounts.constant.dbfilter.*;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.ProductCategoryListModel;
import com.simpleaccounts.model.UnitTypeListModel;
import com.simpleaccounts.repository.CompanyTypeRepository;
import com.simpleaccounts.repository.NotesSettingsRepository;
import com.simpleaccounts.repository.ProductCategoryRepository;
import com.simpleaccounts.repository.UnitTypesRepository;
import com.simpleaccounts.rest.*;
import com.simpleaccounts.rest.contactcontroller.TaxtTreatmentdto;
import com.simpleaccounts.rest.excisetaxcontroller.ExciseTaxModel;
import com.simpleaccounts.rest.excisetaxcontroller.ExciseTaxRestHelper;
import com.simpleaccounts.rest.productcontroller.ProductPriceModel;
import com.simpleaccounts.rest.productcontroller.ProductRestHelper;
import com.simpleaccounts.rest.vatcontroller.VatCategoryModel;
import com.simpleaccounts.rest.vatcontroller.VatCategoryRestHelper;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.utils.ChartOfAccountCacheService;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author Sonu
 */
	@RestController
	@RequestMapping(value = "/rest/datalist")
	@SuppressWarnings("java:S131")
	public class DataListController {

	private final Logger logger = LoggerFactory.getLogger(DataListController.class);

	@Autowired
	private CountryService countryService;

	@Autowired
	private CurrencyService currencyService;

	@Autowired
	private ChartOfAccountService transactionTypeService;

	@Autowired
	private IndustryTypeService industryTypeService;

	@Autowired
	private VatCategoryService vatCategoryService;

	@Autowired
	private VatCategoryRestHelper vatCategoryRestHelper;

	@Autowired
	private StateService stateService;

	@Autowired
	private ChartOfAccountCategoryService chartOfAccountCategoryService;

	@Autowired
	private ProductService productService;

	@Autowired
	private ProductRestHelper productRestHelper;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private CompanyTypeRepository companyTypeRepository;

	@Autowired
	private ExciseTaxRestHelper exciseTaxRestHelper;

	@Autowired
	private TaxTreatmentService taxTreatmentService;

	@Autowired
	private UnitTypesRepository unitTypesRepository;

	@Autowired
	private NotesSettingsRepository notesSettingsRepository;

	@Autowired
	private ProductCategoryRepository productCategoryRepository;

	@LogRequest
	@GetMapping(value = "/getcountry")
	public ResponseEntity<List<Country>> getCountry() {
		try {

			List<Country> countryList = countryService.getCountries();
			if (countryList != null && !countryList.isEmpty()) {
				return new ResponseEntity<>(countryList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/getCompanyType")
	public ResponseEntity<List<DropdownModel>> getCompanyType() {
		try {

			List<CompanyType> companyList = companyTypeRepository.findAll();
			List<DropdownModel> dropdownModelList=new ArrayList<>();
			for (CompanyType companyType:
				 companyList) {
				DropdownModel dropdownModel =new DropdownModel();
				dropdownModel.setLabel(companyType.getCompanyTypeName());
				dropdownModel.setValue(companyType.getId());
				dropdownModelList.add(dropdownModel);
			}
			if (dropdownModelList != null && ! dropdownModelList.isEmpty()) {
				return new ResponseEntity<>(dropdownModelList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * @Deprecated
	 * @author $@urabh Shifted from this to @see CurrencyController
	 */
	
	@LogRequest
	@GetMapping(value = "/getcurrenncy")
	public ResponseEntity<PaginationResponseModel> getCurrency(PaginationModel paginationModel) {
		try {
			Map<CurrencyFilterEnum, Object> filterDataMap = new EnumMap<>(CurrencyFilterEnum.class);
			filterDataMap.put(CurrencyFilterEnum.ORDER_BY, ORDERBYENUM.DESC);
			filterDataMap.put(CurrencyFilterEnum.DELETE_FLAG, false);

			PaginationResponseModel response = currencyService.getCurrencies(filterDataMap, paginationModel);
			if (response != null) {
				return new ResponseEntity<>(response, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "All Transaction Types")
	@GetMapping(value = "/getTransactionTypes")
	public ResponseEntity<List<ChartOfAccount>> getTransactionTypes() {
		try {
			List<ChartOfAccount> transactionTypes = transactionTypeService.findAll();
			if (transactionTypes != null && !transactionTypes.isEmpty()) {

				for (ChartOfAccount ac : transactionTypes) {
					ac.setTransactionChartOfAccountCategoryList(null);
				}
				return new ResponseEntity<>(transactionTypes, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "All Invoice Status Types")
	@GetMapping(value = "/getInvoiceStatusTypes")
	public ResponseEntity<List<DropdownModel>> getInvoiceStatusTypes() {
		try {
			List<CommonStatusEnum> statusEnums = CommonStatusEnum.getInvoiceStatusList();
			List<DropdownModel> dropdownModels = new ArrayList<>();
			if (statusEnums != null && !statusEnums.isEmpty()) {
				for (CommonStatusEnum statusEnum : statusEnums) {
					switch (statusEnum) {
						case PENDING:
						case PAID:
						case POST:
						case PARTIALLY_PAID:
						case OPEN:
						case CLOSED:
						case APPROVED:
						case POST_GRN:
							dropdownModels.add(new DropdownModel(statusEnum.getValue(), statusEnum.getDesc()));
							break;
						case SAVED:
						case REJECTED:
						case INVOICED:
						case UN_FILED:
						case FILED:
						case CLAIMED:
							// These statuses are not included in the dropdown list
							break;
						default:
							// Unknown status enum - no action needed
							break;
					}
				}
				return new ResponseEntity<>(dropdownModels, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@LogRequest
	@ApiOperation(value = "All Contact Types")
	@GetMapping(value = "/getContactTypes")
	public ResponseEntity<List<DropdownModel>> getContactTypes() {
		try {
			List<ContactTypeEnum> typeEnums = Arrays.asList(ContactTypeEnum.values());
			List<DropdownModel> dropdownModels = new ArrayList<>();
			if (typeEnums != null && !typeEnums.isEmpty()) {
				for (ContactTypeEnum typeEnum : typeEnums) {
					dropdownModels.add(new DropdownModel(typeEnum.getValue(), typeEnum.getDesc()));
				}
				return new ResponseEntity<>(dropdownModels, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "All Industry Types")
	@GetMapping(value = "/getIndustryTypes")
	public ResponseEntity<List<DropdownModel>> getIndustryTypes() {
		try {
			List<DropdownModel> dropdownModels = new ArrayList<>();
			List<IndustryType> industryTypes = industryTypeService.getIndustryTypes();
			if (industryTypes != null && !industryTypes.isEmpty()) {
				for (IndustryType type : industryTypes) {
					dropdownModels.add(new DropdownModel(type.getId(), type.getIndustryTypeName()));
				}
				return new ResponseEntity<>(dropdownModels, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/vatCategory")
	public ResponseEntity< List<VatCategoryModel> > getVatCAtegory() {
		try {
			Map<VatCategoryFilterEnum, Object> filterDataMap = new HashMap<>();
			filterDataMap.put(VatCategoryFilterEnum.ORDER_BY, ORDERBYENUM.DESC);
			filterDataMap.put(VatCategoryFilterEnum.DELETE_FLAG, false);

 			PaginationResponseModel respone = vatCategoryService.getVatCategoryList(filterDataMap, null);
			if (respone != null) {
				return new ResponseEntity<>(vatCategoryRestHelper.getList(respone.getData()), HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get getProductCategoryList")
	@GetMapping(value ="/getProductCategoryList")
	public ResponseEntity<Object> getProductCategoryList(HttpServletRequest request){
		try {
			List<ProductCategory> list = productCategoryRepository.getProductCategories(logger.getName());
			List<ProductCategoryListModel> productCategoryListModels=new ArrayList<>();
			for (ProductCategory productCategory:list ) {
				ProductCategoryListModel productCategoryList=new ProductCategoryListModel();
				productCategoryList.setLabel(productCategory.getProductCategoryName());
				productCategoryList.setValue(productCategory.getId());
				productCategoryListModels.add(productCategoryList);
			}
			return new ResponseEntity<>(productCategoryListModels,HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/exciseTax")
	public ResponseEntity< List<ExciseTaxModel> > getExciseTax() {
		try {
			List<ExciseTax> response = new ArrayList<ExciseTax>();

			response = exciseTaxRestHelper.getExciseTaxList();

			List<ExciseTaxModel> exciseTaxModelList = new ArrayList<ExciseTaxModel>();
			for(ExciseTax exciseTax : response)
			{
				ExciseTaxModel exciseTaxModel = new ExciseTaxModel();

				exciseTaxModel.setId(exciseTax.getId());
				exciseTaxModel.setName(exciseTax.getName());
				exciseTaxModel.setExcise(exciseTax.getExcisePercentage());

				exciseTaxModelList.add(exciseTaxModel);
			}

			if (exciseTaxModelList == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(exciseTaxModelList, HttpStatus.OK);

		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "get Pay mode (expense)")
	@GetMapping(value = "/payMode")
	public ResponseEntity<List<EnumDropdownModel>> getPayMode() {
		try {
			List<PayMode> payModes = Arrays.asList(PayMode.values());
			if (payModes != null && !payModes.isEmpty()) {
				List<EnumDropdownModel> modelList = new ArrayList<>();
				for (PayMode payMode : payModes)
					switch (payMode){
//						case BANK:
//							modelList.add(new EnumDropdownModel(payMode.toString(), payMode.toString()));
//							break;
						case CASH:
							modelList.add(new  EnumDropdownModel(payMode.toString(), payMode.toString()));
							break;
						case BANK:
							// BANK mode is commented out - not included in dropdown
							break;
						default:
							// Unknown pay mode - no action needed
							break;
					}


				return new ResponseEntity<>(modelList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "All subChartofAccount")
	@GetMapping(value = "/getsubChartofAccount")
	public ResponseEntity<Map<String, List<DropdownModel>>> getsubChartofAccount() {
		try {
			// Check if the chartOf Account result is already cached.
			Map<String, List<DropdownModel>> chartOfAccountMap = ChartOfAccountCacheService.getInstance()
					.getChartOfAccountCacheMap();

			if (chartOfAccountMap != null && !chartOfAccountMap.isEmpty()) {
				// If cached return the result
				return new ResponseEntity<>(chartOfAccountMap, HttpStatus.OK);
			} else if (chartOfAccountMap != null && chartOfAccountMap.isEmpty()) {
				// If result not cached read all the chart of accounts from the from db/
				List<ChartOfAccount> chartOfAccountList = transactionTypeService.findAll();
				// Process them to get the desired result.
				chartOfAccountMap = ChartOfAccountCacheService.getInstance()
						.loadChartOfAccountCacheMap(chartOfAccountList);
				// return the result.
				return new ResponseEntity<>(chartOfAccountMap, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@GetMapping(value = "/getstate")
	public ResponseEntity<List<DropdownModel>> getState(@RequestParam Integer countryCode) {
		try {

			Map<StateFilterEnum, Object> filterMap = new EnumMap<>(StateFilterEnum.class);
			filterMap.put(StateFilterEnum.COUNTRY, countryService.getCountry(countryCode));
			List<State> stateList = stateService.getstateList(filterMap);
			List<DropdownModel> modelList = new ArrayList<>();
			if (stateList != null && !stateList.isEmpty()) {
				for (State state : stateList)
					modelList.add(new DropdownModel(state.getId(), state.getStateName()));
				return new ResponseEntity<>(modelList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(modelList, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "reconsileCategories")
	@GetMapping(value = "/reconsileCategories")
	public ResponseEntity<List<SingleLevelDropDownModel>> getReconsilteCategories(@RequestParam("debitCreditFlag") String debitCreditFlag) {
		try {
			List<ChartOfAccountCategory> chartOfAccountCategoryList = chartOfAccountCategoryService.findAll();
			if (chartOfAccountCategoryList != null && !chartOfAccountCategoryList.isEmpty()) {

				List<DropdownModel> modelList = new ArrayList<>();

				ChartOfAccountCategory parentCategory = null;
				for (ChartOfAccountCategory chartOfAccountCategory : chartOfAccountCategoryList) {

					parentCategory = getChartOfAccountCategory(debitCreditFlag, modelList, parentCategory, chartOfAccountCategory);
				}
				if (debitCreditFlag.equals("D")) {
					Iterator<DropdownModel> iterator = modelList.iterator();
					while (iterator.hasNext()) {
						DropdownModel next = iterator.next();
						if (next.getValue()== 10) {
							iterator.remove();
						}
					}
					modelList.add(new DropdownModel(10, "Expense"));
					modelList.add(new DropdownModel(100, "Supplier Invoice"));
					modelList.add(new DropdownModel(16, "Vat Payment"));

				}
				if (debitCreditFlag.equals("C")) {
					modelList.add(new DropdownModel(17, "Vat Claim"));
				}

					assert parentCategory != null;
				return new ResponseEntity<>(Arrays.asList(
						new SingleLevelDropDownModel(parentCategory.getChartOfAccountCategoryName(), modelList)),
						HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	private ChartOfAccountCategory getChartOfAccountCategory(@RequestParam("debitCreditFlag") String debitCreditFlag, List<DropdownModel> modelList, ChartOfAccountCategory parentCategory, ChartOfAccountCategory chartOfAccountCategory) {
		if (debitCreditFlag.equals("C") && chartOfAccountCategory.getParentChartOfAccount() != null
				&& chartOfAccountCategory.getParentChartOfAccount().getChartOfAccountCategoryId()
						.equals(ChartOfAccountCategoryIdEnumConstant.MONEY_RECEIVED.getId())) {

			modelList.add(new DropdownModel(chartOfAccountCategory.getChartOfAccountCategoryId(),
					chartOfAccountCategory.getChartOfAccountCategoryName()));
		} else if (debitCreditFlag.equals("D") && chartOfAccountCategory.getParentChartOfAccount() != null
				&& chartOfAccountCategory.getParentChartOfAccount().getChartOfAccountCategoryId()
						.equals(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT.getId())) {
			modelList.add(new DropdownModel(chartOfAccountCategory.getChartOfAccountCategoryId(),
					chartOfAccountCategory.getChartOfAccountCategoryName()));
		} else if ((debitCreditFlag.equals("C") && chartOfAccountCategory.getChartOfAccountCategoryId()
				.equals(ChartOfAccountCategoryIdEnumConstant.MONEY_RECEIVED.getId()))
				|| debitCreditFlag.equals("D") && chartOfAccountCategory.getChartOfAccountCategoryId()
						.equals(ChartOfAccountCategoryIdEnumConstant.MONEY_SPENT.getId())) {
			parentCategory = chartOfAccountCategory;
		}
		return parentCategory;
	}

	@LogRequest
	@ApiOperation(value = "get Product List")
	@GetMapping(value = "/product")
	public ResponseEntity<List<ProductPriceModel>> getProductList(@RequestParam ProductPriceType priceType) {
		try {
			Map<ProductFilterEnum, Object> filterDataMap = new HashMap<>();
			if (priceType != null) {
				filterDataMap.put(ProductFilterEnum.PRODUCT_PRICE_TYPE,
						Arrays.asList(priceType, ProductPriceType.BOTH));
				filterDataMap.put(ProductFilterEnum.DELETE_FLAG, false);
				PaginationResponseModel responseModel = productService.getProductList(filterDataMap, null);
				if (responseModel != null && responseModel.getData() != null) {
					List<ProductPriceModel> modelList = new ArrayList<>();
					for (Product product : (List<Product>) responseModel.getData())
						if(product.getIsActive()!=null &&  product.getIsActive() != false){
							modelList.add(productRestHelper.getPriceModel(product, priceType));
						}
					Collections.reverse(modelList);
					return new ResponseEntity<>(modelList, HttpStatus.OK);
				} else {
					return new ResponseEntity<>(HttpStatus.NOT_FOUND);
				}
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Transaction Category for receipt")
	@GetMapping(value = "/receipt/tnxCat")
	public ResponseEntity<List<SingleLevelDropDownModel>> getTransactionCategoryListForReceipt() {
		try {

			List<TransactionCategory> categoryList = transactionCategoryService.getListForReceipt();
			if (categoryList != null && !categoryList.isEmpty()) {
				// categories in coa
				Map<Integer, List<TransactionCategory>> map = new HashMap<>();
				for (TransactionCategory trncCat : categoryList) {
					if (map.containsKey(trncCat.getChartOfAccount().getChartOfAccountId())) {
						map.get(trncCat.getChartOfAccount().getChartOfAccountId()).add(trncCat);
					} else {
						List<TransactionCategory> dummyList = new ArrayList<>();
						dummyList.add(trncCat);
						map.put(trncCat.getChartOfAccount().getChartOfAccountId(), dummyList);
					}
				}

				List<SingleLevelDropDownModel> singleLevelDropDownModelList = new ArrayList<>();

				for (Integer id : map.keySet()) {
					categoryList = map.get(id);
					ChartOfAccount parentCategory = categoryList.get(0).getChartOfAccount();
					List<DropdownModel> modelList = new ArrayList<>();
					for (TransactionCategory trncCat : categoryList) {

						modelList.add(new DropdownModel(trncCat.getTransactionCategoryId(),
								trncCat.getTransactionCategoryName()));
					}
					singleLevelDropDownModelList
							.add(new SingleLevelDropDownModel(parentCategory.getChartOfAccountName(), modelList));
				}

				return new ResponseEntity<>(singleLevelDropDownModelList, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@LogRequest
	@ApiOperation(value = "Get Tax Treatment Category")
	@GetMapping(value ="/getTaxTreatment")
	public ResponseEntity<Object> getTaxTreatmentList(HttpServletRequest request){
		try {
			List<TaxtTreatmentdto> list = taxTreatmentService.getList();
			return new ResponseEntity<>(list,HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}


	@LogRequest
	@ApiOperation(value = "Get getUnitTypeList")
	@GetMapping(value ="/getUnitTypeList")
	public ResponseEntity<Object> getUnitTypeList(HttpServletRequest request){
		try {
			List<UnitType> list = unitTypesRepository.findAll();
			List<UnitTypeListModel> unitTypeListModels=new ArrayList<>();
			for (UnitType unitType:list ) {
				UnitTypeListModel unitTypeModel=new UnitTypeListModel();
				unitTypeModel.setUnitTypeId(unitType.getUnitTypeId());
				unitTypeModel.setUnitTypeCode(unitType.getUnitTypeCode());
				unitTypeModel.setUnitType(unitType.getUnitType() + " ( "+unitType.getUnitTypeCode()+" ) ");
				unitTypeModel.setUnitTypeStatus(unitType.getUnitTypeStatus());
				unitTypeListModels.add(unitTypeModel);
			}
			return new ResponseEntity<>(unitTypeListModels,HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/**
	 * Added for Get Default Info of Notes
 	 * @param request
	 * @return
	 */
	@LogRequest
	@ApiOperation(value = "Get getUnitTypeList")
	@GetMapping(value ="/getNoteSettingsInfo")
	public ResponseEntity<Object> getNoteSettingsInfo(HttpServletRequest request){
		try {
			NotesSettings notesSettings = notesSettingsRepository.findAll().get(0);
			return new ResponseEntity<>(notesSettings,HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR, e);
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("notes.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Added for save Default Info  of Notes
	 * @param defaultNote
	 * @param defaultFootNote
	 * @param request
	 * @return
	 */
	@LogRequest
	@ApiOperation(value = "Save Default Notes Info")
	@PostMapping(value ="/saveNoteSettingsInfo")
	public ResponseEntity<Object> saveNoteSettingsInfo(@RequestParam(value = "defaultNote") String defaultNote,
												  @RequestParam(value = "defaultFootNote") String defaultFootNote,
												  @RequestParam(value = "defaultTermsAndConditions") String defaultTermsAndConditions,
												  HttpServletRequest request)
	{
		try {
			Integer defaultNoteId=1;
			NotesSettings notesSettings = notesSettingsRepository.findById(defaultNoteId).get();
			notesSettings.setDefaultNotes(defaultNote);
			notesSettings.setDefaultFootNotes(defaultFootNote);
			notesSettings.setDefaultTermsAndConditions(defaultTermsAndConditions);
			notesSettingsRepository.save(notesSettings);
			return new ResponseEntity<>(notesSettings,HttpStatus.OK);
		}catch (Exception e){
			logger.error(ERROR, e);
			SimpleAccountsMessage message = null;
			message = new SimpleAccountsMessage("",
					MessageUtil.getMessage("save.unsuccessful.msg"), true);
			return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
