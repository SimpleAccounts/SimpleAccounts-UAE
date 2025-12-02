package com.simplevat.rest.reports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplevat.aop.LogRequest;
import com.simplevat.entity.ReportsConfiguration;
import com.simplevat.entity.User;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.UserService;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;


import static com.simplevat.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/reportsconfiguration")
public class ReportsConfigurationRestController {
    private final Logger log = LoggerFactory.getLogger(ReportsConfigurationRestController.class);

    @Autowired
    private  ReportsColumnConfigurationRepository reportsColumnConfigurationRepository;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private UserService userService;

    @LogRequest
    @ApiOperation(value = "Get Report columns By ID")
    @GetMapping(value = "/getById")
    public ResponseEntity<?> getReportConfigurationById(@RequestParam("id") Integer id) {
        JsonNode rootNode = null;
        try {
            ReportsConfiguration reportsConfiguration = reportsColumnConfigurationRepository.findById(id).get();
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
    public ResponseEntity<?> update(@RequestBody ReportsConfigurationModel model, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            ReportsConfiguration reportsConfiguration = new ReportsConfiguration();
            if(model.getId()!=null){
                reportsConfiguration = reportsColumnConfigurationRepository.findById(model.getId()).get();
            }
            if(model.getReportName()!=null && !model.getReportName().isEmpty()){
                reportsConfiguration.setReportName(model.getReportName());
            }
            if(model.getColumnNames()!=null && !model.getColumnNames().isEmpty()){
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonString = objectMapper.writeValueAsString(model.getColumnNames());
                if(jsonString!=null){
                    reportsConfiguration.setColumnNames(jsonString = model.getColumnNames().replaceAll("\\\\", ""));
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