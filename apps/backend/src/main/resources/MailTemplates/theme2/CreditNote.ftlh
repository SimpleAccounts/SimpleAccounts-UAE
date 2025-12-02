
    <!doctype html>
    <html>
    <head>
      <style>
        .logo{ float:left;

          width:25%;
          height:280px;
        }
        .name{ float:right;

          width:25%;
          height:280px;
        }
        td {
          padding: 0 7px;
           }
      </style>
    </head>
    <body>
    <div style="margin: auto;
            padding: 30px;
            padding-top: 0px;
            border: 1px solid gray;
            box-shadow: 0 0 10px rgba(0, 0, 0, .15);
            font-size: 13px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            /*max-width: 1000px;*/
            color: #000000;">

      <div style="overflow-x:auto; text-align:center;">
        <div style="float:left">
        </br>
         <#if companylogo?has_content>
                <img src='${companylogo}' width="120px" height="80px">
              <#else>
                <h3>
               ${companyName}
               </h3>
             </#if>
        </div>
        <div>
                            <h1 style="float:right;color:#2064d8;">Credit Note</h1>
                        </div>
      </div>
        <div style="
        float: left;
        width: 70%;
        height: 100px;
       ">
          <h6 style="text-align:left;">
                 ${user.getCompany().getCompanyAddressLine1()}, <br/>
                  <#if user.getCompany().getCompanyCity()?has_content> ${user.getCompany().getCompanyCity()}</#if> ${user.getCompany().getCompanyStateCode().getStateName()}, <#if user.getCompany().getCompanyPoBoxNumber()?has_content> ${user.getCompany().getCompanyPoBoxNumber()}</#if>
                  &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp;
                  <#if user.getCompany().getVatNumber()?has_content>
                                          VAT Registration No: ${user.getCompany().getVatNumber()}
                  </#if>
             </h6>
       </div>

        <!--new table added for Billed Block -->
      <div>
      <table style="width: 75%;  background: #f3f8ff;margin-top: 20px; font-size:12px;">
          <tr style="display: table-row;vertical-align: inherit;border-color: inherit;background: #2064d8;color: white";>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 25%">Billed TO</td>
          <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 25%">Details</td>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 25%">Total Due</td>
          </tr>
          <tr>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 25%"><#if organization ?has_content>${organization}<#else>${contactName}</#if><br/><#if invoice.getContact().getAddressLine1()?has_content> ${invoice.getContact().getAddressLine1()}</#if><br/><#if invoice.getContact().getCity() ?has_content> ${invoice.getContact().getCity()}</#if> ${invoice.getContact().getState().getStateName()}, ${invoice.getContact().getPostZipCode()}</td>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 25%">Invoice <br/> ${invoice.getReferenceNumber()}</td>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 25%"> ${invoice.getCurrency().getCurrencySymbol()}${invoice.getTotalAmount()?string["0.00"]}</td>

         </tr>
        </table>
      </div>
        <!--end of new table added for Billed Block -->
      <!--new table added for Terms -->
      <div >
       <table style="width: 80%; border: 1px solid black;background: #f3f8ff; border-collapse: collapse; margin-top: 20px">
            <tr style="display: table-row;vertical-align: inherit;border-color: inherit;background: #2064d8;color: white";>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;">Terms</td>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;">Date</td>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;">Due Date</td>
            <td style="text-align:center;border-spacing: 5px;border: 1px solid black;">Quote Number</td>
          </tr>
          <tr>
            <td style="text-align:center;border-right:1px solid black;"><#if  invoice.getInvoiceDuePeriod()?has_content> ${invoice.getInvoiceDuePeriod()}</#if></td>
                <td style="text-align:center;border-right:1px solid black;"><#if  invoice.getInvoiceDate()?has_content> ${invoice.getInvoiceDate()}</#if></td>
                <td style="text-align:center;border-right:1px solid black;"><#if  invoice.getInvoiceDueDate()?has_content> ${invoice.getInvoiceDueDate()}</#if></td>
                <td style="text-align:center;border-right:1px solid black;"><#if Quote ?has_content>${Quote}</#if></td>
            </td>
         </tr>
        </table>
      </div>
      <!--new table added -->

      <div style="overflow-x:auto;">
          <table style="width: 100%; border: 1px solid black; border-collapse: collapse;background: #f3f8ff;margin-top: 20px">
                <tr style="display: table-row;vertical-align: inherit;border-color: inherit;background: #2064d8;color: white";>
    <#--        <td style="text-align:center;border-right:1px solid black;">#</td>-->
                <td style="text-align:center;border-right:1px solid black;">Quantity</td>
                <td style="text-align:center;border-right:1px solid black;">Product Name & Description</td>
    <#--        <td style="text-align:center;border-right:1px solid black;">Description</td>-->
                <td style="text-align:center;border-right:1px solid black;">Units</td>
                <td style="text-align:center;border-right:1px solid black;">Price</td>
                <td style="text-align:center;border-right:1px solid black;">Discount</td>
                <td style="text-align:center;border-right:1px solid black;">Tax</td>
                <td style="text-align:center;border-right:1px solid black;">Sub Total</td>
              </tr>
                   <#list lineItemList as item>
              <tr>
    <#--        <td style="text-align:center;border-right:1px solid black;">${item?index+1}</td>-->
                <td style="text-align:center;border-right:1px solid black;"><#if item.getQuantity()?has_content>${item.getQuantity()}</#if></td>
                <td style="text-align:start;border-right:1px solid black;">${item.getProduct().getProductName()}<br><#if item.getDescription()?has_content>${item.getDescription()}</#if></td>
    <#--        <td style="text-align:center;border-right:1px solid black;"></td>-->
                <td style="text-align:center;border-right:1px solid black;"><#if item.getUnitType()?has_content> ${item.getUnitType()}</#if></td>
                <td style="text-align:center;border-right:1px solid black;">${invoice.getCurrency().getCurrencySymbol()}<#if item.getUnitPrice()?has_content>${item.getUnitPrice()?string["0.00"]}</#if></td>
                <td style="text-align:center;border-right:1px solid black;">${invoice.getCurrency().getCurrencySymbol()}<#if item.getDiscount()?has_content>${item.getDiscount()?string["0.00"]}</#if></td>
                <td style="text-align:center;border-right:1px solid black;"><#if item.getVatCategory().getVat()?has_content> ${item.getVatCategory().getName()}</#if></td>
                <td style="text-align:center;border-right:1px solid black;">${invoice.getCurrency().getCurrencySymbol()}<#if item.getSubTotal()?has_content>${item.getSubTotal()?string["0.00"]}</#if></td>
              </tr>
             </#list>
            </table>
          </div>
      <tr >
        <td>
          <br>
        </td>
        <td>
          <br>
        </td>
      </tr>
      <div style="overflow-x:auto;">
        <table style="float:right;border:1px solid;border-collapse: collapse ; text-align:right">

          <tr style="">
           <td style="border-right:1px solid black">Discount:</td>
            <td style=""> ${invoice.getCurrency().getCurrencySymbol()}<#if invoiceDiscount ?has_content>${invoiceDiscount}</#if></td>
          </tr>
          <tr style="">
           <td style="border-right:1px solid black">Total Net:</td>
            <td style=""> ${invoice.getCurrency().getCurrencySymbol()}<#if totalNet ?has_content>${totalNet}</#if></td>
          </tr>
          <tr>
             <tr>
           <td style="border-right: 1px solid black"><#if totalTax ?has_content>${totalTax}%</#if>:</td>
            <td style=""> ${invoice.getCurrency().getCurrencySymbol()}<#if invoice.getTotalVatAmount()?has_content>${invoice.getTotalVatAmount()?string["0.00"]}</#if></td>
          </tr>
          <tr style="">
           <td style="border-right: 1px solid black;">Total Amount:</td>
            <td style=""> ${invoice.getCurrency().getCurrencySymbol()}<#if invoice.getTotalAmount()?has_content>${invoice.getTotalAmount()?string["0.00"]}</#if></td>
          </tr>
         <tr style="background-color: #2064d8;color: white">
           <td style="border-top:1px solid black;border-right: 1px solid black;">Balance Due:</td>
            <td style="border-top:1px solid black;">${invoice.getCurrency().getCurrencyIsoCode()} <#if invoice.getDueAmount()?has_content> ${invoice.getDueAmount()?string["0.00"]}</#if></td>
          </tr>
        </table>
        <td style="float:left">

        <#if invoice.getReceiptNumber() ?has_content>
            <b>Reference Number:</b>
             <br/>${invoice.getReceiptNumber()}</#if><br/><br/>
        <#if notes ?has_content>
          <b>Notes:</b>
         <br/>${notes}</#if> <br/><br/>
        </td>
        <td style="float:right">

        </td>
        <br/><br/> <br/><br/>

      </div>
        <div style="overflow-x: auto;text-align: center;">

            <#if invoice.getFootNote() ?has_content>
            <#--      <b>THANK YOU FOR YOUR BUSINESS</b>-->
        <br/>${invoice.getFootNote()}</#if><br>
        </div>
    </div>

    </body>
    </html>
