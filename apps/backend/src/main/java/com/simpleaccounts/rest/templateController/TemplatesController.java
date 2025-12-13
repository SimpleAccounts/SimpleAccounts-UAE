package com.simpleaccounts.rest.templateController;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.rest.vatcontroller.VatController;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.MailThemeTemplatesService;
import io.swagger.annotations.ApiOperation;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;

/**
 *
 * @author
 * @author Suraj Rahade 22/7/2021
 */
@RestController
@RequestMapping(value = "/rest/templates")
@RequiredArgsConstructor
public class TemplatesController {
    
    private final Logger logger = LoggerFactory.getLogger(VatController.class);

    private final JwtTokenUtil jwtTokenUtil;

    private final EntityManager entityManager;

    private final MailThemeTemplatesService mailThemeTemplatesService;
    
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Mail Template Theme")
    @PostMapping(value = "/updateMailTemplateTheme")
    public ResponseEntity<String> update(@RequestParam(value = "templateId") Integer templateId, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            mailThemeTemplatesService.updateMailTheme(templateId);

//

            return new ResponseEntity<>("Email template Theme Updated Successful", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "All Templates for For Dropdown")
    @GetMapping(value = "/getTemplateDropdown")
    public ResponseEntity<List<DropdownModelForTemplates>> getTemplateDropdown() {
        try {
            List<DropdownModelForTemplates> dropdownModels = new ArrayList<>();
            Query query = entityManager.createQuery("SELECT m.templateId as templateId,m.templateEnable as templateEnable FROM MailThemeTemplates m GROUP BY m.templateId");
            List<Object> list = query.getResultList();
            for(Object object : list){
                Object[] objectArray = (Object[]) object;
                dropdownModels.add(new DropdownModelForTemplates((Integer) objectArray[0],(Boolean) objectArray[1]));
            }

                return new ResponseEntity<>(dropdownModels, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
