package com.simplevat.rest.templateController;

import com.simplevat.aop.LogRequest;
import com.simplevat.rest.vatcontroller.VatController;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.MailThemeTemplatesService;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

import static com.simplevat.constant.ErrorConstant.ERROR;

/**
 *
 * @author
 * @author Suraj Rahade 22/7/2021
 */
@RestController
@RequestMapping(value = "/rest/templates")
public class TemplatesController {
    
    private final Logger logger = LoggerFactory.getLogger(VatController.class);


    @Autowired
    private JwtTokenUtil jwtTokenUtil;


    @Autowired
    private EntityManager entityManager;



    @Autowired
    MailThemeTemplatesService mailThemeTemplatesService;
    
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Mail Template Theme")
    @PostMapping(value = "/updateMailTemplateTheme")
    public ResponseEntity<String> update(@RequestParam(value = "templateId") Integer templateId, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            mailThemeTemplatesService.updateMailTheme(templateId);
//            Query query1=getEntityManager()
//                    .createQuery("UPDATE MailThemeTemplates m SET m.templateEnable=false WHERE m.templateEnable=true ");
//            query1.executeUpdate();
//
//            Query query=getEntityManager()
//                    .createQuery("UPDATE MailThemeTemplates m SET m.templateEnable=true WHERE m.templateId = :templateId ");
//            query.setParameter("templateId", templateId);
//            query.executeUpdate();
            return new ResponseEntity<>("Email template Theme Updated Successful", HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    //    SELECT m.TEMPLATE_ID,m.TEMPLATE_ENABLE  FROM `mail_theme_templates` m WHERE `TEMPLATE_ENABLE`=1 LIMIT 1;
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
