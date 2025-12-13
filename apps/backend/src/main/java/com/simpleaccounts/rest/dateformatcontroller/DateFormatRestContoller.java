package com.simpleaccounts.rest.dateformatcontroller;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.DateFormatService;
import io.swagger.annotations.ApiOperation;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@Controller
@RequestMapping("/rest/dateFormat")
@RequiredArgsConstructor
public class DateFormatRestContoller {

	private static final Logger logger = LoggerFactory.getLogger(DateFormatRestContoller.class);

	private final DateFormatService dateFormatService;

	private final DateFormatRestHelper dateFormatRestHelper;

	private final JwtTokenUtil jwtTokenUtil;

	@LogRequest
	@ApiOperation(value = "Get list of DateFormat")
	@GetMapping(value = "/getList")
	public ResponseEntity<List<DateFormatResponseModel>> getDateFormat() {
		Map<DateFormatFilterEnum, Object> filterDataMap = new EnumMap<>(DateFormatFilterEnum.class);
		filterDataMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
		List<DateFormat> dateFormatList = dateFormatService.getDateFormatList(filterDataMap);
		if (dateFormatList == null) {
			logger.error(ERROR,
					"NO DATA AVALIBALE FOR DATE FORMAT");
			return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity(dateFormatRestHelper.getModelList(dateFormatList), HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Save Datformat")
	@PostMapping(value = "/save")
	public ResponseEntity<String> save(DateFormatRequestModel requestModel, HttpServletRequest request) {
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		DateFormat dateFormat = dateFormatRestHelper.getEntity(requestModel);
		if (dateFormat != null) {
			dateFormat.setCreatedBy(userId);
			dateFormat.setCreatedDate(LocalDateTime.now());
			dateFormatService.update(dateFormat, dateFormat.getId());
		}
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete DateFormat By Id")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> delete(@RequestParam(value = "id") Integer id, HttpServletRequest request) {
		DateFormat dateFormat = dateFormatService.findByPK(id);
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

		if (dateFormat != null) {
			dateFormat.setDeleteFlag(Boolean.TRUE);
			dateFormat.setLastUpdatedBy(userId);
			dateFormatService.update(dateFormat, dateFormat.getId());
		}
		return new ResponseEntity<>("Deleted Successfully",HttpStatus.OK);

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Delete DateFormat in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> deletes(@RequestBody DeleteModel ids) {
		try {
			dateFormatService.deleteByIds(ids.getIds());
			return new ResponseEntity<>("Deleted Successfully",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@LogRequest
	@Transactional(rollbackFor = Exception.class)
	@ApiOperation(value = "Update DateFormat")
	@PostMapping(value = "/update")
	public ResponseEntity< DateFormatResponseModel> update(DateFormatRequestModel dateFormatRequestModel, HttpServletRequest request) {
		DateFormat dateFormat = dateFormatService.findByPK(dateFormatRequestModel.getId());
		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
		dateFormat = dateFormatRestHelper.getEntity(dateFormatRequestModel);
		dateFormat.setLastUpdatedBy(userId);
		dateFormat.setLastUpdateDate(LocalDateTime.now());
		dateFormat = dateFormatService.update(dateFormat);
		if (dateFormat == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(dateFormatRestHelper.getModel(dateFormat), HttpStatus.OK);
		}
	}

	@LogRequest
	@ApiOperation(value = "update DateFormat By Id")
	@GetMapping(value = "/getById")
	public ResponseEntity<DateFormatResponseModel> getById(@RequestParam(value = "id") Integer id) {

		DateFormat dateFormat = dateFormatService.findByPK(id);

		if (dateFormat == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			logger.error(ERROR + id);
		}
		return new ResponseEntity<>(dateFormatRestHelper.getModel(dateFormat), HttpStatus.OK);
	}
}
