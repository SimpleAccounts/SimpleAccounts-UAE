import React, { useState } from 'react';
import { Card, CardBody, Row, Col, Table, Input } from 'components/migration';
import dayjs from '@/utils/date';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import { Currency } from 'components';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import { ToWords } from 'to-words';
import footer from 'assets/images/invoice/invoiceFooter.png';

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

let strings = new LocalizedStrings(data);

const InvoiceTemplate = ({
  invoiceData,
  status,
  currencyData,
  totalNet,
  companyData,
  isBillingAndShippingAddressSame,
  contactData,
  isCNWithoutProduct,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));

  strings.setLanguage(language);

  const getRibbonColor = invoiceData => {
    if (invoiceData.status == 'Draft') {
      return 'pending-color';
    } else if (invoiceData.status == 'Sent') {
      return 'saved-color';
    } else {
      return 'saved-color';
    }
  };

  const renderInvoiceStatus = status => {
    let classname = '';
    if (status === 'Closed') {
      classname = 'label-closed';
    } else if (status === 'Draft') {
      classname = 'label-draft';
    } else if (status === 'Partially Paid') {
      classname = 'label-PartiallyPaid';
    } else if (status === 'Open') {
      classname = 'label-posted';
    } else {
      classname = 'label-overdue';
    }
    return (
      <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
        {status}
      </span>
    );
  };

  const renderShippingAddress = () => {
    let shippingAddress = '';
    if (invoiceData.changeShippingAddress && invoiceData.changeShippingAddress == true) {
      shippingAddress = invoiceData.shippingAddress ? invoiceData.shippingAddress : '';
    } else {
      if (
        contactData &&
        contactData.isBillingAndShippingAddressSame &&
        contactData.isBillingAndShippingAddressSame == true
      )
        shippingAddress = contactData.addressLine1 ? contactData.addressLine1 : '';
      else shippingAddress = contactData.addressLine2 ? contactData.addressLine2 : '';
    }

    return (
      <div className="mb-1 ml-2">
        <b></b>
        {shippingAddress}
      </div>
    );
  };

  const renderShippingPostZipCode = () => {
    let shippingPostZipCode = '';
    if (invoiceData.changeShippingAddress && invoiceData.changeShippingAddress == true) {
      shippingPostZipCode = invoiceData.shippingPostZipCode ? invoiceData.shippingPostZipCode : '';
      if (invoiceData.shippingCountry == 229)
        shippingPostZipCode = strings.POBox + ': ' + shippingPostZipCode;
    } else {
      if (
        contactData &&
        contactData.isBillingAndShippingAddressSame &&
        contactData.isBillingAndShippingAddressSame == true
      ) {
        shippingPostZipCode = contactData.postZipCode ? contactData.postZipCode : '';
        if (contactData.shippingCountryId == 229)
          shippingPostZipCode = strings.POBox + ': ' + shippingPostZipCode;
      } else {
        shippingPostZipCode = contactData.shippingPostZipCode
          ? contactData.shippingPostZipCode
          : '';
        if (contactData.shippingCountryId == 229)
          shippingPostZipCode = strings.POBox + ': ' + shippingPostZipCode;
      }
    }

    return shippingPostZipCode + ', ';
  };

  const renderShippingCity = () => {
    let shippingCity = '';
    if (invoiceData.changeShippingAddress && invoiceData.changeShippingAddress == true) {
      shippingCity = invoiceData.shippingCity ? invoiceData.shippingCity : '';
    } else {
      if (
        contactData &&
        contactData.isBillingAndShippingAddressSame &&
        contactData.isBillingAndShippingAddressSame == true
      )
        shippingCity = contactData.city ? contactData.city : '';
      else shippingCity = contactData.shippingCity ? contactData.shippingCity : '';
    }

    return (
      <div className="mb-1 ml-2">
        <b>{strings.City} : </b>
        {shippingCity}
      </div>
    );
  };

  const rendershippingCountry = () => {
    let shippingCountry = '';
    if (invoiceData.changeShippingAddress && invoiceData.changeShippingAddress == true) {
      shippingCountry = invoiceData.shippingCountryName ? invoiceData.shippingCountryName : '';
    } else {
      if (
        contactData &&
        contactData.isBillingAndShippingAddressSame &&
        contactData.isBillingAndShippingAddressSame == true
      )
        shippingCountry = contactData.billingCountryName ? contactData.billingCountryName : '';
      else shippingCountry = contactData.shippingCountryName ? contactData.shippingCountryName : '';
    }

    return shippingCountry;
  };

  const rendershippingState = () => {
    let shippingState = '';
    if (invoiceData.changeShippingAddress && invoiceData.changeShippingAddress == true) {
      shippingState = invoiceData.shippingStateName ? invoiceData.shippingStateName : '';
    } else {
      if (
        contactData &&
        contactData.isBillingAndShippingAddressSame &&
        contactData.isBillingAndShippingAddressSame == true
      )
        shippingState = contactData.billingStateName ? contactData.billingStateName : '';
      else shippingState = contactData.shippingStateName ? contactData.shippingStateName : '';
    }

    return shippingState + ', ';
  };

  const renderShippingDetails = () => {
    if (isBillingAndShippingAddressSame == false || invoiceData.changeShippingAddress == true)
      return (
        <div>
          <br />
          <h6 className="mb-1 ml-2">
            <b>{strings.ShipTo},</b>
          </h6>
          <br />
          {contactData && (
            <div className="mb-1 ml-2">
              <b>
                {contactData.organization
                  ? contactData.organization
                  : contactData.firstName + ' ' + contactData.lastName}
              </b>
            </div>
          )}
          {invoiceData && contactData && renderShippingAddress()}
          <div className="mb-1 ml-2">
            {invoiceData && contactData && renderShippingPostZipCode()}
            {invoiceData && contactData && rendershippingState()}
            {invoiceData && contactData && rendershippingCountry()}
          </div>
        </div>
      );
    else return '';
  };

  const companyMobileNumber = number => {
    let number1 = number.split(',');

    if (number1.length != 0) number1 = number1[0];
    return number1;
  };

  const renderExcise = item => {
    if (item.exciseTaxId && item.exciseTaxId == 1) {
      return '50 %';
    } else if (item.exciseTaxId && item.exciseTaxId == 2) {
      return '100 %';
    }
  };

  let currencyName = invoiceData.currencyName ? invoiceData.currencyName : 'UAE DIRHAM';

  return (
    <div>
      <Card id="singlePage" className="box">
        <CardBody style={{ margin: '1rem', border: 'solid 1px', borderColor: '#c8ced3' }}>
          <div
            style={{
              width: '100%',
              display: 'flex',
            }}
          >
            <div style={{ width: '50%', marginTop: '4.5rem', marginLeft: '3rem' }}>
              <div className="companyDetails">
                <img
                  src={
                    companyData && companyData.companyLogoByteArray
                      ? 'data:image/jpg;base64,' + companyData.companyLogoByteArray
                      : logo
                  }
                  className=""
                  alt=""
                  style={{ width: ' 300px' }}
                />
              </div>
            </div>
            <div
              style={{
                width: '70%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
              }}
            >
              <div
                style={{
                  width: '97%',
                  textAlign: 'right',
                }}
              >
                <div style={{ marginTop: '0.5rem' }}>
                  <h2 className="mb-1 ml-2">
                    <b>TAX Credit Note</b>
                  </h2>
                  <br />
                  <div className="mb-1 ml-2" style={{ fontSize: '22px' }}>
                    <b>{companyData.companyName}</b>
                  </div>
                  <div className="mb-1 ml-2">{companyData.companyAddressLine1}</div>
                  <div className="mb-1 ml-2">{companyData.companyAddressLine2}</div>
                  {companyData.companyCountryCode == 229 ? strings.POBox : ''}:{' '}
                  {companyData.companyPoBoxNumber},&nbsp;
                  {companyData &&
                    (companyData.companyStateName ? companyData.companyStateName + ', ' : '')}
                  {companyData &&
                    (companyData.companyCountryName ? companyData.companyCountryName : '')}
                  {companyData.companyRegistrationNumber && (
                    <div className="mb-1 ml-2">
                      {strings.CompanyRegistrationNo}: {companyData.companyRegistrationNumber}
                    </div>
                  )}
                  {companyData.isRegisteredVat == true && (
                    <div className="mb-1 ml-2">
                      {strings.VATRegistrationNo}: {companyData.vatRegistrationNumber}
                    </div>
                  )}
                  <div className="mb-1 ml-2">
                    {strings.MobileNumber}:{' '}
                    {companyMobileNumber(
                      companyData.phoneNumber ? '+' + companyData.phoneNumber : ''
                    )}
                  </div>
                  {companyData.emailAddress && (
                    <div className="mb-1 ml-2">Email: {companyData.emailAddress}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <hr />

          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                marginLeft: '2rem',
              }}
            >
              <div>
                <br />
                <h6 className="mb-1 ml-2">
                  <b>{strings.CreditTo},</b>
                </h6>
                <br />
                {contactData && (
                  <div className="mb-1 ml-2">
                    <b>
                      {contactData.organization
                        ? contactData.organization
                        : contactData.firstName + ' ' + contactData.lastName}
                    </b>
                  </div>
                )}
                {contactData && contactData.addressLine1 && (
                  <div className="mb-1 ml-2">{contactData.addressLine1}</div>
                )}

                <div className="mb-1 ml-2">
                  {invoiceData &&
                    contactData &&
                    (contactData.countryId == 229
                      ? contactData.poBoxNumber
                        ? strings.POBox + ': ' + contactData.poBoxNumber
                        : ''
                      : contactData.postZipCode
                        ? contactData.postZipCode
                        : '')}
                  ,&nbsp;
                  {invoiceData &&
                    contactData &&
                    (contactData.billingStateName ? contactData.billingStateName + ', ' : '')}
                  {invoiceData &&
                    contactData &&
                    (contactData.billingCountryName ? contactData.billingCountryName : '')}
                </div>
                {invoiceData &&
                  invoiceData.taxTreatment &&
                  invoiceData.taxTreatment.includes('NON') == false && (
                    <div className="mb-1 ml-2">
                      {strings.VATRegistrationNo}:{' '}
                      {contactData &&
                        contactData.vatRegistrationNumber &&
                        contactData.vatRegistrationNumber}
                    </div>
                  )}
                {contactData && contactData.mobileNumber && (
                  <div className="mb-1 ml-2">
                    {strings.MobileNumber}: +{contactData.mobileNumber}
                  </div>
                )}
                {contactData && contactData.billingEmail && (
                  <div className="mb-1 ml-2">
                    {strings.Email}: {contactData.billingEmail}
                  </div>
                )}
              </div>
              {renderShippingDetails()}
              <div style={{ width: '15%' }}></div>
            </div>
          </div>

          <div>
            <Table
              className="table-striped"
              style={{
                width: 'fit-content',
                border: '1px solid',
                borderColor: '#c8ced3',
                float: 'right',
                minWidth: '30%',
              }}
            >
              <thead className="header-row" style={{ fontSize: '12px' }}>
                <tr>
                  <th>{strings.CreditNoteNumber2}</th>
                  <th>{strings.CreditNoteDate2}</th>
                  <th>{strings.Status}</th>
                  {invoiceData.referenceNo && <th>{strings.ReferenceN}</th>}
                  {isCNWithoutProduct && (
                    <th style={{ textAlign: 'right' }}>{strings.CreditAmount}</th>
                  )}
                  <th>{strings.RemainingBalance}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{invoiceData.creditNoteNumber}</td>
                  <td> {dayjs(invoiceData.creditNoteDate).format('DD-MM-YYYY')}</td>
                  <td>
                    {invoiceData.status
                      ? invoiceData.status === 'Partially Paid'
                        ? 'Partially Credited'
                        : invoiceData.status
                      : ''}
                  </td>
                  {invoiceData.referenceNo && <td>{invoiceData.referenceNo}</td>}
                  {isCNWithoutProduct && (
                    <td style={{ textAlign: 'right' }}>
                      <Currency
                        value={invoiceData.totalAmount}
                        currencySymbol={currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'}
                      />
                    </td>
                  )}
                  <td style={{ textAlign: 'right' }}>
                    <Currency
                      value={invoiceData.dueAmount}
                      currencySymbol={currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
            <div className="text-right">
              {invoiceData.exchangeRate && invoiceData.exchangeRate > 1 ? (
                <>
                  <b>{strings.Exchangerate}:</b> {invoiceData.exchangeRate}
                </>
              ) : (
                ''
              )}
            </div>
          </div>

          {isCNWithoutProduct == false && (
            <>
              <hr />
              <Table className="table-striped">
                <thead className="header-row" style={{ fontSize: '12px' }}>
                  <tr>
                    <th className="center" style={{ padding: '0.5rem', width: '40px' }}>
                      #
                    </th>
                    <th style={{ padding: '0.5rem' }}>{strings.ProductNameAndDescription}</th>
                    <th className="text-center" style={{ padding: '0.5rem' }}>
                      {strings.Quantity}
                    </th>
                    <th className="text-center" style={{ padding: '0.5rem' }}>
                      {strings.UnitType}
                    </th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.UnitCost}</th>
                    {invoiceData.discount != 0 && (
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Discount}</th>
                    )}
                    {invoiceData.totalExciseTaxAmount != 0 && (
                      <>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.Excise}</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>
                          {strings.ExciseAmount}
                        </th>
                      </>
                    )}
                    {invoiceData.totalVatAmount != 0 && (
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.VatAmount}</th>
                    )}
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.SubTotal}</th>
                  </tr>
                </thead>
                <tbody className="table-hover">
                  {invoiceData.invoiceLineItems &&
                    invoiceData.invoiceLineItems.length &&
                    invoiceData.invoiceLineItems.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className="center">{index + 1}</td>
                          <td style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            <b>{item.productName}</b>
                            <br />
                            {item.description}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'center' }}>{item.unitType}</td>
                          <td style={{ textAlign: 'right', width: '10%' }}>
                            <Currency
                              value={item.unitPrice}
                              currencySymbol={
                                currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                              }
                            />
                          </td>
                          {invoiceData.discount != 0 && (
                            <>
                              <td style={{ textAlign: 'right' }}>
                                <Currency
                                  value={item.discount}
                                  currencySymbol={
                                    currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                  }
                                />
                              </td>
                            </>
                          )}
                          {invoiceData.totalExciseTaxAmount != 0 && (
                            <>
                              <td style={{ textAlign: 'right' }}>
                                {item.exciseTaxId ? renderExcise(item) : '-'}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {
                                  <Currency
                                    value={item.exciseAmount}
                                    currencySymbol={
                                      currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                    }
                                  />
                                }
                              </td>
                            </>
                          )}
                          {invoiceData.totalVatAmount != 0 && (
                            <td style={{ textAlign: 'right' }}>
                              <Currency
                                value={item.vatAmount}
                                currencySymbol={
                                  currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                }
                              />
                            </td>
                          )}
                          <td style={{ textAlign: 'right' }}>
                            <Currency
                              value={item.subTotal}
                              currencySymbol={
                                currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </>
          )}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
            }}
          >
            <div
              style={{
                width: '40%',
                display: 'flex',
                flexDirection: 'column',
                marginLeft: '2rem',
              }}
            >
              <br />

              {invoiceData.notes && (
                <>
                  <h6 className="mb-0 pt-2">
                    <b>{strings.RefundNotes}:</b>
                  </h6>
                  <br />
                  <textarea
                    className="mb-0"
                    style={{ width: '500px', height: '200px', border: 'none' }}
                    value={invoiceData.notes}
                    readOnly
                  />
                </>
              )}
            </div>
            <div
              style={{
                width: '40%',
                display: 'flex',
                justifyContent: 'space-between',
                marginRight: '1rem',
              }}
            >
              <div style={{ width: '250px', marginLeft: 'auto' }}>
                <Table className="table-clear cal-table">
                  <tbody>
                    {isCNWithoutProduct == false &&
                    invoiceData.discount &&
                    invoiceData.discount > 0 ? (
                      <tr>
                        <td style={{ width: '40%' }}>
                          <strong>
                            {strings.Discount}
                            {invoiceData.discountPercentage
                              ? `(${invoiceData.discountPercentage}%)`
                              : ''}
                          </strong>
                        </td>
                        <td
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ marginLeft: '2rem' }}></span>
                          <span>
                            {invoiceData.discount ? (
                              <Currency
                                value={
                                  invoiceData.discount
                                    ? +invoiceData.discount
                                    : invoiceData.discount
                                }
                                currencySymbol={
                                  currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                }
                              />
                            ) : (
                              <Currency
                                value={0}
                                currencySymbol={
                                  currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                }
                              />
                            )}
                          </span>
                        </td>
                      </tr>
                    ) : (
                      ''
                    )}

                    <tr>
                      {!isCNWithoutProduct && (
                        <>
                          <td style={{ width: '40%' }}>
                            <strong>{strings.TotalNet}</strong>
                          </td>
                          <td style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ marginLeft: '2rem' }}></span>
                            <span>
                              {totalNet ? (
                                <Currency
                                  value={
                                    totalNet -
                                    invoiceData.totalVatAmount -
                                    invoiceData.totalExciseTaxAmount
                                  }
                                  currencySymbol={
                                    currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                  }
                                />
                              ) : (
                                <Currency
                                  value={0}
                                  currencySymbol={
                                    currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                  }
                                />
                              )}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>

                    {!isCNWithoutProduct && invoiceData.totalExciseTaxAmount > 0 && (
                      <tr>
                        <td style={{ width: '40%' }}>
                          <strong>{strings.Excise}</strong>
                        </td>
                        <td
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ marginLeft: '2rem' }}></span>
                          <span>
                            {invoiceData.totalExciseTaxAmount ? (
                              <Currency
                                value={invoiceData.totalExciseTaxAmount}
                                currencySymbol={
                                  currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                }
                              />
                            ) : (
                              <Currency
                                value={0}
                                currencySymbol={
                                  currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                }
                              />
                            )}
                          </span>
                        </td>
                      </tr>
                    )}

                    {!isCNWithoutProduct && (
                      <tr>
                        <td style={{ width: '40%' }}>
                          <strong>{strings.VAT}</strong>
                        </td>
                        <td
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ marginLeft: '2rem' }}></span>
                          <span>
                            {invoiceData.totalVatAmount ? (
                              <Currency
                                value={invoiceData.totalVatAmount}
                                currencySymbol={
                                  currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                }
                              />
                            ) : (
                              <Currency
                                value={0}
                                currencySymbol={
                                  currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                                }
                              />
                            )}
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr style={{ border: '1px solid rgb(200, 206, 211)' }}>
                      <td style={{ width: '40%' }}>
                        <strong>{strings.Total}</strong>
                      </td>
                      <td
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ marginLeft: '2rem' }}></span>
                        <span>
                          {invoiceData.totalAmount ? (
                            <Currency
                              value={invoiceData.totalAmount}
                              currencySymbol={
                                currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                              }
                            />
                          ) : (
                            <Currency
                              value={0}
                              currencySymbol={
                                currencyData[0] ? currencyData[0].currencyIsoCode : 'USD'
                              }
                            />
                          )}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
          <hr />
          <Input
            type="textarea"
            disabled
            className="textarea viewFootNote"
            maxLength="250"
            style={{ width: '1100px' }}
            value={invoiceData.footNote}
          />
          <br />
          <br />
          <br />
        </CardBody>
        <img className="footer" src={footer} style={{ height: '65px', width: '100%' }}></img>
      </Card>
    </div>
  );
};

export default InvoiceTemplate;
