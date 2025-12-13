package com.simpleaccounts.rest.reports;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.entity.ReportsConfiguration;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.UserService;
import io.swagger.annotations.ApiOperation;
import java.time.LocalDateTime;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/reportsconfiguration")
@RequiredArgsConstructor
public class ReportsConfigurationRestController {
    private final Logger log = LoggerFactory.getLogger(ReportsConfigurationRestController.class);

    private final  ReportsColumnConfigurationRepository reportsColumnConfigurationRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;

    @LogRequest
    @ApiOperation(value = "Get Report columns By ID")
    @GetMapping(value = "/getById")
	    public ResponseEntity<Object> getReportConfigurationById(@RequestParam("id") Integer id) {
	        JsonNode rootNode = null;
	        try {
	            ReportsConfiguration reportsConfiguration = reportsColumnConfigurationRepository.findById(id).orElse(null);
	            if (reportsConfiguration != null) {
	                ObjectMapper mapper = new ObjectMapper();
	                rootNode = mapper.readTree(reportsConfiguration.getColumnNames());
	            }
        } catch (Exception e) {

        }
        return new ResponseEntity<>(rootNode ,HttpStatus.OK);
    }

    @LogRequest
    @ApiOperation(value = "Update Report Columns Configuration")
    @PostMapping(value = "/update")
    public ResponseEntity<Object> update(@RequestBody ReportsConfigurationModel model, HttpServletRequest request) {
	        try {
	            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
	            User user = userService.findByPK(userId);
	            ReportsConfiguration reportsConfiguration = new ReportsConfiguration();
	            if(model.getId()!=null){
	                reportsConfiguration = reportsColumnConfigurationRepository.findById(model.getId()).orElse(new ReportsConfiguration());
	            }
            if(model.getReportName()!=null && !model.getReportName().isEmpty()){
                reportsConfiguration.setReportName(model.getReportName());
            }
            if(model.getColumnNames()!=null && !model.getColumnNames().isEmpty()){
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonString = objectMapper.writeValueAsString(model.getColumnNames());
                if(jsonString!=null){
                    reportsConfiguration.setColumnNames(jsonString = model.getColumnNames().replace("\\", ""));
                }
            }
            reportsConfiguration.setLastUpdatedBy(userId);
            reportsConfiguration.setLastUpdateDate(LocalDateTime.now());
            reportsColumnConfigurationRepository.save(reportsConfiguration);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
