package com.simpleaccounts.rfq_po;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.FileHelper;
import com.simpleaccounts.utils.MessageUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import io.swagger.annotations.ApiOperation;
import java.time.ZoneId;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Created By Zain Khan
 */
@Slf4j
@RestController
@RequestMapping(value = "/rest/poquatation")
@RequiredArgsConstructor
public class
PoQuatationController {
    private static final String LOG_FILE_PATH = "filePath {}";
    private static final String MSG_CREATE_UNSUCCESSFUL = "create.unsuccessful.msg";
    private static final String MSG_SENT_UNSUCCESSFUL = "sent.unsuccessful.msg";
    
    private final Logger logger = LoggerFactory.getLogger(PoQuatationController.class);
    private final JwtTokenUtil jwtTokenUtil;

    private final PoQuatationRestHelper poQuatationRestHelper;

    private final PoQuatationService poQuatationService;

    private final UserService userService;

    private final ContactService contactService;

    private final PoQuatationLineItemService poQuatationLineItemService;

    private final InvoiceService invoiceService;

    private final FileAttachmentService fileAttachmentService;

    private final RfqPoGrnInvoiceRelationService rfqPoGrnInvoiceRelationService;

    private final RfqPoGrnInvoiceRelationDao rfqPoGrnInvoiceRelationDao;

    private final InvoiceRestHelper invoiceRestHelper;

    private final JournalService journalService;

    @LogRequest
    @ApiOperation(value = "Get Invoice List")
    @GetMapping(value = "/getListForRfq")
    public ResponseEntity<PaginationResponseModel> getListForRfq(RfqRequestFilterModel filterModel,
                                                                  HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            Map<RfqFilterEnum, Object> filterDataMap = new EnumMap<>(RfqFilterEnum.class);
            if(user.getRole().getRoleCode()!=1) {
                filterDataMap.put(RfqFilterEnum.USER_ID, userId);
            }
            if (filterModel.getSupplierId() != null) {
                filterDataMap.put(RfqFilterEnum.SUPPLIERID, contactService.findByPK(filterModel.getSupplierId()));
            }
            filterDataMap.put(RfqFilterEnum.RFQ_NUMBER, filterModel.getRfqNumber());
            filterDataMap.put(RfqFilterEnum.STATUS, filterModel.getStatus());
            filterDataMap.put(RfqFilterEnum.DELETE_FLAG, false);
            filterDataMap.put(RfqFilterEnum.TYPE, filterModel.getType());
            PaginationResponseModel responseModel = poQuatationService.getRfqList(filterDataMap, filterModel);
            if (responseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            responseModel.setData(poQuatationRestHelper.getRfqListModel(responseModel.getData()));
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "New Request For Quatation")
    @PostMapping(value = "/saverfq")
    public ResponseEntity<Object> saveRequestForQuatation(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message=null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            String rootPath = request.getServletContext().getRealPath("/");
            log.info("filePath {}",rootPath);
            FileHelper.setRootPath(rootPath);
            PoQuatation poQuatation = poQuatationRestHelper.getRfqEntity(requestModel, userId);
            //To save the uploaded file in db.
            if (requestModel.getAttachmentFile()!=null) {
                MultipartFile file = requestModel.getAttachmentFile();
                if (file != null) {
                    FileAttachment fileAttachment = fileAttachmentService.storeRfqPoGrnFile(file , requestModel);
                    poQuatation.setAttachmentFileName(fileAttachment);
                }
            }
            poQuatationService.persist(poQuatation);
            message = new SimpleAccountsMessage("0051",
                    MessageUtil.getMessage("rfq.created.successful.msg.0051"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_CREATE_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Request For Quatation")
    @PostMapping(value = "/updaterfq")
    public ResponseEntity<Object> updateRequestForQuatation(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message=null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PoQuatation poQuatation = poQuatationRestHelper.getRfqEntity(requestModel, userId);
            poQuatation.setStatus(CommonStatusEnum.PENDING.getValue());
            poQuatationService.update(poQuatation);
            message = new SimpleAccountsMessage("0052",
                    MessageUtil.getMessage("rfq.updated.successful.msg.0052"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_CREATE_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get Rfq By ID")
    @GetMapping(value = "/getRfqById")
    public ResponseEntity<PoQuatationRequestModel> getInvoiceById(@RequestParam(value = "id") Integer id) {
        PoQuatation quotation = poQuatationService.findByPK(id);
        if (quotation == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(poQuatationRestHelper.getRfqModel(quotation), HttpStatus.OK);
        }
    }

    @LogRequest
    @ApiOperation(value = "Send RFQ")
    @PostMapping(value = "/sendrfq")
    public ResponseEntity<Object> sendRfq(@RequestBody PostingRequestModel postingRequestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message=null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            poQuatationRestHelper.sendRfq(poQuatationService.findByPK(postingRequestModel.getPostingRefId()), userId,postingRequestModel,request);
            PoQuatation poQuatation=poQuatationService.findByPK(postingRequestModel.getPostingRefId());
            poQuatation.setStatus(CommonStatusEnum.POST.getValue());
            poQuatationService.update(poQuatation);
            message = new SimpleAccountsMessage("0053",
                    MessageUtil.getMessage("rfq.sent.successful.msg.0053"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_SENT_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //--------------------------------------------PO---------------------------------------------------
    @LogRequest
    @ApiOperation(value = "Get Purchase Order  List")
    @GetMapping(value = "/getListForPO")
    public ResponseEntity<PaginationResponseModel> getListForPO(PORequestFilterModel filterModel,
                                                                 HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            Map<POFilterEnum, Object> filterDataMap = new EnumMap<>(POFilterEnum.class);
            if(user.getRole().getRoleCode()!=1) {
                filterDataMap.put(POFilterEnum.USER_ID, userId);
            }
            if (filterModel.getSupplierId() != null) {
                filterDataMap.put(POFilterEnum.SUPPLIERID, contactService.findByPK(filterModel.getSupplierId()));
            }
            filterDataMap.put(POFilterEnum.PO_NUMBER, filterModel.getPoNumber());
            filterDataMap.put(POFilterEnum.STATUS, filterModel.getStatus());
            filterDataMap.put(POFilterEnum.DELETE_FLAG, false);
            filterDataMap.put(POFilterEnum.TYPE, filterModel.getType());
            PaginationResponseModel responseModel = poQuatationService.getPOList(filterDataMap, filterModel);
            if (responseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            responseModel.setData(poQuatationRestHelper.getPOListModel(responseModel.getData(),filterModel.getType()));
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "New Request For Purchase Order")
    @PostMapping(value = "/savepo")
    public ResponseEntity<Object> savePurchaseOrder(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message= null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

			
            PoQuatation poQuatation=null;
            PoQuatation parentpoQuatation=null;
            if (requestModel.getRfqId()!=null) {
                parentpoQuatation = poQuatationService.findByPK(requestModel.getRfqId());
            }
            poQuatation=poQuatationRestHelper.getPoEntity(requestModel, userId);
            if (parentpoQuatation!=null) {
                poQuatation.setRfqNumber(parentpoQuatation.getRfqNumber());
            }

            poQuatationService.persist(poQuatation);
            if (parentpoQuatation!=null) {
                rfqPoGrnInvoiceRelationService.addRfqPoGrnRelation(parentpoQuatation,poQuatation);
            }
            message = new SimpleAccountsMessage("0054",
                    MessageUtil.getMessage("po.created.successful.msg.0054"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
            } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_CREATE_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Request For Purchase Order")
    @PostMapping(value = "/updatepo")
    public ResponseEntity<Object> updatePurchaseOrder(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message= null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PoQuatation poQuatation=null;
             poQuatation = poQuatationRestHelper.getPoEntity(requestModel, userId);
            if (requestModel.getRfqNumber()!=null) {
                poQuatation.setRfqNumber(requestModel.getRfqNumber());
            }
            poQuatation.setStatus(CommonStatusEnum.PENDING.getValue());

            poQuatationService.update(poQuatation);
            message = new SimpleAccountsMessage("0055",
                    MessageUtil.getMessage("po.updated.successful.msg.0055"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("update.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @LogRequest
    @ApiOperation(value = "Get PO By ID")
    @GetMapping(value = "/getPOById")
    public ResponseEntity<PoQuatationRequestModel> getPOById(@RequestParam(value = "id") Integer id) {
        PoQuatation poQuatation = poQuatationService.findByPK(id);

        if (poQuatation == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(poQuatationRestHelper.getPOModel(poQuatation), HttpStatus.OK);
        }
    }

    @LogRequest
    @ApiOperation(value = "Send Purchase Order")
    @PostMapping(value = "/sendPO")
    public ResponseEntity<Object> sendPO(@RequestBody PostingRequestModel postingRequestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message= null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            poQuatationRestHelper.sendPO(poQuatationService.findByPK(postingRequestModel.getPostingRefId()), userId,postingRequestModel ,request);
            PoQuatation poQuatation=poQuatationService.findByPK(postingRequestModel.getPostingRefId());
            poQuatation.setStatus(CommonStatusEnum.POST.getValue());
            poQuatationService.update(poQuatation);
            message = new SimpleAccountsMessage("0056",
                    MessageUtil.getMessage("po.sent.successful.msg.0056"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_SENT_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
 //--------------------------------------------GRN---------------------------------------------------

    @LogRequest
    @ApiOperation(value = "Get GRN List")
    @GetMapping(value = "/getListForGRN")
    public ResponseEntity<PaginationResponseModel> getListForGRN(PORequestFilterModel filterModel,
                                                                 HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            Map<POFilterEnum, Object> filterDataMap = new EnumMap<>(POFilterEnum.class);
            if(user.getRole().getRoleCode()!=1) {
                filterDataMap.put(POFilterEnum.USER_ID, userId);
            }
            if (filterModel.getSupplierId() != null) {
                filterDataMap.put(POFilterEnum.SUPPLIERID, contactService.findByPK(filterModel.getSupplierId()));
            }
            filterDataMap.put(POFilterEnum.GRN_NUMBER, filterModel.getGrnNumber());
            filterDataMap.put(POFilterEnum.STATUS, filterModel.getStatus());

            filterDataMap.put(POFilterEnum.DELETE_FLAG, false);
            filterDataMap.put(POFilterEnum.TYPE, filterModel.getType());
            PaginationResponseModel responseModel = poQuatationService.getPOList(filterDataMap, filterModel);
            if (responseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            responseModel.setData(poQuatationRestHelper.getPOListModel(responseModel.getData(),filterModel.getType()));
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "New Request For Purchase Order")
    @PostMapping(value = "/savegrn")
    public ResponseEntity<Object> saveGoodsReceiveNotes(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            String rootPath = request.getServletContext().getRealPath("/");
            log.info("filePath {}",rootPath);
            FileHelper.setRootPath(rootPath);
            PoQuatation poQuatation=null;
            PoQuatation parentPoQuatation=null;
            if (requestModel.getPoId()!=null){
                parentPoQuatation=poQuatationService.findByPK(requestModel.getPoId());

            }
                poQuatation = poQuatationRestHelper.getGoodsReceiveNotesEntity(requestModel, userId);
            if (parentPoQuatation!=null && parentPoQuatation.getPoNumber() != null) {
                poQuatation.setPoNumber(parentPoQuatation.getPoNumber());
            }
            //To save the uploaded file in db.
            if (requestModel.getAttachmentFile()!=null) {
                MultipartFile file = requestModel.getAttachmentFile();
                if (file != null) {
                    FileAttachment fileAttachment = fileAttachmentService.storeRfqPoGrnFile(file , requestModel);
                    poQuatation.setAttachmentFileName(fileAttachment);
                }
            }
            poQuatationService.persist(poQuatation);
            if (parentPoQuatation!=null) {
                rfqPoGrnInvoiceRelationService.addRfqPoGrnRelation(parentPoQuatation, poQuatation);
            }
            message = new SimpleAccountsMessage("0057",
                    MessageUtil.getMessage("grn.created.successful.msg.0057"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_CREATE_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Goods Receive Notes")
    @PostMapping(value = "/updategrn")
    public ResponseEntity<Object> updateGoodsReceiveNotes(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PoQuatation poQuatation = poQuatationRestHelper.getGoodsReceiveNotesEntity(requestModel, userId);
            poQuatation.setStatus(CommonStatusEnum.PENDING.getValue());

            poQuatationService.update(poQuatation);
            message = new SimpleAccountsMessage("0058",
                    MessageUtil.getMessage("grn.updated.successful.msg.0058"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("update.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Get GRN By ID")
    @GetMapping(value = "/getGRNById")
    public ResponseEntity<PoQuatationRequestModel> getGRNById(@RequestParam(value = "id") Integer id) {
        PoQuatation poQuatation = poQuatationService.findByPK(id);
        if (poQuatation == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(poQuatationRestHelper.getGRNModel(poQuatation), HttpStatus.OK);
        }
    }

    @LogRequest
    @ApiOperation(value = "Send GRN")
    @PostMapping(value = "/sendGRN")
    public ResponseEntity<Object> sendGRN(@RequestParam("id") Integer id, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            poQuatationRestHelper.sendGRN(poQuatationService.findByPK(id), userId,request);
            PoQuatation poQuatation=poQuatationService.findByPK(id);

            poQuatationService.update(poQuatation);
            message = new SimpleAccountsMessage("0059",
                    MessageUtil.getMessage("grn.sent.successful.msg.0059"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_SENT_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // This Api will create an supplier invoice for the GRN
    @LogRequest
    @Transactional
    @ApiOperation(value = "Post GRN")
    @PostMapping(value = "/postGRN")
    public ResponseEntity<Object> postGRN(@RequestParam("id") Integer id, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PoQuatation poQuatation=poQuatationService.findByPK(id);
            if (poQuatation==null) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            Invoice invoice = poQuatationRestHelper.createSupplierInvoiceForGrn(poQuatation, userId);
            invoiceService.persist(invoice);
            PostingRequestModel postingRequestModel = new PostingRequestModel();
            postingRequestModel.setPostingRefId(invoice.getId());
            postingRequestModel.setPostingRefType("INVOICE");
            postingRequestModel.setAmount(invoice.getTotalAmount());
            Journal journal = null;
            journal = invoiceRestHelper.invoicePosting(postingRequestModel, userId);
            if (journal != null) {
                journalService.persist(journal);
            }
            invoice.setStatus(CommonStatusEnum.POST.getValue());
            invoiceRestHelper.send(invoice,userId,new PostingRequestModel(),request);
            invoiceService.persist(invoice);
            poQuatation.setStatus(CommonStatusEnum.POST_GRN.getValue());
            poQuatationService.update(poQuatation);

            message = new SimpleAccountsMessage("0060",
                    MessageUtil.getMessage("grn.post.successful.msg.0060"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("post.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Delete RFQ PO GRN By ID")
    @DeleteMapping(value = "/delete")
    public ResponseEntity<Object> delete(@RequestParam(value = "id") Integer id) {
        PoQuatation poQuatation = poQuatationService.findByPK(id);
        Map<String, Object> param = new HashMap<>();
        param.put("childID", poQuatation);
        List<RfqPoGrnRelation> poList = rfqPoGrnInvoiceRelationDao.findByAttributes(param);
        for (RfqPoGrnRelation rfqPoGrnRelation :poList){
          rfqPoGrnInvoiceRelationService.delete(rfqPoGrnRelation);
        }
        if (poQuatation != null) {
            poQuatationService.delete(poQuatation);

        }
        Map<String, Object> attribute = new HashMap<String, Object>();
        attribute.put("poQuatation", poQuatation);

        List<PoQuatationLineItem> poQuatationLineItemList = poQuatationLineItemService.findByAttributes(attribute);
        for (PoQuatationLineItem poQuatationLineItem:poQuatationLineItemList){
            poQuatationLineItemService.delete(poQuatationLineItem);
        }
        try {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("delete.successful.msg"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("delete.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Quatation For Customer
    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "New Request For Quatation")
    @PostMapping(value = "/saveQuatation")
    public ResponseEntity<Object> saveQuatation(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message= null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            String rootPath = request.getServletContext().getRealPath("/");
            log.info("filePath {}",rootPath);
            FileHelper.setRootPath(rootPath);
            PoQuatation poQuatation = poQuatationRestHelper.getQuatationEntity(requestModel, userId);
            //To save the uploaded file in db.
            if (requestModel.getAttachmentFile()!=null) {
                MultipartFile file = requestModel.getAttachmentFile();
                if (file != null) {
                    FileAttachment fileAttachment = fileAttachmentService.storeRfqPoGrnFile(file , requestModel);
                    poQuatation.setAttachmentFileName(fileAttachment);
                }
            }
            poQuatationService.persist(poQuatation);
            message = new SimpleAccountsMessage("0062",
                    MessageUtil.getMessage("quotation.created.successful.msg.0062"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_CREATE_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @Transactional(rollbackFor = Exception.class)
    @ApiOperation(value = "Update Request For Quatation")
    @PostMapping(value = "/updateQuatation")
    public ResponseEntity<Object> updateQuatation(@ModelAttribute PoQuatationRequestModel requestModel, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message= null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            PoQuatation poQuatation = poQuatationRestHelper.getQuatationEntity(requestModel, userId);
            poQuatation.setStatus(CommonStatusEnum.PENDING.getValue());
            poQuatationService.update(poQuatation);
            message = new SimpleAccountsMessage("0063",
                    MessageUtil.getMessage("quotation.updated.successful.msg.0063"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("update.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @LogRequest
    @ApiOperation(value = "Get Quotation By ID")
    @GetMapping(value = "/getQuotationById")
    public ResponseEntity<PoQuatationRequestModel> getQuotationById(@RequestParam(value = "id") Integer id) {
        PoQuatation poQuatation = poQuatationService.findByPK(id);

        if (poQuatation == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(poQuatationRestHelper.getQuotationModel(poQuatation), HttpStatus.OK);
        }
    }

    //getList for quatation
    @LogRequest
    @ApiOperation(value = "Get Quatation List")
    @GetMapping(value = "/getListForQuatation")
    public ResponseEntity<PaginationResponseModel> getListForQuatation(PORequestFilterModel filterModel,
                                                                 HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            User user = userService.findByPK(userId);
            Map<QuotationFilterEnum, Object> filterDataMap = new EnumMap<>(QuotationFilterEnum.class);
            if(user.getRole().getRoleCode()!=1) {
                filterDataMap.put(QuotationFilterEnum.USER_ID, userId);
            }
            if (filterModel.getSupplierId() != null) {
                filterDataMap.put(QuotationFilterEnum.SUPPLIERID, contactService.findByPK(filterModel.getSupplierId()));
            }
            filterDataMap.put(QuotationFilterEnum.QUOTATION_NUMBER, filterModel.getQuatationNumber());
            filterDataMap.put(QuotationFilterEnum.STATUS, filterModel.getStatus());

            filterDataMap.put(QuotationFilterEnum.DELETE_FLAG, false);
            filterDataMap.put(QuotationFilterEnum.TYPE, filterModel.getType());
            PaginationResponseModel responseModel = poQuatationService.getQuotationList(filterDataMap, filterModel);
            if (responseModel == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            responseModel.setData(poQuatationRestHelper.getQuotationListModel(responseModel.getData()));
            return new ResponseEntity<>(responseModel, HttpStatus.OK);
        } catch (Exception e) {
            logger.error(ERROR, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @LogRequest
    @ApiOperation(value = "Send Quotation")
    @PostMapping(value = "/sendQuotation")
    public ResponseEntity<Object> sendQuotation(@RequestBody PostingRequestModel postingRequestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

	            if (!Boolean.TRUE.equals(postingRequestModel.getMarkAsSent())){
	                poQuatationRestHelper.sendQuotation(poQuatationService.findByPK(postingRequestModel.getPostingRefId()), userId,postingRequestModel,request);
	            }
            PoQuatation poQuatation=poQuatationService.findByPK(postingRequestModel.getPostingRefId());
            if(poQuatation.getStatus() != 3){
                poQuatation.setStatus(CommonStatusEnum.POST.getValue());
                poQuatationService.update(poQuatation);
            }
            SimpleAccountsMessage message = null;
            message = new SimpleAccountsMessage("0064",
                    MessageUtil.getMessage("quotation.sent.successful.msg.0064"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message= null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage(MSG_SENT_UNSUCCESSFUL), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    // This Api will create an supplier invoice for the GRN

//

    
    @LogRequest
    @ApiOperation(value = "Change Status")
    @PostMapping(value = "/changeStatus")
    public ResponseEntity<Object> changeStatus(@RequestParam(value = "id") Integer id,@RequestParam(value = "status")String status, HttpServletRequest request) {
        try {
            SimpleAccountsMessage message = null;
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

            PoQuatation poQuatation = poQuatationService.findByPK(id);
            /**
             * Added by Neha
             *
             * @PoQuatation TYPES
             * ----------------------
             * Type  | Module
             * 3       RFQ
             * 4       Purchase Order
             * 5       GRN
             * 6       Quotation
             * -----------------------
             */
            switch (poQuatation.getType()) {
                case 3:
                case 4:
                    if (status.equals("Approved")) {
                        poQuatation.setStatus(CommonStatusEnum.APPROVED.getValue());
                    } else if (status.equals("Rejected")) {
                        poQuatation.setStatus(CommonStatusEnum.REJECTED.getValue());
                    } else if (status.equals("Closed")) {
                        poQuatation.setStatus(CommonStatusEnum.CLOSED.getValue());
                    } else if (status.equals("Sent")) {
                        poQuatation.setStatus(CommonStatusEnum.POST.getValue());
                    }else {
                        poQuatation.setStatus(CommonStatusEnum.CLOSED.getValue());
                    }
                    break;
                case 5:
                    poQuatation.setStatus(CommonStatusEnum.CLOSED.getValue());
                    if (status.equals("Sent")) {
                        poQuatation.setStatus(CommonStatusEnum.POST.getValue());
                    } else
                        poQuatation.setStatus(CommonStatusEnum.CLOSED.getValue());
                    break;
                case 6:
                    if (status.equals("Approved")) {
                        poQuatation.setStatus(CommonStatusEnum.APPROVED.getValue());
                    }
                    if (status.equals("Rejected")) {
                        poQuatation.setStatus(CommonStatusEnum.REJECTED.getValue());
                    }
                    if (status.equals("Closed")) {
                        poQuatation.setStatus(CommonStatusEnum.CLOSED.getValue());
                    }
                    if (status.equals("Sent")) {
                        poQuatation.setStatus(CommonStatusEnum.POST.getValue());
                    }
                    if (status.equals("Draft")) {
                        poQuatation.setStatus(CommonStatusEnum.PENDING.getValue());
                    }
                    break;
                default:
            }

            poQuatationService.update(poQuatation);

            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("status.changed.successful.msg"), false);
            return new ResponseEntity<>(message,HttpStatus.OK);
        } catch (Exception e) {
            SimpleAccountsMessage message = null;
            message = new SimpleAccountsMessage("",
                    MessageUtil.getMessage("status.changed.unsuccessful.msg"), true);
            return new ResponseEntity<>( message,HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @LogRequest
    @GetMapping(value = "/getRfqPoForDropDown")
    public ResponseEntity<List<DropdownModel>> getContactsForDropdown(
            @RequestParam(name = "type", required = false) Integer type) {
        try {
            return new ResponseEntity<>(poQuatationService.getRfqPoForDropDown(type), HttpStatus.OK);
        }catch (Exception e) {
            logger.error(ERROR, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @LogRequest
    @GetMapping(value = "/getPoGrnById")
    public ResponseEntity<List<PoQuatationRequestModel>> getRPoGrnById(
            @RequestParam(name = "id", required = false) Integer id) {
        try {
            Map<String, Object> param = new HashMap<>();
            param.put("parentID", id);
            List<RfqPoGrnRelation> list = rfqPoGrnInvoiceRelationDao.findByAttributes(param);
            List<PoQuatationRequestModel> poQuatationRequestModelList = new ArrayList<>();
            if (list != null && !list.isEmpty()) {

                List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList = new ArrayList<>();
                for (RfqPoGrnRelation rfqPoGrnRelation : list) {
                    PoQuatationRequestModel poQuatationRequestModel = new PoQuatationRequestModel();
                    switch (rfqPoGrnRelation.getParentID().getType()) {
                        case 3:
                            if (rfqPoGrnRelation.getChildID().getPoNumber() != null) {
                                poQuatationRequestModel.setPoNumber(rfqPoGrnRelation.getChildID().getPoNumber());
                            }
                            if (rfqPoGrnRelation.getChildID().getSupplierId() != null) {
                                poQuatationRequestModel.setSupplierId(rfqPoGrnRelation.getChildID().getSupplierId()
                                        .getContactId());
                                poQuatationRequestModel.setSupplierName(rfqPoGrnRelation.getChildID().getSupplierId()
                                        .getFirstName());
                            }
                            poQuatationRequestModel.setTotalAmount(rfqPoGrnRelation.getChildID().getTotalAmount());
                            poQuatationRequestModel.setTotalVatAmount(rfqPoGrnRelation.getChildID().getTotalVatAmount());
                            if (rfqPoGrnRelation.getChildID().getPoReceiveDate() != null) {
                                Date recvDate = Date.from(rfqPoGrnRelation.getChildID().getPoReceiveDate().atZone(ZoneId.systemDefault()).toInstant());
                                poQuatationRequestModel.setPoReceiveDate(recvDate);
                            }
                            if (rfqPoGrnRelation.getChildID().getPoApproveDate() != null) {
                                Date approveDate = Date.from(rfqPoGrnRelation.getChildID().getPoApproveDate().atZone(ZoneId.systemDefault()).toInstant());
                                poQuatationRequestModel.setPoApproveDate(approveDate);
                            }
                            poQuatationRequestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(rfqPoGrnRelation.getChildID().getStatus()));
                            poQuatationRestHelper.getPOLineItems(rfqPoGrnRelation.getChildID(), poQuatationRequestModel,
                                    poQuatationLineItemRequestModelList);
                            break;
                        case 4:
                            if (rfqPoGrnRelation.getChildID().getGrnNumber() != null) {
                                poQuatationRequestModel.setGrnNumber(rfqPoGrnRelation.getChildID().getGrnNumber());
                            }
                            if (rfqPoGrnRelation.getChildID().getSupplierId() != null) {
                                poQuatationRequestModel.setSupplierId(rfqPoGrnRelation.getChildID().getSupplierId().getContactId());
                                poQuatationRequestModel.setSupplierName(rfqPoGrnRelation.getChildID().getSupplierId().getFirstName());
                            }
                            poQuatationRequestModel.setTotalAmount(rfqPoGrnRelation.getChildID().getTotalAmount());
                            poQuatationRequestModel.setStatus(CommonStatusEnum.getInvoiceTypeByValue(rfqPoGrnRelation.getChildID().getStatus()));
                            Date grnDate = Date.from(rfqPoGrnRelation.getChildID().getGrnReceiveDate().atZone(ZoneId.systemDefault()).toInstant());
                            poQuatationRequestModel.setGrnReceiveDate(grnDate);
                            poQuatationRestHelper.getPOLineItems(rfqPoGrnRelation.getChildID(), poQuatationRequestModel,
                                    poQuatationLineItemRequestModelList);
                            break;
                        default:
                    }
                    poQuatationRequestModelList.add(poQuatationRequestModel);
                }
            }
            return new ResponseEntity<>(poQuatationRequestModelList, HttpStatus.OK);
        }catch (Exception e) {
            logger.error(ERROR, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        }
}
