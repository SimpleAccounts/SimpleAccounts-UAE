package com.simpleaccounts.service;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.financialreport.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface VatReportFilingService {
    public boolean processVatReport(VatReportFilingRequestModel vatReportFilingRequestModel, User user);

    public List<VatReportResponseModel> getVatReportFilingList();
    public List<VatReportResponseModel> getVatReportFilingList2(List<VatReportFiling> vatReportFilingList);
    void deleteVatReportFiling(Integer id);

    void fileVatReport(FileTheVatReportRequestModel fileTheVatReportRequestModel,User user);

    VatPayment recordVatPayment(RecordVatPaymentRequestModel recordVatPaymentRequestModel,Integer userId) throws IOException;

    Journal undoFiledVatReport(PostingRequestModel postingRequestModel, Integer userId);

    List<VatPaymentHistoryModel> getVatPaymentRecordList();
    List<VatPaymentHistoryModel> getVatPaymentRecordList2( List<VatRecordPaymentHistory> vatRecordPaymentHistoryList);
}
