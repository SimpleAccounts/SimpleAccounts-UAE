package com.simpleaccounts.rest.transactionparsingcontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.ExcellDelimiterEnum;
import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.entity.TransactionDataColMapping;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.parserengine.CsvParser;
import com.simpleaccounts.parserengine.ExcelParser;
import com.simpleaccounts.rest.EnumDropdownModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.TransactionParsingSettingService;
import com.simpleaccounts.utils.FileHelper;
import io.swagger.annotations.ApiOperation;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.criteria.enums.TransactionEnum;
import com.simpleaccounts.entity.TransactionDataColMapping;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.ExcellDelimiterEnum;
import com.simpleaccounts.parserengine.CsvParser;
import com.simpleaccounts.parserengine.ExcelParser;
import com.simpleaccounts.rest.EnumDropdownModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.TransactionParsingSettingService;
import com.simpleaccounts.utils.FileHelper;

import io.swagger.annotations.ApiOperation;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping(value = "/rest/transactionParsing")
@RequiredArgsConstructor
public class TransactionParsingSettingController {

	private final Logger logger = LoggerFactory.getLogger(TransactionParsingSettingController.class);

	private final JwtTokenUtil jwtTokenUtil;

	private final TransactionParsingSettingRestHelper transactionParsingRestHelper;

	private final TransactionParsingSettingService transactionParsingSettingService;

	private final CsvParser csvParser;

	private final ExcelParser excelParser;

	private final FileHelper fileHelper;

	@LogRequest
	@ApiOperation("Parse excel file for Data")
	@PostMapping(value = "/parse")
	public ResponseEntity<List<Map<String, String>>> getDateFormat(@ModelAttribute TransactionParsingSettingPersistModel model) {

		List<Map<String, String>> dataMap = null;
		switch (fileHelper.getFileExtension(model.getFile().getOriginalFilename())) {
		case "csv":
			dataMap = csvParser.parseSmaple(model);
			break;

			case "xlsx":
			case "xlx":
				case "xls":
				dataMap = excelParser.parseSmaple(model);
				break;
			default:
				// Unsupported file extension.
				break;

			}
			if (dataMap == null) {
				return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity<>(dataMap, HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation("Get databse column enum list")
	@GetMapping(value = "/dbColEnum/list")
	public ResponseEntity<List<EnumDropdownModel>> getDateFormatList() {
		return new ResponseEntity<>(TransactionEnum.getDropdownList(), HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation("Get delimiter enum list")
	@GetMapping(value = "/delimiter/list")
	public ResponseEntity<List<EnumDropdownModel>> getDelimiterList() {
		return new ResponseEntity<>(ExcellDelimiterEnum.getDropdownList(), HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation("Save  new Transaction Parsing setting")
	@PostMapping(value = "/save")
	public ResponseEntity<Map<String, Object>> save(@RequestBody TransactionParsingSettingPersistModel persistModel,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

			TransactionParsingSetting transactionParsigSetting = transactionParsingRestHelper.getEntity(persistModel);
			transactionParsigSetting.setCreatedBy(userId);
			transactionParsigSetting.setCreatedDate(LocalDateTime.now());
			transactionParsigSetting.setDeleteFlag(false);
			for (TransactionDataColMapping mapping : transactionParsigSetting.getTransactionDataColMapping()) {
				mapping.setCreatedBy(userId);
				mapping.setCreatedDate(LocalDateTime.now());
			}
			transactionParsingSettingService.persist(transactionParsigSetting);
			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("id", transactionParsigSetting.getId());
			return new ResponseEntity<>(responseMap, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation("Update  Transaction Parsing setting")
	@PostMapping(value = "/update")
	public ResponseEntity<String> update(@RequestBody TransactionParsingSettingPersistModel persistModel,
			HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

			TransactionParsingSetting transactionParsigSetting = transactionParsingRestHelper.getEntity(persistModel);
			transactionParsigSetting.setLastUpdatedBy(userId);
			transactionParsigSetting.setLastUpdateDate(LocalDateTime.now());
			for (TransactionDataColMapping mapping : transactionParsigSetting.getTransactionDataColMapping()) {
				mapping.setLastUpdatedBy(userId);
				mapping.setLastUpdateDate(LocalDateTime.now());
			}
			transactionParsingSettingService.persist(transactionParsigSetting);
			return new ResponseEntity<>("Updated successful",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@LogRequest
	@ApiOperation("Getlist")
	@GetMapping(value = "/list")
	public ResponseEntity<List<TransactionParsingSettingListModel>> getTransactionParserSettigList(HttpServletRequest request) {
		try {
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap = new HashMap();
			filterDataMap.put(TransactionParsingSettingFilterEnum.DELETE_FLAG, false);
			List<TransactionParsingSetting> transactionParsingSettingList = transactionParsingSettingService
					.geTransactionParsingList(filterDataMap);
			if (transactionParsingSettingList == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(transactionParsingRestHelper.getModelList(transactionParsingSettingList),
					HttpStatus.OK);

		} catch (Exception e) {
			logger.error("Error", e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> delete(@RequestParam(value = "id") Long id) {
		TransactionParsingSetting transactionParsingSetting = transactionParsingSettingService.findByPK(id);
		if (transactionParsingSetting != null) {
			transactionParsingSetting.setDeleteFlag(Boolean.TRUE);
			transactionParsingSettingService.update(transactionParsingSetting, transactionParsingSetting.getId());
		}
		return new ResponseEntity<>("Deleted successful",HttpStatus.OK);
	}

	@LogRequest
	@ApiOperation("Get by Id")
	@GetMapping(value = "/getById")
	public ResponseEntity<TransactionParsingSettingDetailModel> getDateFormatList(@RequestParam(value = "id") Long id) {
		try {
			TransactionParsingSetting setting = transactionParsingSettingService.findByPK(id);
			TransactionParsingSettingDetailModel model = transactionParsingRestHelper.getModel(setting);
			if (model == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(model, HttpStatus.OK);

		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@LogRequest
	@ApiOperation("Getlist")
	@GetMapping(value = "/selectModelList")
	public ResponseEntity<List<EnumDropdownModel>> getTransactionParserSettigSelectModelList(HttpServletRequest request) {
		try {
			Map<TransactionParsingSettingFilterEnum, Object> filterDataMap = new HashMap();
			filterDataMap.put(TransactionParsingSettingFilterEnum.DELETE_FLAG, false);
			List<TransactionParsingSetting> transactionParsingSettingList = transactionParsingSettingService
					.geTransactionParsingList(filterDataMap);
			if (transactionParsingSettingList == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(transactionParsingRestHelper.getSelectModelList(transactionParsingSettingList),
					HttpStatus.OK);

		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
