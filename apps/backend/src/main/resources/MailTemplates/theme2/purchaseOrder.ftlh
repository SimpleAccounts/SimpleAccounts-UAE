
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

    .hide td {
        overflow: hidden;
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
   <img src='<#if companylogo?has_content>${companylogo}</#if>' width="120px" height="80px">
    </div>
    <div>
        <h1 style="float:right;color:#2064d8;">Purchase Order}</h1>
    </div>
  </div>
    <div style="
    float: left;
    width: 80%;
    height: 100px;
   ">
      <h6 style="text-align:left;">
       ${user.getCompany().getCompanyAddressLine1()}, <br/>
        <#if user.getCompany().getCompanyCity()?has_content> ${user.getCompany().getCompanyCity()}</#if> ${user.getCompany().getCompanyStateCode().getStateName()}, <#if user.getCompany().getCompanyPoBoxNumber()?has_content> ${user.getCompany().getCompanyPoBoxNumber()}</#if>
        &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp; &emsp;
        VAT Registeration No: ${user.getCompany().getVatNumber()}
   </h6>
   </div>

    <!--new table added for Billed Block -->
  <div>
  <table style="width: 60%; border-collapse: collapse; background: #f3f8ff;margin-top: 20px; font-size:12px;">
      <tr style="display: table-row;vertical-align: inherit;border-color: inherit;background: #2064d8;color: white";>
        <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 20%">Billed TO</td>
      <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 20%">Details</td>
        <td style="text-align:center;border-spacing: 5px;border: 1px solid black;width: 20%">Total Due</td>
      </tr>
      <tr>
        <td style="text-align:left; border-spacing: 5px;border: 1px solid black; width: 20%"><#if organization?has_content>${organization}<#else>${contactName}</#if><br/><#if contactAddressLine1 ?has_content>${contactAddressLine1}</#if><br/><#if contactCity ?has_content>${contactCity} </#if><#if contactState ?has_content>${contactState} </#if>, <#if postZipCode ?has_content>${postZipCode}</#if></td>
        <td style="text-align:center; border-spacing: 5px;border: 1px solid black; width: 20%">Quotation <br/> ${quotation.getPoNumber()}</td>
        <td style="text-align:center; border-spacing: 5px;border: 1px solid black; width: 20%"><#if quotation.getTotalAmount() ?has_content>${quotation.getTotalAmount()?string["0.00"]}</#if></td>

     </tr>
    </table>
  </div>
    <!--end of new table added for Billed Block -->
  <!--new table added for Terms -->
    <div >
        <table style="width: 100%; border: 1px solid black;background: #f3f8ff; border-collapse: collapse; margin-top: 20px">
            <tr style="display: table-row;vertical-align: inherit;border-color: inherit;background: #2064d8;color: white;">
                <td style="width: 10%; text-align:center;border-spacing: 1px;border: 1px solid black;">Date</td>
                <td style="width: 10%; text-align:center;border-spacing: 1px;border: 1px solid black;">Due Date</td>

            </tr>
            <tr>
                <td style="text-align:justify;vertical-align: top;border-right:1px solid black;background: #f3f8ff;width: 10%;">${quotation.getCreatedDate()}</td>
                <td style="text-align:justify;vertical-align: top;border-right:1px solid black;background: #f3f8ff;width: 10%;">${quotation.getPoReceiveDate()}</td>

            </tr>
        </table>
    </div>

  <!--new table added -->

  <div style="overflow-x:auto;">
         <table style="width: 100%; border: 1px solid black;background: #f3f8ff; border-collapse: collapse;background: #fff4e9;margin-top: 20px">
               <tr style="display: table-row;vertical-align: inherit;border-color: inherit;background: #2064d8;color: white";>
<#--                  <td style="text-align:center;border-right:1px solid black;">#</td>-->
                  <td style="text-align:center;border-right:1px solid black;">Quantity</td>
                  <td style="text-align:center;border-right:1px solid black;">Product Name & Description</td>
<#--                  <td style="text-align:center;border-right:1px solid black;">Description</td>-->
                  <td style="text-align:center;border-right:1px solid black;">Units</td>
                  <td style="text-align:center;border-right:1px solid black;">Price</td>
                  <td style="text-align:center;border-right:1px solid black;">Discount</td>
                  <td style="text-align:center;border-right:1px solid black;">Tax(%)</td>
                  <td style="text-align:center;border-right:1px solid black;">Sub Total</td>
            </tr>
                 <#list lineItemList as item>
            <tr>
    <#--              <td style="text-align:center;border-right:1px solid black;background: #f3f8ff;">${item?index+1}</td>-->
                  <td style="text-align:center;vertical-align: top;border-right:1px solid black;background: #f3f8ff;"><#if item.getQuantity()?has_content>${item.getQuantity()}</#if></td>
                  <td style="text-align:start;vertical-align: top;border-right:1px solid black;background: #f3f8ff;">${item.getProduct().getProductName()}<br><#if item.getDescription()?has_content>${item.getDescription()}</#if></td>
    <#--              <td style="text-align:center;border-right:1px solid black;background: #f3f8ff;"></td>-->
                  <td style="text-align:start;vertical-align: top;border-right:1px solid black;background: #f3f8ff;"><#if item.getUnitTypeId() ?has_content> ${item.getUnitTypeId().getUnitTypeCode()}</#if></td>
                  <td style="text-align:right;vertical-align: top;border-right:1px solid black;background: #f3f8ff;"><#if item.getUnitCost() ?has_content> ${item.getUnitCost()?string["0.00"]}</#if></td>
                  <td style="text-align:right;vertical-align: top;border-right:1px solid black;background: #f3f8ff;"><#if item.getDiscount()?has_content> ${item.getDiscount()?string["0.00"]}</#if></td>
                  <td style="text-align:center;vertical-align: top;border-right:1px solid black;background: #f3f8ff;"><#if item.getVatCategory().getVat()?has_content> ${item.getVatCategory().getVat()}%</#if></td>
                  <td style="text-align:right;vertical-align: top;border-right:1px solid black;background: #f3f8ff;"><#if item.getSubTotal()?has_content>${item.getSubTotal()?string["0.00"]}</#if></td>
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
       <td style="border-right:1px solid black">Discount Amount:</td>
        <td style=""> <#if quotation.getDiscount()?has_content>${quotation.getDiscount()?string["0.00"]}</#if></td>
      </tr>
      <tr style="">
       <td style="border-right:1px solid black">Total Net:</td>
        <td style=""> <#if invoiceAmount ?has_content>${invoiceAmount}</#if></td>
      </tr>
         <tr>
       <td style="border-right: 1px solid black;">Total Tax Amount:</td>
        <td style=""> <#if quotation.getTotalVatAmount() ?has_content>${quotation.getTotalVatAmount()?string["0.00"]}</#if></td>
      </tr>
      <tr style="background-color: #2064d8;color: white">
       <td style="border-top:1px solid black;border-right: 1px solid black;">Total Amount:</td>
        <td style="border-top:1px solid black;border-right: 1px solid black;"><#if currency ?has_content>${currency}</#if> <#if quotation.getTotalAmount() ?has_content>${quotation.getTotalAmount()?string["0.00"]}</#if></td>
      </tr>
    </table>
      <td style="float:left">

          <#if quotation.getNotes()?has_content>
          <b>Notes:</b>
      <br/> ${quotation.getNotes()}</#if><br/><br/>
          <#if  quotation.getTermsAndConditions() ?has_content>
          <b>Terms & Conditions: </b>
      <br/>${ quotation.getTermsAndConditions()}</#if><br>


      </td>
</html>