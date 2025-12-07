package com.simpleaccounts.rest.payroll;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.constant.DefaultTypeConstant;
import com.simpleaccounts.constant.EmailConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.EmployeeBankDetailsPersistModel;
import com.simpleaccounts.model.EmploymentPersistModel;
import com.simpleaccounts.repository.*;
import com.simpleaccounts.rest.*;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.rest.employeecontroller.EmployeePersistModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.rest.payroll.dao.EmployeeSalaryComponentRelationDao;
import com.simpleaccounts.rest.payroll.model.GeneratePayrollPersistModel;

import com.simpleaccounts.rest.payroll.model.PayrolRequestModel;
import com.simpleaccounts.rest.payroll.model.PayrollListModel;
import com.simpleaccounts.rest.payroll.payrolService.PayrolService;
import com.simpleaccounts.rest.payroll.service.*;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.EmailSender;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.MathContext;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

import static com.simpleaccounts.rest.invoicecontroller.HtmlTemplateConstants.*;

@Component
public class PayrollRestHepler {
    private final Logger logger = LoggerFactory.getLogger(InvoiceRestHelper.class);
    @Autowired
    private EmployeeBankDetailsService employeeBankDetailsService;
    @Autowired
    RoleModuleRelationService roleModuleRelationService;

    @Autowired
    CoacTransactionCategoryService coacTransactionCategoryService ;
    @Autowired
    ChartOfAccountService chartOfAccountService ;
    @Autowired
    JournalService journalService;
    @Autowired
    EmployeeTransactioncategoryService employeeTransactioncategoryService;
    @Autowired
    private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;
    @Autowired
    InvoiceNumberUtil invoiceNumberUtil;
    @Autowired
    private EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;

    @Autowired
    private EmploymentService employmentService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;
    @Autowired
    SalaryService salaryService;

    @Autowired
    private SalaryRoleService salaryRoleService;

    @Autowired
    private SalaryTemplateService salaryTemplateService;

    @Autowired
    private EmployeeSalaryComponentRelationDao employeeSalaryComponentRelationDao;

    @Autowired
    private SalaryStructureService salaryStructureService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private DateFormatUtil dateFormatUtil;

    @Autowired
    private DateFormatUtil dateUtil;

    @Autowired
    private SalaryComponentService salaryComponentService;

    @Autowired
    private EmployeeParentRelationService employeeParentRelationService;

    @Autowired
    PayrollRepository payrollRepository;

    @Autowired
    UserJpaRepository userJpaRepository;
    @Autowired
    private CompanyService companyService;

    @Autowired
    SalaryRepository salaryRepository;

    @Autowired
    ResourceLoader resourceLoader;
    @Autowired
    UserService userService;
    @Autowired
    EmailSender emailSender;
    @Autowired
    private EmaiLogsService emaiLogsService;
    @Autowired
    private PayrolService payrolService;

    @Autowired
    private JournalLineItemRepository journalLineItemRepository;

    @Autowired
    SalaryController salaryController;
    @Autowired
    private PayrollEmployeeRepository payrollEmployeeRepository;
    @Autowired
    private EmployeeSalaryComponentRelationRepository employeeSalaryComponentRelationRepository;

    public EmployeeBankDetails getEntity(EmployeeBankDetailsPersistModel employeeBankDetailsPersistModel) throws IOException {
        EmployeeBankDetails employeeBankDetails = new EmployeeBankDetails();

        if (employeeBankDetailsPersistModel.getId() != null) {

            employeeBankDetails = employeeBankDetailsService.findByPK(employeeBankDetailsPersistModel.getId());
            employeeBankDetails.setId(employeeBankDetailsPersistModel.getId());
        }

        if (employeeBankDetailsPersistModel.getBankId() != null) {
            employeeBankDetails.setBankId(employeeBankDetailsPersistModel.getBankId());
        }
        if (employeeBankDetailsPersistModel.getBankName() != null) {
            employeeBankDetails.setBankName(employeeBankDetailsPersistModel.getBankName());
        }

        if (employeeBankDetailsPersistModel.getBranch() != null) {
            employeeBankDetails.setBranch(employeeBankDetailsPersistModel.getBranch());
        }

        if (employeeBankDetailsPersistModel.getAccountHolderName() != null) {
            employeeBankDetails.setAccountHolderName(employeeBankDetailsPersistModel.getAccountHolderName());
        }

        if (employeeBankDetailsPersistModel.getAccountNumber() != null) {
            employeeBankDetails.setAccountNumber(employeeBankDetailsPersistModel.getAccountNumber());
        }

        if (employeeBankDetailsPersistModel.getIban() != null) {
            employeeBankDetails.setIban(employeeBankDetailsPersistModel.getIban());
        }

        if (employeeBankDetailsPersistModel.getRoutingCode() != null) {
            employeeBankDetails.setRoutingCode(employeeBankDetailsPersistModel.getRoutingCode());
        }

        if (employeeBankDetailsPersistModel.getSwiftCode() != null) {
            employeeBankDetails.setSwiftCode(employeeBankDetailsPersistModel.getSwiftCode());
        }
        if (employeeBankDetailsPersistModel.getEmployee() != null) {
            employeeBankDetails.setEmployee(employeeService.findByPK(employeeBankDetailsPersistModel.getEmployee()));
        }

        if(employeeBankDetailsPersistModel.getAgentId()!=null && employeeBankDetailsPersistModel.getEmploymentId()!=null)
        {
            Employment employment=employmentService.findByPK(employeeBankDetailsPersistModel.getEmploymentId());
            employment.setAgentId(employeeBankDetailsPersistModel.getAgentId());
            employmentService.update(employment);
        }
        return employeeBankDetails;
    }

    public EmployeeBankDetailsPersistModel getModel(EmployeeBankDetails employeeBankDetails) {
        EmployeeBankDetailsPersistModel employeeBankDetailsPersistModel = new EmployeeBankDetailsPersistModel();
//            employeeBankDetails = employeeBankDetailsService.findByPK(employeeBankDetailsPersistModel.getId());

        employeeBankDetailsPersistModel.setId(employeeBankDetails.getId());

        employeeBankDetailsPersistModel.setBankName(employeeBankDetails.getBankName());

        employeeBankDetailsPersistModel.setBranch(employeeBankDetails.getBranch());

        employeeBankDetailsPersistModel.setAccountHolderName(employeeBankDetails.getAccountHolderName());

        employeeBankDetailsPersistModel.setAccountNumber(employeeBankDetails.getAccountNumber());

        employeeBankDetailsPersistModel.setIban(employeeBankDetails.getIban());

        employeeBankDetailsPersistModel.setRoutingCode(employeeBankDetails.getRoutingCode());

        employeeBankDetailsPersistModel.setSwiftCode(employeeBankDetails.getSwiftCode());
//        employeeBankDetailsPersistModel.setEmployee(employeeBankDetails.getEmployee());

        return employeeBankDetailsPersistModel;
    }

// Employment

    @Transactional(rollbackFor = Exception.class)
    public Employment getEmploymentEntity(EmploymentPersistModel employmentPersistModel) throws IOException {

        Employment employment = new Employment();

        if (employmentPersistModel.getId() != null) {
            employment = employmentService.findByPK(employmentPersistModel.getId());
            employment.setId(employmentPersistModel.getId());
        }

        if (employmentPersistModel.getDepartment() != null) {
            employment.setDepartment(employmentPersistModel.getDepartment());
        }
        if (employmentPersistModel.getEmployeeCode() != null) {
            employment.setEmployeeCode(employmentPersistModel.getEmployeeCode());
        }
//        if (employmentPersistModel.getAgentId() != null) {
//            employment.setAgentId(employmentPersistModel.getAgentId());
//        }
        if (employmentPersistModel.getAvailedLeaves() != null) {
            employment.setAvailedLeaves(employmentPersistModel.getAvailedLeaves());
        }

        if (employmentPersistModel.getContractType() != null) {
            employment.setContractType(employmentPersistModel.getContractType());
        }
        if (employmentPersistModel.getDateOfJoining() != null) {
            employment.setDateOfJoining(dateUtil.getDateStrAsLocalDateTime(employmentPersistModel.getDateOfJoining(), "dd-MM-yyyy"));
        }else
            employment.setDateOfJoining(LocalDateTime.now());

        if (employmentPersistModel.getLabourCard() != null) {
            employment.setLabourCard(employmentPersistModel.getLabourCard());
        }
        if (employmentPersistModel.getLeavesAvailed() != null) {
            employment.setLeavesAvailed(employmentPersistModel.getLeavesAvailed());
        }
        if (employmentPersistModel.getPassportNumber() != null) {
            employment.setPassportNumber(employmentPersistModel.getPassportNumber());
        }
        if (employmentPersistModel.getPassportExpiryDate() != null && !employmentPersistModel.getPassportExpiryDate().isEmpty()) {
            employment.setPassportExpiryDate(dateUtil.getDateStrAsLocalDateTime(employmentPersistModel.getPassportExpiryDate(), "dd-MM-yyyy"));
        }
//        else
//            employment.setPassportExpiryDate(LocalDateTime.now());

        if (employmentPersistModel.getVisaExpiryDate() != null) {
            employment.setVisaExpiryDate(dateUtil.getDateStrAsLocalDateTime(employmentPersistModel.getVisaExpiryDate(), "dd-MM-yyyy"));
        }  else
            employment.setVisaExpiryDate(LocalDateTime.now());

        if (employmentPersistModel.getVisaNumber() != null) {
            employment.setVisaNumber(employmentPersistModel.getVisaNumber());
        }
        if (employmentPersistModel.getEmployee() != null) {
            employment.setEmployee(employeeService.findByPK(employmentPersistModel.getEmployee()));
        }
        if (employmentPersistModel.getGrossSalary() != null) {
            employment.setGrossSalary(employmentPersistModel.getGrossSalary());
        }

        //EmployeeCode Auto Increment
        CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(8);
        String suffix = invoiceNumberUtil.fetchSuffixFromString(employmentPersistModel.getEmployeeCode());
        template.setSuffix(Integer.parseInt(suffix));
        String prefix = employmentPersistModel.getEmployeeCode().substring(0, employmentPersistModel.getEmployeeCode().lastIndexOf(suffix));
        template.setPrefix(prefix);
        customizeInvoiceTemplateService.persist(template);

        return employment;
    }

    public EmployeeParentRelation getEmployeeParentRelationEntity(EmployeePersistModel employeePersistModel, Employee employee, Integer userId) throws IOException {
        EmployeeParentRelation employeeParentRelation = new EmployeeParentRelation();
        // Employee employee= employeeService.findByPK(1);

        Employee parentId = employeeService.findByPK(employee.getParentId());
        Map<String, Object> param = new HashMap<>();
        param.put("childID", employee.getId());
        List<EmployeeParentRelation> employeeParentRelationList = employeeParentRelationService.findByAttributes(param);
        if (employeeParentRelationList != null && !employeeParentRelationList.isEmpty()) {
            employeeParentRelation = employeeParentRelationList.get(0);
            if (employeeParentRelationList != null && !employeeParentRelationList.isEmpty()) {
                for (EmployeeParentRelation employeeParentRelation1 : employeeParentRelationList) {
                    employeeParentRelation.setParentID(parentId);
                    employeeParentRelation1.setParentID(parentId);
                    employeeParentRelation.setParentType(employeeParentRelation1.getParentType());
                    employeeParentRelation.setChildID(employee);
                    employeeParentRelation.setChildType(employeeParentRelation1.getChildType());
                    employeeParentRelation.setCreatedBy(userId);
                    employeeParentRelation.setCreatedDate(LocalDateTime.now());
                    employeeParentRelation.setLastUpdatedBy(userId);
                    employeeParentRelation.setLastUpdateDate(LocalDateTime.now());
                }
            }
        } else {
            employeeParentRelation.setParentID(employeeService.findByPK(employeePersistModel.getParentId()));
            // employeeParentRelation.setParentType(employeeParentRelation1.getParentType());
            employeeParentRelation.setChildID(employee);
            // employeeParentRelation.setChildType(employeeParentRelation1.getChildType());
            employeeParentRelation.setCreatedBy(userId);
            employeeParentRelation.setCreatedDate(LocalDateTime.now());
            employeeParentRelation.setLastUpdatedBy(userId);
            employeeParentRelation.setLastUpdateDate(LocalDateTime.now());
        }

        return employeeParentRelation;
    }
//SalaryDesignation

    public SalaryRole getSalaryRoleEntity(SalaryRolePersistModel salaryRolePersistModel) throws IOException {
        SalaryRole salaryRole = new SalaryRole();

        if (salaryRolePersistModel.getId() != null) {
            salaryRole = salaryRoleService.findByPK(salaryRolePersistModel.getId());
        }
        if (salaryRolePersistModel.getSalaryRoleName() != null) {
            salaryRole.setRoleName(salaryRolePersistModel.getSalaryRoleName());
        }
        return salaryRole;
    }

    // getSalaryStructureEntity
    public SalaryStructure getSalaryStructureEntity(SalaryStructurePersistModel salaryStructurePersistModel) throws IOException {
        SalaryStructure salaryStructure = new SalaryStructure();

        if (salaryStructurePersistModel.getId() != null) {
            salaryStructure = salaryStructureService.findByPK(salaryStructurePersistModel.getId());
//            employment.setId(employmentPersistModel.getId() );
        }
        if (salaryStructurePersistModel.getName() != null) {
            salaryStructure.setName(salaryStructurePersistModel.getName());
        }

        if (salaryStructurePersistModel.getType() != null) {
            salaryStructure.setType(salaryStructurePersistModel.getType());
        }

        return salaryStructure;
    }

    // getSalaryTemplateEntity
    public SalaryTemplate getSalaryTemplateEntity(SalaryTemplatePersistModel salaryTemplatePersistModel) throws IOException {
        SalaryTemplate salaryTemplate = new SalaryTemplate();

        if (salaryTemplatePersistModel.getId() != null) {
            salaryTemplate = salaryTemplateService.findByPK(salaryTemplatePersistModel.getId());
            salaryTemplate.setId(salaryTemplatePersistModel.getId());
        }
        if (salaryTemplatePersistModel.getSalaryComponentId() != null) {
            salaryTemplate.setSalaryComponentId(salaryComponentService.findByPK(salaryTemplatePersistModel.getSalaryComponentId()));
        }


        return salaryTemplate;
    }

    //
//    public void getSalaryAllTemplate(EmployeePersistModel employeePersistModel , Employee employee,
//                                       List<SalaryTemplatePersistModel> salaryTemplatePersistModels) {
//        if (employeePersistModel.getSalaryTemplatesString() != null && !employeePersistModel.getSalaryTemplatesString().isEmpty()) {
//            ObjectMapper mapper = new ObjectMapper();
//            try {
//                salaryTemplatePersistModels = mapper.readValue(employeePersistModel.getSalaryTemplatesString(),
//                        new TypeReference<List<SalaryTemplatePersistModel>>() {
//                        });
//            } catch (IOException ex) {
//                logger.error("Error", ex);
//            }
//            if (!salaryTemplatePersistModels.isEmpty()) {
//               getSalaryTemplates(salaryTemplatePersistModels, employee);
//
//            }
//
//        }
//
//    }
    public void getUpdatedSalaryAllTemplate(EmployeePersistModel employeePersistModel, Employee employee,
                                            List<SalaryTemplatePersistModel> salaryTemplatePersistModels) {
        if (employeePersistModel.getSalaryTemplatesString() != null && !employeePersistModel.getSalaryTemplatesString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                salaryTemplatePersistModels = mapper.readValue(employeePersistModel.getSalaryTemplatesString(),
                        new TypeReference<List<SalaryTemplatePersistModel>>() {
                        });
            } catch (IOException ex) {
                logger.error("Error", ex);
            }
            if (!salaryTemplatePersistModels.isEmpty()) {
                getUpdatedSalaryTemplates(salaryTemplatePersistModels, employee);

            }

        }

    }

    @Transactional(rollbackFor = Exception.class)
    public List<SalaryTemplate> getSalaryTemplates(List<SalaryTemplatePersistModel> salaryTemplatePersistModels, Employee employee) {
        List<SalaryTemplate> salaryTemplateModels = new ArrayList<>();
        for (SalaryTemplatePersistModel model : salaryTemplatePersistModels) {
            try {
                SalaryTemplate salaryTemplate = new SalaryTemplate();
                salaryTemplate.setSalaryComponentId(salaryComponentService.findByPK(model.getSalaryComponentId()));
                salaryTemplateModels.add(salaryTemplate);
                salaryTemplateService.persist(salaryTemplate);
                EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
                employeeSalaryComponentRelation.setEmployeeId(employee);
                SalaryComponent salaryComponent = salaryComponentService.findByPK(salaryTemplate.getSalaryComponentId().getId());
                employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent);
                employeeSalaryComponentRelation.setDeleteFlag(false);
                employeeSalaryComponentRelation.setSalaryStructure(salaryComponent.getSalaryStructure());
                employeeSalaryComponentRelation.setFormula(salaryComponent.getFormula());
                employeeSalaryComponentRelation.setFlatAmount(salaryComponent.getFlatAmount());
                employeeSalaryComponentRelation.setDescription(salaryComponent.getDescription());
                employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);


            } catch (Exception e) {
                logger.error("Error", e);
                return new ArrayList<>();
            }
        }
        return salaryTemplateModels;
    }

    @Transactional(rollbackFor = Exception.class)
    public List<SalaryTemplate> getUpdatedSalaryTemplates(List<SalaryTemplatePersistModel> salaryTemplatePersistModels, Employee employee) {

        Map<String, Object> param = new HashMap<>();
        param.put("employeeId", employee);
        List<EmployeeSalaryComponentRelation> existingTemplates = employeeSalaryComponentRelationService.findByAttributes(param);
        for (EmployeeSalaryComponentRelation relation : existingTemplates) {
            Map<String, Object> param1 = new HashMap<>();
            param1.put("id", relation.getSalaryComponentId());
            List<SalaryTemplate> existingSalaryTemplates = salaryTemplateService.findByAttributes(param1);
            for (SalaryTemplate salaryTemplateModel : existingSalaryTemplates) {

                salaryTemplateService.delete(salaryTemplateModel);
            }
            employeeSalaryComponentRelationService.delete(relation);

        }

        List<SalaryTemplate> salaryTemplates = new ArrayList<>();
        for (SalaryTemplatePersistModel model : salaryTemplatePersistModels) {
            try {
                SalaryTemplate salaryTemplate = new SalaryTemplate();
                salaryTemplate.setSalaryComponentId(salaryComponentService.findByPK(model.getSalaryComponentId()));
                salaryTemplates.add(salaryTemplate);
                salaryTemplateService.persist(salaryTemplate);
                EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
                employeeSalaryComponentRelation.setEmployeeId(employee);
                SalaryComponent salaryComponent = salaryComponentService.findByPK(salaryTemplate.getSalaryComponentId().getId());
                employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent);
                employeeSalaryComponentRelation.setDeleteFlag(false);
                employeeSalaryComponentRelation.setSalaryStructure(salaryComponent.getSalaryStructure());
                employeeSalaryComponentRelation.setFormula(salaryComponent.getFormula());
                employeeSalaryComponentRelation.setFlatAmount(salaryComponent.getFlatAmount());
                employeeSalaryComponentRelation.setDescription(salaryComponent.getDescription());
                employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);

            } catch (Exception e) {
                logger.error("Error", e);
                return new ArrayList<>();
            }
        }
        return salaryTemplates;
    }


    public EmploymentPersistModel getEmploymentModel(Employment employment) {
        EmploymentPersistModel employmentPersistModel = new EmploymentPersistModel();

        employmentPersistModel.setId(employment.getId());
        employmentPersistModel.setEmployee(employment.getEmployee().getId());
        employmentPersistModel.setAvailedLeaves(employment.getAvailedLeaves());
        employmentPersistModel.setDepartment(employment.getDepartment());
        employmentPersistModel.setDateOfJoining(dateUtil.getLocalDateTimeAsString(employment.getDateOfJoining(), "dd-MM-yyyy"));
        employmentPersistModel.setContractType(employment.getContractType());
        employmentPersistModel.setLabourCard(employment.getLabourCard());
        employmentPersistModel.setVisaNumber(employment.getVisaNumber());
        employmentPersistModel.setVisaExpiryDate(dateUtil.getLocalDateTimeAsString(employment.getVisaExpiryDate(), "dd-MM-yyyy"));
        employmentPersistModel.setPassportNumber(employment.getPassportNumber());
        employmentPersistModel.setPassportExpiryDate(dateUtil.getLocalDateTimeAsString(employment.getPassportExpiryDate(), "dd-MM-yyyy"));
        employmentPersistModel.setLeavesAvailed(employment.getLeavesAvailed());
        employmentPersistModel.setGrossSalary(employment.getGrossSalary());
        return employmentPersistModel;
    }


    public SalaryRolePersistModel getSalaryRoleModel(SalaryRole salaryRole) {
        SalaryRolePersistModel salaryRolePersistModel = new SalaryRolePersistModel();

        salaryRolePersistModel.setId(salaryRole.getId());
        salaryRolePersistModel.setSalaryRoleName(salaryRole.getRoleName());

        return salaryRolePersistModel;
    }

    public SalaryTemplatePersistModel getSalaryTemplateModel(SalaryTemplate salaryTemplate) {
        SalaryTemplatePersistModel salaryTemplatePersistModel = new SalaryTemplatePersistModel();

        salaryTemplatePersistModel.setId(salaryTemplate.getId());


        return salaryTemplatePersistModel;
    }


    public SalaryStructurePersistModel getSalaryStructureModel(SalaryStructure salaryStructure) {
        SalaryStructurePersistModel salaryStructurePersistModel = new SalaryStructurePersistModel();

        salaryStructurePersistModel.setId(salaryStructure.getId());
        salaryStructurePersistModel.setName(salaryStructure.getName());
        salaryStructurePersistModel.setType(salaryStructure.getType());

        return salaryStructurePersistModel;
    }

    public PaginationResponseModel getSalaryRoleListModel(PaginationResponseModel paginationResponseModel) {
        List<SalaryRoleListModel> modelList = new ArrayList<>();

        if (paginationResponseModel != null && paginationResponseModel.getData() != null) {
            List<SalaryRole> salaryRoleList = (List<SalaryRole>) paginationResponseModel.getData();
            for (SalaryRole salaryRole : salaryRoleList) {
                SalaryRoleListModel model = new SalaryRoleListModel();
                model.setSalaryRoleId(salaryRole.getId());
                model.setSalaryRoleName(salaryRole.getRoleName());
                modelList.add(model);
            }
            paginationResponseModel.setData(modelList);
        }
        return paginationResponseModel;
    }

    public PaginationResponseModel getSalaryTemplateListModel(PaginationResponseModel paginationResponseModel) {
        List<SalaryTemplateListModal> modelList = new ArrayList<>();

        if (paginationResponseModel != null && paginationResponseModel.getData() != null) {
            List<SalaryTemplate> salaryTemplateList = (List<SalaryTemplate>) paginationResponseModel.getData();
            for (SalaryTemplate salaryTemplate : salaryTemplateList) {
                SalaryTemplateListModal model = new SalaryTemplateListModal();
                model.setId(salaryTemplate.getId());
                model.setSalaryComponentId(salaryTemplate.getSalaryComponentId().getId());
                model.setFormula(salaryTemplate.getSalaryComponentId().getFormula());
                model.setDescription(salaryTemplate.getSalaryComponentId().getDescription());
                model.setFlatAmount(salaryTemplate.getSalaryComponentId().getFlatAmount());
                model.setSalaryRoleId(salaryTemplate.getSalaryRoleId().getId());
                model.setSalaryStructure(salaryTemplate.getSalaryComponentId().getSalaryStructure().getName());
                modelList.add(model);
            }
            paginationResponseModel.setData(modelList);
        }
        return paginationResponseModel;
    }


    public PaginationResponseModel getSalaryStructureListModel(PaginationResponseModel paginationResponseModel) {
        List<SalaryStructureListModel> modelList = new ArrayList<>();

        if (paginationResponseModel != null && paginationResponseModel.getData() != null) {
            List<SalaryStructure> salaryStructureList = (List<SalaryStructure>) paginationResponseModel.getData();
            for (SalaryStructure salaryStructure : salaryStructureList) {
                SalaryStructureListModel model = new SalaryStructureListModel();
                model.setSalaryStructureId(salaryStructure.getId());
                model.setSalaryStructureType(salaryStructure.getType());
                model.setSalaryStructureName(salaryStructure.getName());
                modelList.add(model);
            }
            paginationResponseModel.setData(modelList);
        }
        return paginationResponseModel;
    }

    public EmployeeBankDetails getEmployeeBankDetailsEntity(EmployeePersistModel employeePersistModel, Employee employee, Integer userId) {

        EmployeeBankDetails employeeBankDetails = new EmployeeBankDetails();
        Map<String, Object> param = new HashMap<>();
        param.put("employee", employee);
        List<EmployeeBankDetails> employeeBankDetailsList = employeeBankDetailsService.findByAttributes(param);
        employeeBankDetails = employeeBankDetailsList.get(0);

        for (EmployeeBankDetails employeeBankDetail : employeeBankDetailsList) {

            if (employeePersistModel.getBankName() != null) {
                employeeBankDetails.setBankName(employeePersistModel.getBankName());
            }

            if (employeePersistModel.getBranch() != null) {
                employeeBankDetails.setBranch(employeePersistModel.getBranch());
            }

            if (employeePersistModel.getAccountHolderName() != null) {
                employeeBankDetails.setAccountHolderName(employeePersistModel.getAccountHolderName());
            }

            if (employeePersistModel.getAccountNumber() != null) {
                employeeBankDetails.setAccountNumber(employeePersistModel.getAccountNumber());
            }

            if (employeePersistModel.getIban() != null) {
                employeeBankDetails.setIban(employeePersistModel.getIban());
            }

            if (employeePersistModel.getRoutingCode() != null) {
                employeeBankDetails.setRoutingCode(employeePersistModel.getRoutingCode());
            }

            if (employeePersistModel.getSwiftCode() != null) {
                employeeBankDetails.setSwiftCode(employeePersistModel.getSwiftCode());
            }
        }
        return employeeBankDetails;
    }

    public Employment getEmploymentsEntity(EmployeePersistModel employeePersistModel, Employee employee, Integer userId) {

        Employment employment = new Employment();
        Map<String, Object> param = new HashMap<>();
        param.put("employee", employee);
        List<Employment> employmentList = employmentService.findByAttributes(param);
        employment = employmentList.get(0);

        if (employeePersistModel.getDepartment() != null) {
            employment.setDepartment(employeePersistModel.getDepartment());
        }
        if (employeePersistModel.getEmployeeCode() != null) {
            employment.setEmployeeCode(employeePersistModel.getEmployeeCode());
        }
        if (employeePersistModel.getAvailedLeaves() != null) {
            employment.setAvailedLeaves(employeePersistModel.getAvailedLeaves());
        }

        if (employeePersistModel.getContractType() != null) {
            employment.setContractType(employeePersistModel.getContractType());
        }
        if (employeePersistModel.getDateOfJoining() != null) {
            employment.setDateOfJoining(dateUtil.getDateStrAsLocalDateTime(employeePersistModel.getDateOfJoining(), "dd-MM-yyyy"));
        }

        if (employeePersistModel.getLabourCard() != null) {
            employment.setLabourCard(employeePersistModel.getLabourCard());
        }
        if (employeePersistModel.getLeavesAvailed() != null) {
            employment.setLeavesAvailed(employeePersistModel.getLeavesAvailed());
        }
        if (employeePersistModel.getPassportNumber() != null) {
            employment.setPassportNumber(employeePersistModel.getPassportNumber());
        }
        if (employeePersistModel.getPassportExpiryDate() != null) {
            employment.setPassportExpiryDate(dateUtil.getDateStrAsLocalDateTime(employeePersistModel.getDateOfJoining(), "dd-MM-yyyy"));
        }
        if (employeePersistModel.getVisaExpiryDate() != null) {
            employment.setVisaExpiryDate(dateUtil.getDateStrAsLocalDateTime(employeePersistModel.getDateOfJoining(), "dd-MM-yyyy"));
        }
        if (employeePersistModel.getVisaNumber() != null) {
            employment.setVisaNumber(employeePersistModel.getVisaNumber());
        }

        if (employeePersistModel.getGrossSalary() != null) {
            employment.setGrossSalary(employeePersistModel.getGrossSalary());
        }

        return employment;
    }

    public void getSalaryAllTemplate(SalaryTemplatePersistModel salaryTemplatePersistModel, List<SalaryTemplatePersistModel> salaryTemplatePersistModels) {

        if (salaryTemplatePersistModel.getSalaryTemplatesString() != null && !salaryTemplatePersistModel.getSalaryTemplatesString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                salaryTemplatePersistModels = mapper.readValue(salaryTemplatePersistModel.getSalaryTemplatesString(),
                        new TypeReference<List<SalaryTemplatePersistModel>>() {
                        });
            } catch (IOException ex) {
                logger.error("Error", ex);
            }
            if (!salaryTemplatePersistModels.isEmpty()) {
                getSalaryTemplates(salaryTemplatePersistModels);

            }

        }

    }

    @Transactional(rollbackFor = Exception.class)
    public List<SalaryTemplate> getSalaryTemplates(List<SalaryTemplatePersistModel> salaryTemplatePersistModels) {
        List<SalaryTemplate> salaryTemplateModels = new ArrayList<>();
        for (SalaryTemplatePersistModel model : salaryTemplatePersistModels) {
            try {
                SalaryTemplate salaryTemplate = new SalaryTemplate();
                salaryTemplate.setSalaryComponentId(salaryComponentService.findByPK(model.getSalaryComponentId()));
                salaryTemplateModels.add(salaryTemplate);
                salaryTemplateService.persist(salaryTemplate);
            } catch (Exception e) {
                logger.error("Error", e);
                return new ArrayList<>();
            }
        }
        return salaryTemplateModels;
    }

    public void getUpdatedSalaryAllTemplate(SalaryTemplatePersistModel salaryTemplatePersistModel, List<SalaryTemplatePersistModel> salaryTemplatePersistModels) {

        if (salaryTemplatePersistModel.getSalaryTemplatesString() != null && !salaryTemplatePersistModel.getSalaryTemplatesString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                salaryTemplatePersistModels = mapper.readValue(salaryTemplatePersistModel.getSalaryTemplatesString(),
                        new TypeReference<List<SalaryTemplatePersistModel>>() {
                        });
            } catch (IOException ex) {
                logger.error("Error", ex);
            }
            if (!salaryTemplatePersistModels.isEmpty()) {
                getUpdatedSalaryTemplates(salaryTemplatePersistModels);

            }

        }

    }

    @Transactional(rollbackFor = Exception.class)
    List<SalaryTemplate> getUpdatedSalaryTemplates(List<SalaryTemplatePersistModel> salaryTemplatePersistModels) {

        List<SalaryTemplate> salaryTemplates = new ArrayList<>();
        for (SalaryTemplatePersistModel model1 : salaryTemplatePersistModels) {

            if (model1.getId() != null) {
                salaryTemplateService.delete(salaryTemplateService.findByPK(model1.getId()));
            }

            SalaryTemplate salaryTemplate = new SalaryTemplate();
            //    salaryTemplate.setId(model1.getId());
            salaryTemplate.setSalaryComponentId(salaryComponentService.findByPK(model1.getSalaryComponentId()));
            salaryTemplates.add(salaryTemplate);
            salaryTemplateService.persist(salaryTemplate);
//                EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
//                employeeSalaryComponentRelation.setEmployeeId(employee);
//                SalaryComponent salaryComponent = salaryComponentService.findByPK(salaryTemplate.getSalaryComponentId().getId());
//                employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent);
//                employeeSalaryComponentRelation.setDeleteFlag(false);
//                employeeSalaryComponentRelation.setSalaryStructure(salaryComponent.getSalaryStructure());
//                employeeSalaryComponentRelation.setFormula(salaryComponent.getFormula());
//                employeeSalaryComponentRelation.setFlatAmount(salaryComponent.getFlatAmount());
//                employeeSalaryComponentRelation.setDescription(salaryComponent.getDescription());
//                employeeSalaryTempRelationService.persist(employeeSalaryComponentRelation);
            try {

            } catch (Exception e) {
                logger.error("Error", e);
                return new ArrayList<>();
            }
        }
        return salaryTemplates;
    }

    public void saveAllSalaryComponent(SalaryComponentPersistModel salaryComponentPersistModel, List<SalaryComponentPersistModel> salaryComponentPersistModels) {

        if (salaryComponentPersistModel.getSalaryComponentString() != null && !salaryComponentPersistModel.getSalaryComponentString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                salaryComponentPersistModels = mapper.readValue(salaryComponentPersistModel.getSalaryComponentString(),
                        new TypeReference<List<SalaryComponentPersistModel>>() {
                        });
            } catch (IOException ex) {
                logger.error("Error", ex);
            }
            if (!salaryComponentPersistModels.isEmpty()) {
                getSalaryComponents(salaryComponentPersistModels, salaryComponentPersistModel);
            }
        } else {
            getSalaryComponents(salaryComponentPersistModels, salaryComponentPersistModel);

        }


    }

    @Transactional(rollbackFor = Exception.class)
    void getSalaryComponents(List<SalaryComponentPersistModel> salaryComponentPersistModels, SalaryComponentPersistModel salaryComponentPersistModel) {
        List<SalaryComponent> salaryComponentList = new ArrayList<>();
        if (salaryComponentPersistModels != null && !salaryComponentPersistModels.isEmpty()) {
            for (SalaryComponentPersistModel model : salaryComponentPersistModels) {
                try {
                    if (model.getId() == null) {
                        SalaryComponent salaryComponent = new SalaryComponent();
                        salaryComponent.setSalaryStructure(salaryStructureService.findByPK(Integer.valueOf(model.getSalaryStructure())));
                        salaryComponent.setFormula(model.getFormula());
                        salaryComponent.setDeleteFlag(false);
                        salaryComponent.setFlatAmount(model.getFlatAmount());
                        salaryComponent.setDescription(model.getDescription());
                        if (model.getCalculationType() != null) {
                            salaryComponent.setCalculationType(model.getCalculationType());
                        }
                        if (model.getComponentType() != null && !model.getComponentType().isEmpty()) {
                            salaryComponent.setComponentType(model.getComponentType());
                        }
                        if (model.getComponentCode() != null && !model.getComponentCode().isEmpty()) {
                            salaryComponent.setComponentCode(model.getComponentCode());
                        }
                        salaryComponentList.add(salaryComponent);
                        if (model.getInvoiceType() != null && !model.getInvoiceType().isEmpty()) {
                            Integer invoiceType=Integer.parseInt(model.getInvoiceType());
                            CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(invoiceType);
                            String suffix=invoiceNumberUtil.fetchSuffixFromString(model.getComponentCode());
                            template.setSuffix(Integer.parseInt(suffix));
                            String prefix= salaryComponent.getComponentCode().substring(0,salaryComponent.getComponentCode().lastIndexOf(suffix));
                            template.setPrefix(prefix);
                            customizeInvoiceTemplateService.persist(template);
                        }
                        salaryComponentService.persist(salaryComponent);
                    }
                        if (model.getEmployeeId() != null && model.getSalaryComponentId()!= 1) {
                            EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
                            employeeSalaryComponentRelation.setEmployeeId(employeeService.findByPK(model.getEmployeeId()));
                            SalaryComponent salaryComponent = salaryComponentService.findByPK(model.getSalaryComponentId());
                            employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent);
                            employeeSalaryComponentRelation.setSalaryStructure(salaryStructureService.findByPK(Integer.valueOf(model.getSalaryStructure())));
                            employeeSalaryComponentRelation.setFormula(model.getFormula());
                            employeeSalaryComponentRelation.setDeleteFlag(false);
                            employeeSalaryComponentRelation.setFlatAmount(model.getFlatAmount());
                            employeeSalaryComponentRelation.setDescription(model.getDescription());
                            employeeSalaryComponentRelation.setMonthlyAmount(model.getMonthlyAmount());
                            employeeSalaryComponentRelation.setYearlyAmount(model.getYearlyAmount());
                            employeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                            employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);
                        }
                    if (model.getEmployeeId() != null && model.getSalaryComponentId()== 1 ) {
                        EmployeeSalaryComponentRelation employeeSalaryComponentRelation = employeeSalaryComponentRelationService.findByPK(model.getId());
                        employeeSalaryComponentRelation.setEmployeeId(employeeService.findByPK(model.getEmployeeId()));
                        SalaryComponent salaryComponent = salaryComponentService.findByPK(model.getSalaryComponentId());
                        employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent);
                        employeeSalaryComponentRelation.setSalaryStructure(salaryComponent.getSalaryStructure());
                        employeeSalaryComponentRelation.setFormula(model.getFormula());
                        employeeSalaryComponentRelation.setDeleteFlag(false);
                        employeeSalaryComponentRelation.setFlatAmount(model.getFlatAmount());
                        employeeSalaryComponentRelation.setDescription(salaryComponent.getDescription());
                        employeeSalaryComponentRelation.setMonthlyAmount(model.getMonthlyAmount());
                        employeeSalaryComponentRelation.setYearlyAmount(model.getYearlyAmount());
                        employeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                        employeeSalaryComponentRelationService.update(employeeSalaryComponentRelation);

                    }

                } catch (Exception e) {
                    logger.error("Error", e);
                }
                Map<String, Object> employmentParam = new HashMap<>();
                employmentParam.put("employee", model.getEmployeeId());
                List<Employment> employmentList = employmentService.findByAttributes(employmentParam);
                if (employmentList != null && !employmentList.isEmpty()) {
                    Employment employment = employmentList.get(0);
                    if (salaryComponentPersistModel.getGrossSalary() != null) {
                        employment.setGrossSalary(salaryComponentPersistModel.getGrossSalary());
                        employment.setCtcType(salaryComponentPersistModel.getCtcType());
                        employmentService.update(employment);
                    }
                }
            }

        } else {
            if (salaryComponentPersistModel.getId() == null) {
                SalaryComponent salaryComponent = new SalaryComponent();
                salaryComponent.setSalaryStructure(salaryStructureService.findByPK(Integer.valueOf(salaryComponentPersistModel.getSalaryStructure())));
                salaryComponent.setFormula(salaryComponentPersistModel.getFormula());
                salaryComponent.setDeleteFlag(false);
                salaryComponent.setFlatAmount(salaryComponentPersistModel.getFlatAmount());
                salaryComponent.setDescription(salaryComponentPersistModel.getDescription());
                if (salaryComponentPersistModel.getCalculationType() != null) {
                    salaryComponent.setCalculationType(salaryComponentPersistModel.getCalculationType());
                }
                if (salaryComponentPersistModel.getComponentType() != null && !salaryComponentPersistModel.getComponentType().isEmpty()) {
                    salaryComponent.setComponentType(salaryComponentPersistModel.getComponentType());
                }
                if (salaryComponentPersistModel.getComponentCode() != null && !salaryComponentPersistModel.getComponentCode().isEmpty()) {
                    salaryComponent.setComponentCode(salaryComponentPersistModel.getComponentCode());
                }
                if (salaryComponentPersistModel.getInvoiceType() != null && !salaryComponentPersistModel.getInvoiceType().isEmpty()) {
                    Integer invoiceType=Integer.parseInt(salaryComponentPersistModel.getInvoiceType());
                    CustomizeInvoiceTemplate template = customizeInvoiceTemplateService.getInvoiceTemplate(invoiceType);
                    String suffix=invoiceNumberUtil.fetchSuffixFromString(salaryComponentPersistModel.getComponentCode());
                    template.setSuffix(Integer.parseInt(suffix));
                    String prefix= salaryComponent.getComponentCode().substring(0,salaryComponent.getComponentCode().lastIndexOf(suffix));
                    template.setPrefix(prefix);
                    customizeInvoiceTemplateService.persist(template);
                }
                salaryComponentService.persist(salaryComponent);
                EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
                if (salaryComponentPersistModel.getEmployeeId() != null) {
                    employeeSalaryComponentRelation.setEmployeeId(employeeService.findByPK(salaryComponentPersistModel.getEmployeeId()));
                    SalaryComponent salaryComponent1 = salaryComponentService.findByPK(salaryComponent.getId());
                    employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent1);
                    employeeSalaryComponentRelation.setSalaryStructure(salaryComponent1.getSalaryStructure());
                    employeeSalaryComponentRelation.setFormula(salaryComponent1.getFormula());
                    employeeSalaryComponentRelation.setDeleteFlag(false);
                    employeeSalaryComponentRelation.setFlatAmount(salaryComponent1.getFlatAmount());
                    employeeSalaryComponentRelation.setDescription(salaryComponent1.getDescription());
                    employeeSalaryComponentRelation.setMonthlyAmount(BigDecimal.ZERO);
                    employeeSalaryComponentRelation.setYearlyAmount(BigDecimal.ZERO);
                    employeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                    employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);
                    Map<String, Object> employmentParam = new HashMap<>();
                    employmentParam.put("employee", employeeSalaryComponentRelation.getEmployeeId());
                    List<Employment> employmentList = employmentService.findByAttributes(employmentParam);
                    if (employmentList != null && !employmentList.isEmpty()) {
                        Employment employment = employmentList.get(0);
                        if (salaryComponentPersistModel.getGrossSalary() != null) {
                            if (salaryComponentPersistModel.getGrossSalary() != null) {
                                employment.setGrossSalary(salaryComponentPersistModel.getGrossSalary());
                                employment.setCtcType(salaryComponentPersistModel.getCtcType());
                                employmentService.update(employment);
                            }
                        }
                    }
                }
            } else if (salaryComponentPersistModel.getEmployeeId()!=null) {
                EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
                employeeSalaryComponentRelation.setEmployeeId(employeeService.findByPK(salaryComponentPersistModel.getEmployeeId()));
                SalaryComponent salaryComponent1 = salaryComponentService.findByPK(salaryComponentPersistModel.getId());
                employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent1);
                employeeSalaryComponentRelation.setSalaryStructure(salaryComponent1.getSalaryStructure());
                employeeSalaryComponentRelation.setFormula(salaryComponent1.getFormula());
                employeeSalaryComponentRelation.setDeleteFlag(false);
                employeeSalaryComponentRelation.setFlatAmount(salaryComponent1.getFlatAmount());
                employeeSalaryComponentRelation.setDescription(salaryComponent1.getDescription());
                employeeSalaryComponentRelation.setMonthlyAmount(BigDecimal.ZERO);
                employeeSalaryComponentRelation.setYearlyAmount(BigDecimal.ZERO);
                employeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);
                Map<String, Object> employmentParam = new HashMap<>();
                employmentParam.put("employee", employeeSalaryComponentRelation.getEmployeeId());
                List<Employment> employmentList = employmentService.findByAttributes(employmentParam);
                if (employmentList != null && !employmentList.isEmpty()) {
                    Employment employment = employmentList.get(0);
                    if (salaryComponentPersistModel.getGrossSalary() != null) {
                        employment.setGrossSalary(salaryComponentPersistModel.getGrossSalary());
                        employment.setCtcType(salaryComponentPersistModel.getCtcType());
                        employmentService.update(employment);
                    }
                }
            }

            }

        }


    public void updateAllSalaryComponent(SalaryComponentPersistModel salaryComponentPersistModel, List<SalaryComponentPersistModel> salaryComponentPersistModels) {

        if (salaryComponentPersistModel.getSalaryComponentString() != null && !salaryComponentPersistModel.getSalaryComponentString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                salaryComponentPersistModels = mapper.readValue(salaryComponentPersistModel.getSalaryComponentString(),
                        new TypeReference<List<SalaryComponentPersistModel>>() {
                        });
            } catch (IOException ex) {
                logger.error("Error", ex);
            }
            if (!salaryComponentPersistModels.isEmpty()) {
                getUpdatedSalaryComponents(salaryComponentPersistModels, salaryComponentPersistModel);
            }
        }
            else {
            getUpdatedSalaryComponents(salaryComponentPersistModels, salaryComponentPersistModel);

            }

    }

    @Transactional(rollbackFor = Exception.class)
    void getUpdatedSalaryComponents(List<SalaryComponentPersistModel> salaryComponentPersistModels, SalaryComponentPersistModel salaryComponentPersistModel) {

        if (salaryComponentPersistModel.getEmployeeId() != null) {
            Map<String, Object> param = new HashMap<>();
            param.put("employeeId", salaryComponentPersistModel.getEmployeeId());
            List<EmployeeSalaryComponentRelation> list = employeeSalaryComponentRelationService.findByAttributes(param);
            if (list != null) {
                for (EmployeeSalaryComponentRelation relation : list) {
                    employeeSalaryComponentRelationService.delete(relation);
                }
            }
        }
        if(salaryComponentPersistModel.getId()!= null) {
            SalaryComponent salaryComponent = salaryComponentService.findByPK(salaryComponentPersistModel.getId());
            salaryComponent.setSalaryStructure(salaryStructureService.findByPK(Integer.valueOf(salaryComponentPersistModel.getSalaryStructure())));
            salaryComponent.setFormula(salaryComponentPersistModel.getFormula());
            salaryComponent.setDeleteFlag(false);
            salaryComponent.setFlatAmount(salaryComponentPersistModel.getFlatAmount());
            salaryComponent.setDescription(salaryComponentPersistModel.getDescription());
            if (salaryComponentPersistModel.getCalculationType() != null) {
                salaryComponent.setCalculationType(salaryComponentPersistModel.getCalculationType());
            }
            if (salaryComponentPersistModel.getComponentType() != null && !salaryComponentPersistModel.getComponentType().isEmpty()) {
                salaryComponent.setComponentType(salaryComponentPersistModel.getComponentType());
            }
            if(salaryComponentPersistModel.getComponentCode()!=null && !salaryComponentPersistModel.getComponentCode().isEmpty()) {
                salaryComponent.setComponentCode(salaryComponentPersistModel.getComponentCode());
            }
            salaryComponentService.persist(salaryComponent);
        }
        List<SalaryComponent> salaryComponentList = new ArrayList<>();
        for (SalaryComponentPersistModel model : salaryComponentPersistModels) {

            try {
                if (model.getId() == null) {
                    SalaryComponent salaryComponent = new SalaryComponent();
                    salaryComponent.setSalaryStructure(salaryStructureService.findByPK(Integer.valueOf(model.getSalaryStructure())));
                    salaryComponent.setFormula(model.getFormula());
                    salaryComponent.setDeleteFlag(false);
                    salaryComponent.setFlatAmount(model.getFlatAmount());
                    salaryComponent.setDescription(model.getDescription());
                    if(model.getCalculationType()!=null) {
                        salaryComponent.setCalculationType(model.getCalculationType());
                    }
                    if(model.getComponentType()!=null && !model.getComponentType().isEmpty()) {
                        salaryComponent.setComponentType(model.getComponentType());
                    }
                    salaryComponentList.add(salaryComponent);
                    salaryComponentService.persist(salaryComponent);
                    EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
                    if(model.getEmployeeId()!=null) {
                        employeeSalaryComponentRelation.setEmployeeId(employeeService.findByPK(model.getEmployeeId()));
                        employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent);
                        employeeSalaryComponentRelation.setSalaryStructure(salaryStructureService.findByPK(Integer.valueOf(model.getSalaryStructure())));
                        employeeSalaryComponentRelation.setFormula(model.getFormula());
                        employeeSalaryComponentRelation.setDeleteFlag(false);
                        employeeSalaryComponentRelation.setFlatAmount(model.getFlatAmount());
                        employeeSalaryComponentRelation.setDescription(model.getDescription());
                        employeeSalaryComponentRelation.setMonthlyAmount(model.getMonthlyAmount());
                        employeeSalaryComponentRelation.setYearlyAmount(model.getYearlyAmount());
                        employeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                        employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);
                        salaryComponentList.add(salaryComponent);
                        Map<String, Object> employmentParam = new HashMap<>();
                        employmentParam.put("employee", employeeSalaryComponentRelation.getEmployeeId());
                        List<Employment> employmentList = employmentService.findByAttributes(employmentParam);
                        if (employmentList != null && !employmentList.isEmpty()) {
                            Employment employment = employmentList.get(0);
                            employment.setGrossSalary(salaryComponentPersistModel.getGrossSalary());
                            employment.setCtcType(salaryComponentPersistModel.getCtcType());
                            employmentService.update(employment);
                        }
                    }
                } else if(model.getEmployeeId()!=null) {
                    EmployeeSalaryComponentRelation employeeSalaryComponentRelation = new EmployeeSalaryComponentRelation();
                    employeeSalaryComponentRelation.setEmployeeId(employeeService.findByPK(model.getEmployeeId()));
                    SalaryComponent salaryComponent1 = salaryComponentService.findByPK(model.getSalaryComponentId());
                    employeeSalaryComponentRelation.setSalaryComponentId(salaryComponent1);
                    employeeSalaryComponentRelation.setSalaryStructure(salaryComponent1.getSalaryStructure());
                    employeeSalaryComponentRelation.setFormula(model.getFormula());
                    employeeSalaryComponentRelation.setDeleteFlag(false);
                    employeeSalaryComponentRelation.setFlatAmount(model.getFlatAmount());
                    employeeSalaryComponentRelation.setDescription(salaryComponent1.getDescription());
                    employeeSalaryComponentRelation.setMonthlyAmount(model.getMonthlyAmount());
                    employeeSalaryComponentRelation.setYearlyAmount(model.getYearlyAmount());
                    employeeSalaryComponentRelation.setNoOfDays(BigDecimal.valueOf(30));
                    employeeSalaryComponentRelationService.persist(employeeSalaryComponentRelation);
                    Map<String, Object> employmentParam = new HashMap<>();
                    employmentParam.put("employee", employeeSalaryComponentRelation.getEmployeeId());
                    List<Employment> employmentList = employmentService.findByAttributes(employmentParam);
                    if (employmentList != null && !employmentList.isEmpty()) {
                        Employment employment = employmentList.get(0);
                        if (salaryComponentPersistModel.getGrossSalary() != null) {
                            employment.setGrossSalary(salaryComponentPersistModel.getGrossSalary());
                            employment.setCtcType(salaryComponentPersistModel.getCtcType());
                            employmentService.update(employment);
                        }
                    }

                }
            } catch (Exception e) {
                logger.error("Error", e);
            }


        }


    }

    public PaginationResponseModel getSalaryComponentListModel(PaginationResponseModel paginationResponseModel) {

        List<SalaryComponentListModel> modelList = new ArrayList<>();

        if (paginationResponseModel != null && paginationResponseModel.getData() != null) {
            List<SalaryComponent> salaryComponentList = (List<SalaryComponent>) paginationResponseModel.getData();
            for (SalaryComponent salaryComponent : salaryComponentList) {
                SalaryComponentListModel model = new SalaryComponentListModel();
                model.setId(salaryComponent.getId());
                model.setFormula(salaryComponent.getFormula());
                model.setDescription(salaryComponent.getDescription());
                model.setFlatAmount(salaryComponent.getFlatAmount());
                model.setSalaryStructure(salaryComponent.getSalaryStructure().getName());
                modelList.add(model);
            }
            paginationResponseModel.setData(modelList);
        }
        return paginationResponseModel;

    }

    public DefaultEmployeeSalaryComponentRelationModel getSalaryComponentByEmployeeId(Integer id) {

        DefaultEmployeeSalaryComponentRelationModel employeeSalaryComponentRelationModel = new DefaultEmployeeSalaryComponentRelationModel();
        Map<String, List<EmployeeSalaryComponentRelationModel>> salaryComponentMap = new LinkedHashMap<>();
        Map<String, Object> employmentParam = new HashMap<>();
        employmentParam.put("employee", id);
        List<Employment> employmentList = employmentService.findByAttributes(employmentParam);
        if (employmentList != null && !employmentList.isEmpty()) {
            Employment employment = employmentList.get(0);
            employeeSalaryComponentRelationModel.setCtc(employment.getGrossSalary());
        }
        List<EmployeeSalaryComponentRelation> employeeSalaryComponentRelationList = employeeSalaryComponentRelationDao.getDefaultSalaryComponentByEmployeeId(id);


        if (employeeSalaryComponentRelationList != null && !employeeSalaryComponentRelationList.isEmpty()) {

            for (EmployeeSalaryComponentRelation object : employeeSalaryComponentRelationList) {

                //  Object[] objectArray = (Object[])object;

                String salaryStructure = object.getSalaryStructure().getName();
                salaryStructure = salaryStructure.replace(' ', '_');
                List<EmployeeSalaryComponentRelationModel> salaryTemplateList1 = salaryComponentMap.get(salaryStructure);
                if (salaryTemplateList1 == null) {
                    salaryTemplateList1 = new ArrayList<>();
                    salaryComponentMap.put(salaryStructure, salaryTemplateList1);

                }
                // List salaryTemplateList1 = new ArrayList<>();
                EmployeeSalaryComponentRelationModel salaryComponentRelationModel = new EmployeeSalaryComponentRelationModel();
                salaryComponentRelationModel.setDescription(object.getDescription());
                if (object.getFormula() != null) {
                    salaryComponentRelationModel.setFormula(object.getFormula());
                }
                if (object.getFlatAmount() != null) {
                    salaryComponentRelationModel.setFlatAmount(object.getFlatAmount());
                }


                salaryComponentRelationModel.setSalaryStructure(object.getSalaryComponentId().getSalaryStructure().getId());
                salaryComponentRelationModel.setEmployeeId(object.getEmployeeId().getId());
                salaryComponentRelationModel.setSalaryComponentId(object.getSalaryComponentId().getId());
                salaryComponentRelationModel.setId(object.getId());
                salaryComponentRelationModel.setMonthlyAmount(object.getMonthlyAmount());
                salaryComponentRelationModel.setYearlyAmount(object.getYearlyAmount());
                salaryTemplateList1.add(salaryComponentRelationModel);

                //  salaryComponentMap.put(SalaryStructure,salaryTemplateList1);

            }
        }


        employeeSalaryComponentRelationModel.setSalaryComponentResult(salaryComponentMap);
        return employeeSalaryComponentRelationModel;
    }

    public SalaryDeatilByEmployeeIdNoOfDaysResponseModel getSalaryDeatilByEmployeeIdNoOfDays(Integer id) {

        SalaryDeatilByEmployeeIdNoOfDaysResponseModel salaryDeatilByEmployeeIdNoOfDaysResponseModel = new SalaryDeatilByEmployeeIdNoOfDaysResponseModel();
        Map<String, List<SalaryDeatilByEmployeeIdNoOfDaysModel>> salaryComponentMap = new LinkedHashMap<>();
        BigDecimal netPay = BigDecimal.ZERO;

        List<EmployeeSalaryComponentRelation> employeeSalaryComponentRelationList = employeeSalaryComponentRelationDao.getDefaultSalaryComponentByEmployeeId(id);

        if (employeeSalaryComponentRelationList != null && !employeeSalaryComponentRelationList.isEmpty()) {

            for (EmployeeSalaryComponentRelation employeeSalaryComponentRelation : employeeSalaryComponentRelationList) {

                BigDecimal totalSalaryPerMonth = employeeSalaryComponentRelation.getMonthlyAmount();
                BigDecimal salaryPerDay = totalSalaryPerMonth.divide(employeeSalaryComponentRelation.getNoOfDays());
                BigDecimal salaryForThisComponentAsPerNoOfWorkingDays = salaryPerDay.multiply(employeeSalaryComponentRelation.getNoOfDays());


                switch (PayrollEnumConstants.get(employeeSalaryComponentRelation.getSalaryStructure().getId())) {
                    case Fixed:
                    case Variable:
                    case Fixed_Allowance:
                        List<SalaryDeatilByEmployeeIdNoOfDaysModel> modelEarningList = salaryComponentMap.get("Earnings");
                        if (modelEarningList == null) {
                            modelEarningList = new ArrayList<>();
                            salaryComponentMap.put("Earnings", modelEarningList);
                        }
                        SalaryDeatilByEmployeeIdNoOfDaysModel salaryComponentRelationModel = new SalaryDeatilByEmployeeIdNoOfDaysModel();
                        salaryComponentRelationModel.setName(employeeSalaryComponentRelation.getDescription());
                        salaryComponentRelationModel.setValue(salaryForThisComponentAsPerNoOfWorkingDays);
                        netPay = netPay.add(salaryForThisComponentAsPerNoOfWorkingDays);
                        modelEarningList.add(salaryComponentRelationModel);
                        break;
                    case Deduction:
                        List<SalaryDeatilByEmployeeIdNoOfDaysModel> modelList = salaryComponentMap.get("Deductions");
                        if (modelList == null) {
                            modelList = new ArrayList<>();
                            salaryComponentMap.put("Deductions", modelList);
                        }
                        salaryComponentRelationModel = new SalaryDeatilByEmployeeIdNoOfDaysModel();
                        salaryComponentRelationModel.setName(employeeSalaryComponentRelation.getDescription());
                        salaryComponentRelationModel.setValue(salaryForThisComponentAsPerNoOfWorkingDays);
                        netPay = netPay.add(salaryForThisComponentAsPerNoOfWorkingDays);
                        modelList.add(salaryComponentRelationModel);
                        break;
                }

            }
        }

        salaryDeatilByEmployeeIdNoOfDaysResponseModel.setSalaryDetailAsNoOfDaysMap(salaryComponentMap);
        salaryDeatilByEmployeeIdNoOfDaysResponseModel.setEmployeeName(employeeService.findByPK(id).getFirstName() + " " + employeeService.findByPK(id).getLastName());
        salaryDeatilByEmployeeIdNoOfDaysResponseModel.setNetPay(netPay);
        salaryDeatilByEmployeeIdNoOfDaysResponseModel.setNoOfDays(employeeSalaryComponentRelationList.get(0).getNoOfDays());
        return salaryDeatilByEmployeeIdNoOfDaysResponseModel;
    }

    public void updateSalaryComponentAsNoOfDays(Integer id, BigDecimal noOfDays) {

        Map<String, Object> Param = new HashMap<>();
        Param.put("employeeId", id);
        List<EmployeeSalaryComponentRelation> employmentList = employeeSalaryComponentRelationService.findByAttributes(Param);

        for (EmployeeSalaryComponentRelation eSC : employmentList) {

            BigDecimal totalSalaryPerMonth = eSC.getMonthlyAmount();
            BigDecimal changeInSalaryPerDay = totalSalaryPerMonth.divide(eSC.getNoOfDays());
            BigDecimal salaryForThisComponentAsPerNoOfWorkingDays = changeInSalaryPerDay.multiply(noOfDays) ;

            EmployeeSalaryComponentRelation employeeSalaryComponentRelation1 = employeeSalaryComponentRelationService.findByPK(eSC.getId());
            employeeSalaryComponentRelation1.setNoOfDays(noOfDays);
            employeeSalaryComponentRelation1.setMonthlyAmount(salaryForThisComponentAsPerNoOfWorkingDays);
            employeeSalaryComponentRelation1.setYearlyAmount(salaryForThisComponentAsPerNoOfWorkingDays.multiply(BigDecimal.valueOf(12)));
            employeeSalaryComponentRelationService.update(employeeSalaryComponentRelation1);

        }
    }

    public void deleteSalaryComponentRow(Integer employeeId, Integer componentId) {


        employeeSalaryComponentRelationService.delete(employeeSalaryComponentRelationService.findByPK(componentId));

    }

    public SalaryComponentPersistModel getSalaryComponentModel(SalaryComponent salaryComponent) {
        SalaryComponentPersistModel salaryComponentPersistModel = new SalaryComponentPersistModel();
//      employeeBankDetails = employeeBankDetailsService.findByPK(employeeBankDetailsPersistModel.getId());

        salaryComponentPersistModel.setId(salaryComponent.getId());
        salaryComponentPersistModel.setDescription(salaryComponent.getDescription());

        if (salaryComponent.getFlatAmount() != null) {
            salaryComponentPersistModel.setFlatAmount(salaryComponent.getFlatAmount());
            salaryComponentPersistModel.setType(1);
        }

        if (salaryComponent.getFormula() != null) {
            salaryComponentPersistModel.setFormula(salaryComponent.getFormula());
            salaryComponentPersistModel.setType(2);
        }
        if(salaryComponent.getSalaryStructure() !=null){
            salaryComponentPersistModel.setSalaryStructure(salaryComponent.getSalaryStructure().getName());
        }
        if(salaryComponent.getComponentType() !=null && !salaryComponent.getComponentType().isEmpty()){
            salaryComponentPersistModel.setComponentType(salaryComponent.getComponentType());
        }
        if(salaryComponent.getCalculationType() !=null){
            salaryComponentPersistModel.setCalculationType(salaryComponent.getCalculationType());
        }
        if(salaryComponent.getComponentCode() !=null && !salaryComponent.getComponentCode().isEmpty()){
            salaryComponentPersistModel.setComponentCode(salaryComponent.getComponentCode());
        }
        List<EmployeeSalaryComponentRelation> employeeSalaryComponentRelationList =
                employeeSalaryComponentRelationRepository.findBySalaryComponentIdAndDeleteFlag(salaryComponent.getId());
        if(employeeSalaryComponentRelationList.size() > 0){
            salaryComponentPersistModel.setIsComponentDeletable(Boolean.FALSE);
        }
        else{
            salaryComponentPersistModel.setIsComponentDeletable(Boolean.TRUE);
        }


        return salaryComponentPersistModel;
    }

    /**
     * @return Payroll List
     */
    public List<Payroll> getPayrollList() {

        return payrollRepository.findAll();
    }

    /**
     * @return Payroll List
     */
    public List<Payroll> findAllByPayrollDate(LocalDateTime startDate,LocalDateTime endDate) {

        return payrollRepository.findAllByPayrollDate( startDate, endDate);
    }

    public Payroll getPayroll(Integer id) {

        return payrollRepository.findById(id);
    }


    public void  generatePayroll(PayrolRequestModel payrolRequestModel, List<GeneratePayrollPersistModel> generatePayrollPersistModels, User user,Payroll payroll) {

        if (payrolRequestModel.getGeneratePayrollString() != null && !payrolRequestModel.getGeneratePayrollString().isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                generatePayrollPersistModels = mapper.readValue(payrolRequestModel.getGeneratePayrollString(),
                        new TypeReference<List<GeneratePayrollPersistModel>>() {
                        });
            } catch (IOException ex) {
                logger.error("Error", ex);
            }
            genereateSalary(generatePayrollPersistModels, payrolRequestModel,user,payroll);
        }
    }


    @Transactional(rollbackFor = Exception.class)
    void genereateSalary(List<GeneratePayrollPersistModel> generatePayrollPersistModels, PayrolRequestModel payrolRequestModel, User user,Payroll payroll) {


            Integer empCount=null;
            Map<String, Object> paramSalary = new HashMap<>();
            paramSalary.put("payrollId",payroll.getId());
            List<Salary> list = salaryService.findByAttributes(paramSalary);
            if (list != null) {
                for (Salary salary : list) {
                    salaryService.delete(salary);
                }
            }

            BigDecimal totalPayrollAmount = BigDecimal.ZERO;

        for (GeneratePayrollPersistModel model:generatePayrollPersistModels) {

            BigDecimal totalSalaryForSingleDay = BigDecimal.ZERO;
                BigDecimal totalSalary = BigDecimal.ZERO;
                Employee employee = employeeService.findByPK(model.getEmpId());
                BigDecimal totSalaryForEmployeePerMonth = BigDecimal.ZERO;
                Map<String, Object> param = new HashMap<>();
                param.put("employeeId", employee);
                List<EmployeeSalaryComponentRelation> employeeSalaryComponentList = employeeSalaryComponentRelationService.findByAttributes(param);


                for (EmployeeSalaryComponentRelation salaryComponent : employeeSalaryComponentList) {

                    BigDecimal totalSalaryPerMonth = salaryComponent.getMonthlyAmount();
                    BigDecimal noOfDays = salaryComponent.getNoOfDays();
                    totalSalaryForSingleDay = totalSalaryPerMonth.divide(noOfDays, MathContext.DECIMAL128)  ;
                    BigDecimal salaryAsPerNoOfWorkingDays = totalSalaryForSingleDay.multiply(model.getNoOfDays()) ;

                    Salary salary = new Salary();
                    salary.setCreatedBy(user.getUserId());
                    salary.setCreatedDate(LocalDateTime.now());
                    salary.setEmployeeId(employee);
                    salary.setSalaryComponent(salaryComponent.getSalaryComponentId());
                    salary.setType(0);
                    salary.setNoOfDays(model.getNoOfDays());
                    salary.setLopDays(model.getLopDay());
                    salary.setPayrollId(payrollRepository.findById(payroll.getId()));
                    //salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(payrolRequestModel.getSalaryDate(), "dd/MM/yyyy"));
//                    salary.setSalaryDate(dateConvertIntoLocalDataTime(payrolRequestModel.getSalaryDate()).with(LocalTime.MIN));
                    if (payrolRequestModel.getSalaryDate() != null) {
                        Instant instant = Instant.ofEpochMilli(payrolRequestModel.getSalaryDate().getTime());
                        LocalDateTime salaryDate = LocalDateTime.ofInstant(instant,
                                ZoneId.systemDefault());
                        salary.setSalaryDate(salaryDate);}
                    salary.setTotalAmount(salaryAsPerNoOfWorkingDays);
                    salaryService.persist(salary);
                    if (salaryComponent.getSalaryStructure().getId()!=PayrollEnumConstants.Deduction.getId()){
                          totalSalary = totalSalary.add(salaryAsPerNoOfWorkingDays);
                    }

                }
                Salary salary = new Salary();
                salary.setCreatedBy(user.getUserId());
                salary.setCreatedDate(LocalDateTime.now());
                salary.setEmployeeId(employee);
                salary.setNoOfDays(model.getNoOfDays());
                salary.setLopDays(model.getLopDay());
                salary.setType(1);
                salary.setPayrollId(payrollRepository.findById(payroll.getId()));
               // salary.setSalaryDate(dateFormatUtil.getDateStrAsLocalDateTime(payrolRequestModel.getSalaryDate(), "dd/MM/yyyy"));
//                salary.setSalaryDate(dateConvertIntoLocalDataTime(payrolRequestModel.getSalaryDate()).with(LocalTime.MIN));
            if (payrolRequestModel.getSalaryDate() != null) {
                Instant instant = Instant.ofEpochMilli(payrolRequestModel.getSalaryDate().getTime());
                LocalDateTime salaryDate = LocalDateTime.ofInstant(instant,
                        ZoneId.systemDefault());
                salary.setSalaryDate(salaryDate);}
                salary.setTotalAmount(totalSalary);
                salaryService.persist(salary);
            totalPayrollAmount = totalPayrollAmount.add(totalSalary);
        }
//            empCount=generatePayrollPersistModels.size();
            empCount= payrolRequestModel.getEmployeeListIds().size();
            payroll.setStatus("Draft");
            payroll.setEmployeeCount(empCount);
//            payroll.setTotalAmountPayroll(totalPayrollAmount);
//            payroll.setDueAmountPayroll(totalPayrollAmount);
            payrollRepository.save(payroll);

    }

    public void updatePayrollStatus(Integer payrollId, Integer approverId, HttpServletRequest request){

    Payroll payroll = payrollRepository.findById(payrollId);
    payroll.setStatus("Submitted");
    payroll.setPayrollApprover(approverId);
    payrollRepository.save(payroll);
//    if(payroll.getGeneratedBy().equals(payroll.getPayrollApprover())==false)
        sendApprovalMail(payroll,approverId,request);


    }
    public boolean sendApprovalMail(Payroll payroll,Integer approverId,HttpServletRequest request) {
        User user=userService.findByPK(approverId);
        String image="";
        if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
            image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo()) ;

        }
        String htmlContent="";
        try {
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+PAYROLL_APPROVAL_MAIL).getURI()));
            htmlContent= new String(contentData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Error processing payroll", e);
        }
        User generatedByUser = userService.findByPK(Integer.parseInt(payroll.getGeneratedBy()));
        String generatedByName =  generatedByUser.getFirstName().toString() +" " +generatedByUser.getLastName().toString();
        String temp1=htmlContent.replace("{generaterName}", generatedByName)
                .replace("{approverName}", user.getFirstName()+" "+user.getLastName())
                .replace("{payrollSubject}", payroll.getPayrollSubject())
                .replace("{payPeriod}", payroll.getPayPeriod().replace("-","  To  ").replace("/","-"))
                .replace("{companylogo}",image);
        try {
            emailSender.send(user.getUserEmail(), "Payroll Approval Request",temp1,EmailConstant.ADMIN_SUPPORT_EMAIL,
                    EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
            EmailLogs emailLogs = new EmailLogs();
            emailLogs.setEmailDate(LocalDateTime.now());
            emailLogs.setEmailTo(user.getUserEmail());
            emailLogs.setEmailFrom( EmailConstant.ADMIN_SUPPORT_EMAIL);
            emailLogs.setModuleName("PAYROLL");
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            System.out.println(baseUrl);
            emailLogs.setBaseUrl(baseUrl);
            emaiLogsService.persist(emailLogs);
            logger.info("Approval mail sent successfully....!");
            logger.info("Email send to =" +emailLogs );
        } catch (MessagingException e) {
            logger.error("Error", e);

            return false;
        }
        return true;
    }
    @Transactional(rollbackFor = Exception.class)
    public void generatePayroll(User user, Integer payrollId,String startDate,String endDate,HttpServletRequest request,List<Integer> payrollEmployeesIdsListToSendMail) {


        Map<String, Object> paramSalary = new HashMap<>();
        paramSalary.put("payrollId", payrollId);
        List<Salary> salaryList = salaryService.findByAttributes(paramSalary);
        BigDecimal totalSalary =null;
        Payroll payroll = payrollRepository.findById(payrollId);
        if (salaryList != null && !salaryList.isEmpty()) {
            for (Salary salary : salaryList) {
                Employee employee = salary.getEmployeeId();
                if (salary.getType() == 1){
                    totalSalary=salary.getTotalAmount();
                    Map<String, Object> CategoryParam = new HashMap<>();
                CategoryParam.put("transactionCategoryName", "Payroll Liability");
                List<TransactionCategory> payrollTransactionCategoryList = transactionCategoryService.findByAttributes(CategoryParam);

                if (payrollTransactionCategoryList != null && !payrollTransactionCategoryList.isEmpty()) {

                    List<JournalLineItem> journalLineItemList = new ArrayList<>();
                    Journal journal = new Journal();
                    JournalLineItem journalLineItem1 = new JournalLineItem();
                    journalLineItem1.setTransactionCategory(payrollTransactionCategoryList.get(0));
                    journalLineItem1.setCreditAmount(totalSalary);
                    journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                    journalLineItem1.setCreatedBy(user.getUserId());
                    journalLineItem1.setJournal(journal);
                    journalLineItem1.setReferenceId(payrollId);
                    journalLineItemList.add(journalLineItem1);
                    Map<String, Object> employeeCategoryParam = new HashMap<>();
                    employeeCategoryParam.put("employee", employee.getId());
                    List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryList = employeeTransactioncategoryService.findByAttributes(employeeCategoryParam);
                    TransactionCategory transactionCategoryForSalaryWages = employeeTransactionCategoryList.get(1).getTransactionCategory();
                    JournalLineItem journalLineItem2 = new JournalLineItem();
                    journalLineItem2.setTransactionCategory(transactionCategoryForSalaryWages);
                    journalLineItem2.setDebitAmount(totalSalary);
                    journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                    journalLineItem2.setCreatedBy(user.getUserId());
                    journalLineItem2.setJournal(journal);
                    journalLineItem2.setReferenceId(payrollId);
                    journalLineItemList.add(journalLineItem2);
                    journal.setJournalLineItems(journalLineItemList);
                    journal.setCreatedBy(user.getUserId());
                    journal.setPostingReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                    journal.setJournalDate(payroll.getPayrollDate().toLocalDate());
                    journal.setTransactionDate(LocalDateTime.now().toLocalDate());
                    if (payroll.getPayrollSubject()!=null){
                        journal.setDescription(payroll.getPayrollSubject());
                    }
                    journalService.persist(journal);
                    payroll.setStatus("Approved");
                    payroll.setPayrollApprover(user.getUserId());
                    payroll.setRunDate(LocalDateTime.now());
                    payrollRepository.save(payroll);

                } else {
                    TransactionCategory finalPayrolltransactionCategory = new TransactionCategory();
                    finalPayrolltransactionCategory.setChartOfAccount(chartOfAccountService.findByPK(13));
                    finalPayrolltransactionCategory.setSelectableFlag(Boolean.FALSE);
                    finalPayrolltransactionCategory.setTransactionCategoryCode("02-02-016");
                    finalPayrolltransactionCategory.setTransactionCategoryName("Payroll Liability");
                    finalPayrolltransactionCategory.setTransactionCategoryDescription("Other Liability");
                    //ParentTransactionCategory null
                    finalPayrolltransactionCategory.setCreatedDate(LocalDateTime.now());
                    finalPayrolltransactionCategory.setCreatedBy(user.getUserId());
                    finalPayrolltransactionCategory.setEditableFlag(false);
                    finalPayrolltransactionCategory.setSelectableFlag(true);
                    finalPayrolltransactionCategory.setDefaltFlag(DefaultTypeConstant.NO);
                    finalPayrolltransactionCategory.setVersionNumber(1);
                    transactionCategoryService.persist(finalPayrolltransactionCategory);
                    CoacTransactionCategory coacTransactionCategoryRelation = new CoacTransactionCategory();
                    coacTransactionCategoryService.addCoacTransactionCategory(finalPayrolltransactionCategory.getChartOfAccount(), finalPayrolltransactionCategory);

                    Map<String, Object> payrollCategoryParam = new HashMap<>();
                    payrollCategoryParam.put("transactionCategoryName", "Payroll Liability");
                    List<TransactionCategory> payrollList = transactionCategoryService.findByAttributes(payrollCategoryParam);

                    List<JournalLineItem> journalLineItemList = new ArrayList<>();
                    Journal journal = new Journal();
                    JournalLineItem journalLineItem1 = new JournalLineItem();
                    journalLineItem1.setTransactionCategory(payrollList.get(0));
                    journalLineItem1.setCreditAmount(totalSalary);
                    journalLineItem1.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                    journalLineItem1.setCreatedBy(user.getUserId());
                    journalLineItem1.setJournal(journal);
                    journalLineItem1.setReferenceId(payrollId);
                    journalLineItemList.add(journalLineItem1);
                    Map<String, Object> employeeCategoryParam = new HashMap<>();
                    employeeCategoryParam.put("employee", employee.getId());
                    List<EmployeeTransactionCategoryRelation> employeeTransactionCategoryList = employeeTransactioncategoryService.findByAttributes(employeeCategoryParam);
                    TransactionCategory transactionCategoryForSalaryWages = employeeTransactionCategoryList.get(1).getTransactionCategory();
                    JournalLineItem journalLineItem2 = new JournalLineItem();
                    journalLineItem2.setTransactionCategory(transactionCategoryForSalaryWages);
                    journalLineItem2.setDebitAmount(totalSalary);
                    journalLineItem2.setReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                    journalLineItem2.setCreatedBy(user.getUserId());
                    journalLineItem2.setJournal(journal);
                    journalLineItem2.setReferenceId(payrollId);
                    journalLineItemList.add(journalLineItem2);
                    journal.setJournalLineItems(journalLineItemList);
                    journal.setCreatedBy(user.getUserId());
                    journal.setPostingReferenceType(PostingReferenceTypeEnum.PAYROLL_APPROVED);
                    journal.setJournalDate(payroll.getPayrollDate().toLocalDate());
                    journal.setTransactionDate(LocalDateTime.now().toLocalDate());
                    if (payroll.getPayrollSubject()!=null){
                        journal.setDescription(payroll.getPayrollSubject());
                    }
                    journalService.persist(journal);
                    payroll.setStatus("Approved");
                    payroll.setPayrollApprover(user.getUserId());
                    payroll.setRunDate(LocalDateTime.now());
                    payrollRepository.save(payroll);

                }

                    /**
                     * On Payroll Approval Payslip will be sent to employee email
                     */
              }
            }
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        for(Integer employeeId :payrollEmployeesIdsListToSendMail) {
            salaryController.getSalariesByEmployeeId(employeeId, payroll.getPayrollDate().format(formatter).replace("-", "/"), startDate, endDate, true, request);
        }
    }

    public void rejectPayroll(User user, Integer payrollId,String comment,HttpServletRequest request) {

        Payroll payroll = payrollRepository.findById(payrollId);
        payroll.setStatus("Rejected");
        payroll.setComment(comment);
    sendRejectMail(payroll, Integer.valueOf(payroll.getGeneratedBy()),comment,request);
        payrollRepository.save(payroll);

    }
    public boolean sendRejectMail( Payroll payroll,Integer generatorId,String comment,HttpServletRequest request) {
        User user=userService.findByPK(generatorId);
        String image="";
        if (user.getCompany() != null  && user.getCompany().getCompanyLogo() != null) {
            image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo()) ;

        }
        String htmlContent="";
        String generatedBy = "";
        if(payroll.getGeneratedBy()!=null){
         User user1 =  userService.findByPK(Integer.valueOf(payroll.getGeneratedBy()));
         if(user1!=null){
             generatedBy = user1.getFirstName() +" "+ user1.getLastName();
         }

        }
        try {
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:"+REJECT_MAIL_TEMPLATE).getURI()));
            htmlContent= new String(contentData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Error processing payroll", e);
        }
        String temp1=htmlContent
                .replace("{generaterName}", user.getFirstName()+" "+user.getLastName())
                .replace("{payrollSubject}", payroll.getPayrollSubject())
                .replace("{Startdate}", payroll.getPayPeriod().replace("-","  To  ").replace("/","-"))
                .replace("{companylogo}",image )
                .replace("{PayrollGenerator}",generatedBy )
                .replace("{Auto-populate the reasons}",comment);

        try {
            emailSender.send(user.getUserEmail(), "Payroll Rejection Request",temp1,EmailConstant.ADMIN_SUPPORT_EMAIL,
                    EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
            EmailLogs emailLogs = new EmailLogs();
            emailLogs.setEmailDate(LocalDateTime.now());
            emailLogs.setEmailTo(user.getUserEmail());
            emailLogs.setEmailFrom( EmailConstant.ADMIN_SUPPORT_EMAIL);
            emailLogs.setModuleName("PAYROLL");
            String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                    .replacePath(null)
                    .build()
                    .toUriString();
            System.out.println(baseUrl);
            emailLogs.setBaseUrl(baseUrl);
            emaiLogsService.persist(emailLogs);
            logger.info("Reject Payroll mail sent successfully....!");
            logger.info("Email send to =" +emailLogs );
        } catch (MessagingException e) {
            logger.error("Error", e);

            return false;
        }
        return true;
    }


//    public Object getUserAndRole(User user) {
//        UserAndRoleResponseModel userAndRoleResponseModel = new UserAndRoleResponseModel();
//        userAndRoleResponseModel.setUserId(user.getUserId());
//
//        return userAndRoleResponseModel;
//    }


    /**
     * To Convert Input date into LocalDate Format.
     * @param strDateTime
     * @return
     */
    public LocalDateTime dateConvertIntoLocalDataTime(String strDateTime) {
//    	String time = "00:00:00";
    	DateTimeFormatter dtfInput = new DateTimeFormatterBuilder()
                .parseCaseInsensitive()
                .appendPattern("E MMM d uuuu H:m:s")
                .appendLiteral(" ")
                .appendZoneId()
                .appendPattern("X")
                .appendLiteral(" ")
                .appendLiteral("(")
                .appendZoneText(TextStyle.FULL)
                .appendLiteral(')')
                .toFormatter(Locale.ENGLISH);

    			ZonedDateTime zdt = ZonedDateTime.parse(strDateTime, dtfInput);
    			OffsetDateTime odt = zdt.toOffsetDateTime();

    			 // To LocalDate.
    	        LocalDate localDate = odt.toLocalDate();
    	        System.out.println(localDate);
    	        LocalTime time=odt.toLocalTime();
    	        String outputDate = localDate+" "+time;

				DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
				LocalDateTime datetime = LocalDateTime.parse(outputDate,dtf);


    	      return datetime;

    }

    public List<PayrollDropdownModel> getUnpaidPayrollList(List<Payroll> payrollList) {

        List<SingleLevelDropDownModel> response  = new ArrayList<>();
        String parentCategory = "";
        List<PayrollDropdownModel> dropDownModelList = new ArrayList<>();
        if(payrollList !=null && payrollList.size()!=0) {
            for (Payroll payroll : payrollList) {
                if(payroll !=null && payroll.getStatus() !=null && payroll.getDueAmountPayroll()!=null)
                {
//                    parentCategory = payroll.getPayrollSubject();
                    if ((payroll.getStatus().equalsIgnoreCase("Approved")  ||
                         payroll.getStatus().equalsIgnoreCase("Partially Paid"))
                            &&
                         !payroll.getDueAmountPayroll().equals(BigDecimal.ZERO)
                    )
                        dropDownModelList.add(
                                new PayrollDropdownModel((int) payroll.getId(), payroll.getPayrollSubject() + " : ( " + payroll.getDueAmountPayroll() + " ) ",    payroll.getRunDate() + "  "));
                }
            }
        }
        return dropDownModelList;

    }

    public void convertPayrollToPaid(List<Integer> payEmpListIds, User user) {

        for(Integer payrollId:payEmpListIds) {

            Payroll payroll = payrollRepository.findById(payrollId);
            payroll.setStatus("Paid");
            payrollRepository.save(payroll);

        }
    }

    public String dateFormat(String date){

        String[] dates=date.split("/");

        if(dates.length!=0)
            return dates[2]+"-"+dates[0]+"-"+dates[1];
        else
            return date;
    }

    /**
     * SALARY INFORMATION FILE-STRING
      * @param payrollId
     * @param ids
     * @return
     */
    public List<String> getSIF(Integer payrollId, List<Integer> ids,String currentTime) {

        Payroll payroll=payrollRepository.findById(payrollId);
        Company company=companyService.getCompany();

        List<String>  filenameAndContent=new ArrayList<>();
        String fileString=new String();
        BigDecimal total=BigDecimal.ZERO;

        for ( int id :ids){
            Employee employee = employeeService.findByPK(id);
            Map<String, Object> param = new HashMap<>();
            param.put("employee", employee);
            List<EmployeeBankDetails> employeeBankDetailsList = employeeBankDetailsService.findByAttributes(param);
            EmployeeBankDetails employeeBankDetails = null;
            if (employeeBankDetailsList!=null&&!employeeBankDetailsList.isEmpty()){
                employeeBankDetails = employeeBankDetailsList.get(0);
            }
            Map<String, Object> param1 = new HashMap<>();
            param1.put("employee", employee);
            List<Employment> employmentList = employmentService.findByAttributes(param1);
            Employment employment = null;
            if (employmentList!=null&&!employmentList.isEmpty()){
                employment = employmentList.get(0);}

            String[] payPeriod =payroll.getPayPeriod().split("-");
            String startDate=dateFormat(payPeriod[0]!=null?payPeriod[0]:"-");
            String endDate=dateFormat(payPeriod[1]!=null?payPeriod[1]:"-");

            //Fixed and Variable Calculation for sif
            BigDecimal fixedComponent=BigDecimal.ZERO;
            BigDecimal variableComponent=BigDecimal.ZERO;
            BigDecimal deduction=BigDecimal.ZERO;
            BigDecimal noOfDays= BigDecimal.valueOf(0); BigDecimal lop= BigDecimal.valueOf(0);

            List<Salary> employeesalaryList = salaryRepository.findByPayrollEmployeeId(payrollId,id);
            if (employeesalaryList != null)
                for (Salary result : employeesalaryList) {

                    if (result.getSalaryComponent()!=null)
                        switch (result.getSalaryComponent().getSalaryStructure().getId()){

                            case 1://FIXED COMPONENT
                                fixedComponent =fixedComponent.add( result.getTotalAmount());
                                break;

                            case 2://VARIABLE COMPONENT
                                variableComponent =variableComponent.add( result.getTotalAmount());
                                break;

                            case 3: //DEDUCTIONs
                                deduction =deduction.add( result.getTotalAmount());
                                break;
                            case 4://FIXED Allowance will be added in Fixed component
                                fixedComponent =fixedComponent.add( result.getTotalAmount());
                                break;

                        }

                    noOfDays = result.getNoOfDays();
                    lop      = result.getLopDays();
                }//salary end

            BigDecimal INCOME_FIXED_COMPONENT=fixedComponent;
            BigDecimal INCOME_VARIABLE_COMPONENT=variableComponent.subtract(deduction);

            total=total.add(INCOME_FIXED_COMPONENT.add(INCOME_VARIABLE_COMPONENT));
            fileString=  fileString.concat("EDR," +
                    (employment.getLabourCard()!=null?employment.getLabourCard():"-") + "," +
                    (employment.getAgentId()!=null&& !employment.getAgentId().isEmpty()
                            ?employment.getAgentId():"-") + "," +
                    employeeBankDetails.getIban() + ","+
                    startDate+ ","+
                    endDate+ ","+
                    noOfDays + "," +
                    INCOME_FIXED_COMPONENT + "," +
                    INCOME_VARIABLE_COMPONENT.setScale(2, BigDecimal.ROUND_HALF_EVEN) + ","+
                    lop+ "," +
                    "\n");

        }

        fileString= fileString.concat(
                "SCR," +
                company.getCompanyNumber() + "," +
                company.getCompanyBankCode() + "," +
                payroll.getPayrollDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "," +
                payroll.getPayrollDate().format(DateTimeFormatter.ofPattern("HHmm")) + "," +
                payroll.getPayrollDate().format(DateTimeFormatter.ofPattern("MMYYYY")) + "," +
                payroll.getEmployeeCount() + "," +
                total + "," +
                "AED"+ "," +
                "SimpleAccounts Software" +
                "\n");

        String fileName=new String();
        ZonedDateTime zonedDateTime = ZonedDateTime.ofInstant(Instant.ofEpochMilli(new Date().getTime()),TimeZone.getDefault().toZoneId());
        fileName =fileName.concat(
                company.getCompanyNumber() +
                      zonedDateTime.format(DateTimeFormatter.ofPattern("yy-MM-dd")).replaceAll("-","")) + currentTime.replaceAll(":","");
        filenameAndContent.add(fileName);
        filenameAndContent.add(fileString);

        return filenameAndContent;
    }

    public List<PayrollListModel>  getListModel(Object data) {
        List<PayrollListModel> payrollListModelList = new ArrayList<PayrollListModel>();
        for(Payroll res :(List<Payroll>) data)
        {
            PayrollListModel payrollListModel = new  PayrollListModel();

            User generatedByUser = userService.findByPK(Integer.parseInt(res.getGeneratedBy()));
            String generatedByName =  generatedByUser.getFirstName().toString() +" " +generatedByUser.getLastName().toString();
            String payrollApproverName=null;
            if(res.getPayrollApprover()!=null) {
                User payrollApproverUser = userService.findByPK(res.getPayrollApprover());
                payrollApproverName = payrollApproverUser.getFirstName().toString() + " " + payrollApproverUser.getLastName().toString();
            }
            payrollListModel.setId(res.getId());
            payrollListModel.setPayrollDate(res.getPayrollDate().toString());
            payrollListModel.setPayrollSubject(res.getPayrollSubject());
            payrollListModel.setPayPeriod(res.getPayPeriod());
            payrollListModel.setEmployeeCount(res.getEmployeeCount());
            payrollListModel.setGeneratedBy(res.getGeneratedBy());
            payrollListModel.setApprovedBy(res.getApprovedBy());
            payrollListModel.setStatus(res.getStatus());
            if(res.getRunDate() != null)
            {
                payrollListModel.setRunDate(res.getRunDate().toString());
            }
            else {
                payrollListModel.setRunDate("");
            }
            payrollListModel.setComment(res.getComment());
            payrollListModel.setDeleteFlag(res.getDeleteFlag());
            payrollListModel.setIsActive(res.getIsActive());
            payrollListModel.setPayrollApprover(res.getPayrollApprover());
            payrollListModel.setPayrollApproverName(payrollApproverName);
            payrollListModel.setGeneratedByName(generatedByName);
            payrollListModel.setDueAmountPayroll(res.getDueAmountPayroll());
            payrollListModel.setTotalAmountPayroll(res.getTotalAmountPayroll());

            // get the list of employeeID
            List<Integer> empIdList = payrolService.getEmployeeList(res.getId());
            payrollListModel.setExistEmpList(empIdList);

            payrollListModelList.add(payrollListModel);
        }

        return  payrollListModelList;
    }

    /**
     * This method will create reverse journal entry against payroll journal entries
     * and It will set payroll status "Voided"
     * @param postingRequestModel
     */
    public void voidPayroll(PostingRequestModel postingRequestModel, String comment, HttpServletRequest request) {

        Payroll payroll = payrollRepository.findById(postingRequestModel.getPostingRefId());
        List<JournalLineItem> journalLineItemList= journalLineItemRepository.findAllByReferenceIdAndReferenceType(
                postingRequestModel.getPostingRefId(),
                PostingReferenceTypeEnum.PAYROLL_APPROVED);


        if (journalLineItemList!=null && !journalLineItemList.isEmpty()){
            Collection<Journal> journalList=journalLineItemList.stream()
                    .distinct()
                    .map(JournalLineItem :: getJournal)
                    .collect(Collectors.toList());

            Set<Journal> set = new LinkedHashSet<Journal>(journalList);
            journalList.clear();
            journalList.addAll(set);

            for (Journal journal:journalList){

                Journal newjournal=new Journal();

                newjournal.setCreatedBy(journalLineItemList.get(0).getJournal().getCreatedBy());
                newjournal.setPostingReferenceType(PostingReferenceTypeEnum.PAYROLL_VOIDED);
                if (payroll.getPayrollSubject()!=null) {
                    newjournal.setDescription("Reverse Journal Entry Against: " + payroll.getPayrollSubject());
                }
                newjournal.setJournalDate(LocalDate.now());
                newjournal.setTransactionDate(LocalDateTime.now().toLocalDate());

                Collection<JournalLineItem> journalLineItems=  journal.getJournalLineItems();
                Collection<JournalLineItem> newReverseJournalLineItemList = new ArrayList<>();

                for (JournalLineItem journalLineItem : journalLineItems ){

                    JournalLineItem newReverseJournalLineItemEntry=new JournalLineItem();

                    newReverseJournalLineItemEntry.setTransactionCategory(journalLineItem.getTransactionCategory());
                    newReverseJournalLineItemEntry.setReferenceType(journalLineItem.getReferenceType());
                    newReverseJournalLineItemEntry.setReferenceId(journalLineItem.getReferenceId());
                    newReverseJournalLineItemEntry.setCreatedBy(journalLineItem.getCreatedBy());
                    newReverseJournalLineItemEntry.setCreatedDate(journalLineItem.getCreatedDate());
                    newReverseJournalLineItemEntry.setDescription(journalLineItem.getDescription());
                    newReverseJournalLineItemEntry.setDeleteFlag(journalLineItem.getDeleteFlag());

                        newReverseJournalLineItemEntry.setDebitAmount(journalLineItem.getCreditAmount());
                        newReverseJournalLineItemEntry.setCreditAmount(journalLineItem.getDebitAmount());

                    newReverseJournalLineItemEntry.setJournal(newjournal);
                    newReverseJournalLineItemList.add(newReverseJournalLineItemEntry);
                }
                newjournal.setJournalLineItems(newReverseJournalLineItemList);
                if (payroll.getPayrollSubject()!=null){
                    journal.setDescription(payroll.getPayrollSubject());
                }
                journalService.persist(newjournal);
            }//for

        }//else

        payroll.setStatus("Voided");
        User user= userService.findByPK(payroll.getPayrollApprover());
        payroll.setComment(postingRequestModel.getComment()                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         );
        sendVoidMail(payroll, Integer.valueOf(payroll.getGeneratedBy()),comment,request);

        payrollRepository.save(payroll);
    }

    public boolean sendVoidMail( Payroll payroll,Integer generatorId ,String comment,HttpServletRequest request) {
        User user = userService.findByPK(generatorId);
        String image = "";
        if (user.getCompany() != null && user.getCompany().getCompanyLogo() != null) {
            image = " data:image/jpg;base64," + DatatypeConverter.printBase64Binary(
                    user.getCompany().getCompanyLogo());

        }
        String htmlContent = "";
        String generatedBy = "";
        User user1 = userService.findByPK(10000);
            if (user != null) {
                generatedBy = user.getFirstName() + " " + user.getLastName();
            }
        List<String> receiversName = new ArrayList<>();
        List<String> receiverList = new ArrayList<>();
        if(user1!=null && user1.getUserId()!= user.getUserId()) {
            receiverList.add(user1.getUserEmail());
            receiversName.add(user1.getFirstName() + " " + user1.getLastName());
        }
        receiverList.add(user.getUserEmail());
        receiversName.add(user.getFirstName() + " " + user.getLastName());
        List<PayrollEmployee> payrollEmployees = payrollEmployeeRepository.findByPayrollId(payroll);
        for(PayrollEmployee payrollEmployee : payrollEmployees){
            receiverList.add(payrollEmployee.getEmployeeID().getEmail());
            receiversName.add(payrollEmployee.getEmployeeID().getFirstName() + " " + payrollEmployee.getEmployeeID().getLastName());
        }
        try {
            byte[] contentData = Files.readAllBytes(Paths.get(resourceLoader.getResource("classpath:" + VOID_MAIL_TEMPLATE).getURI()));
            htmlContent = new String(contentData, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Error processing payroll", e);
        }
        Integer size = receiverList.size();
        for(Integer i = 0; i < size; i++) {
            String sendMailTo = receiverList.get(i);
            String name = receiversName.get(i);
            String temp1 = htmlContent
//                .replace("{employees}",employee.getFirstName()+ " "+ employee.getLastName())
                    .replace("{generaterName}", name)
                    .replace("{payrollSubject}", payroll.getPayrollSubject())
                    .replace("{Startdate}", payroll.getPayPeriod().replace("-", "  To  ").replace("/", "-"))
                    .replace("{companylogo}", image)
                    .replace("{PayrollGenerator}", generatedBy)
                    .replace("{Auto-populate the reasons}", payroll.getComment());

            try {
                emailSender.send(sendMailTo, "Payroll Voidance Request", temp1, EmailConstant.ADMIN_SUPPORT_EMAIL,
                        EmailConstant.ADMIN_EMAIL_SENDER_NAME, true);
                EmailLogs emailLogs = new EmailLogs();
                emailLogs.setEmailDate(LocalDateTime.now());
                emailLogs.setEmailTo(sendMailTo);
                emailLogs.setEmailFrom(EmailConstant.ADMIN_SUPPORT_EMAIL);
                emailLogs.setModuleName("PAYROLL");
                String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                        .replacePath(null)
                        .build()
                        .toUriString();
                System.out.println(baseUrl);
                emailLogs.setBaseUrl(baseUrl);
                emaiLogsService.persist(emailLogs);
                logger.info("Void Payroll mail sent successfully....!");
                logger.info("Email send to =" + emailLogs);

            } catch (MessagingException e) {
                logger.error("Error", e);

                return false;
            }
        }
        return true;
    }
}
