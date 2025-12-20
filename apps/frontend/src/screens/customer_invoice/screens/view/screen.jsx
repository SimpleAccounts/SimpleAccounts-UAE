import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col, Card, Table } from 'reactstrap';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import ReactToPrint from 'react-to-print';
import { CommonActions } from 'services/global';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import { InvoiceTemplate } from './sections';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Currency, InvoiceViewJournalEntries } from 'components';
import ActionButtons from 'components/view_actions_buttons';
import { StatusActionList } from 'utils';
import dayjs from '@/utils/date';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		supplierInvoiceActions: bindActionCreators(SupplierInvoiceActions, dispatch),
		supplierInvoiceDetailActions: bindActionCreators(SupplierInvoiceDetailActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

const strings = new LocalizedStrings(data);

const ViewCustomerInvoice = (props) => {
	const [language] = useState(window.localStorage.getItem('language'));
	const [invoiceData, setInvoiceData] = useState({});
	const [isBillingAndShippingAddressSame, setIsBillingAndShippingAddressSame] = useState(false);
	const [totalNet, setTotalNet] = useState(0);
	const [currencyData, setCurrencyData] = useState({});
	const [invoiceStatus, setInvoiceStatus] = useState('');
	const [id] = useState(props.location?.state?.id);
	const [creditNoteDataList, setCreditNoteDataList] = useState([]);
	const [actionList, setActionList] = useState([]);
	const [contactData, setContactData] = useState({});
	const [companyData, setCompanyData] = useState({});

	const pdfExportComponent = useRef(null);
	const componentRef = useRef(null);

	const termList = [
		{ label: 'Net 7', value: 'NET_7' },
		{ label: 'Net 10', value: 'NET_10' },
		{ label: 'Net 30', value: 'NET_30' },
		{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
	];

	useEffect(() => {
		initializeData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const initializeData = () => {
		props.supplierInvoiceDetailActions
			.getCompanyDetails()
			.then((res) => {
				if (res.status === 200) {
					setCompanyData(res.data);
				}
			});

		if (props.location.state && props.location.state.id) {
			props.supplierInvoiceDetailActions
				.getInvoiceById(props.location.state.id)
				.then((res) => {
					let val = 0;
					if (!props.location.state.contactId)
						props.supplierInvoiceDetailActions
							.getContactById(res.data.contactId)
							.then((res) => {
								if (res.status === 200) {
									setContactData(res.data);
									setIsBillingAndShippingAddressSame(res.data.isBillingAndShippingAddressSame);
								}
							});
					const status = res.data.status ? (res.data.status.includes('Due') ? 'Due' : res.data.status) : '';
					let statusActionList = StatusActionList.InvoiceStatusActionList;
					if (status && statusActionList && statusActionList.length > 0) {
						const statuslist = statusActionList.find(obj => obj.status === status);
						statusActionList = statuslist ? statuslist.list : [];
					}

					setInvoiceData(res.data);
					setInvoiceStatus(status);
					setActionList(statusActionList);

					if (res.data.contactId) {
						props.supplierInvoiceDetailActions
							.getContactById(res.data.contactId)
							.then((res) => {
								if (res.status === 200) {
									setContactData(res.data);
									setIsBillingAndShippingAddressSame(res.data.isBillingAndShippingAddressSame);
								}
							});
					}

					if (res.status === 200) {
						res.data.invoiceLineItems &&
							res.data.invoiceLineItems.map((item) => {
								val = val + item.subTotal;
								return item;
							});

						setTotalNet(val);

						if (res.data.currencyCode) {
							props.supplierInvoiceActions
								.getCurrencyList()
								.then((res) => {
									if (res.status === 200) {
										const temp = res.data.filter(
											(item) =>
												item.currencyCode === invoiceData.currencyCode,
										);
										setCurrencyData(temp);
									}
								});
						}
					}
				});

			if (props.location.state.contactId)
				props.supplierInvoiceDetailActions
					.getContactById(props.location.state.contactId)
					.then((res) => {
						if (res.status === 200) {
							setContactData(res.data);
							setIsBillingAndShippingAddressSame(res.data.isBillingAndShippingAddressSame);
						}
					});

			props.commonActions
				.getByNoteListByInvoiceId(props.location.state.id)
				.then((res) => {
					if (res.status === 200) {
						setCreditNoteDataList(res.data);
					}
				});
		}
	};

	const exportPDFWithComponent = () => {
		pdfExportComponent.current.save();
	};

	const redirectToCreditNote = (creditNote) => {
		const commonParams = {
			CI_id: props.location.state.id,
			CI_status: props.location.state.status,
			CI_contactId: props.location.state.contactId,
			id: creditNote.creditNoteId,
			isCNWithoutProduct: creditNote.isCreatedWithoutInvoice,
			status: creditNote.status,
		};
		if (props.location.state && props.location.state.gotoReports) {
			commonParams.gotoReports = true;
		}
		props.history.push('/admin/income/credit-notes/view', commonParams);
	};

	strings.setLanguage(language);

	return (
		<div className="view-invoice-screen">
			<div className="animated fadeIn">
				<Row>
					<Col lg={12} className="mx-auto">
						<div className='pull-left'>
							<ActionButtons
								id={id}
								history={props.history}
								URL={'/admin/income/customer-invoice'}
								invoiceData={invoiceData}
								postingRefType={'INVOICE'}
								initializeData={() => {
									initializeData();
								}}
								actionList={actionList}
								invoiceStatus={invoiceStatus}
								documentTitle={strings.CustomerInvoice}
								documentCreated={creditNoteDataList && creditNoteDataList.creditNoteId}
							/>
						</div>
						<div className="pull-right">
							<Button
								className="btn-lg mb-1 print-btn-cont"
								onClick={() => {
									exportPDFWithComponent();
								}}
							>
								<i className="fa fa-file-pdf-o"></i>
							</Button>
							<ReactToPrint
								trigger={() => (
									<Button type="button" className="ml-1 mb-1 mr-1 print-btn-cont btn-lg">
										<i className="fa fa-print"></i>
									</Button>
								)}
								content={() => componentRef.current}
							/>
							<Button
								type="button"
								className="close-btn mb-1 btn-lg print-btn-cont"
								onClick={() => {
									if (props.location && props.location.state && props.location.state.gotoReports) {
										props.history.push(props.location.state.gotoReports);
									} else if (props.location.state.TCN_Id) {
										props.history.push('/admin/income/credit-notes/view', {
											id: props.location.state.TCN_Id,
											status: props.location.state.TCN_Status,
											isCNWithoutProduct: props.location.state.TCN_WithoutPRoduct
										});
									} else if (props.location.state && props.location.state.crossLinked &&
										props.location.state.crossLinked === true) {
										props.history.push('/admin/report/vatreports/vatreturnsubreports', {
											boxNo: props.location.state.description,
											description: props.location.state.description,
											startDate: props.location.state.startDate,
											endDate: props.location.state.endDate,
											placeOfSupplyId: props.location.state.placeOfSupplyId
										});
									} else if (props.location && props.location.state && props.location.state.gotoDGLReport) {
										props.history.push('/admin/report/detailed-general-ledger');
									} else {
										props.history.push('/admin/income/customer-invoice');
									}
								}}
							>
								<i className="fas fa-times"></i>
							</Button>
						</div>
						<div>
							<PDFExport
								ref={pdfExportComponent}
								scale={0.8}
								paperSize="A3"
								fileName={invoiceData.referenceNumber + ".pdf"}
							>
								<InvoiceTemplate
									invoiceData={invoiceData}
									contactData={contactData}
									isBillingAndShippingAddressSame={isBillingAndShippingAddressSame}
									status={props.location.state?.status}
									currencyData={currencyData}
									ref={componentRef}
									totalNet={totalNet}
									companyData={companyData}
								/>
							</PDFExport>
						</div>
					</Col>
				</Row>
				<div style={{ display: creditNoteDataList.creditNoteId ? '' : 'none' }}>
					<strong>{strings.CreditNoteIssuedonCustomerInvoice}</strong>
				</div>
				<Card>
					<div style={{ display: creditNoteDataList.creditNoteId ? '' : 'none' }}>
						<Table>
							<thead style={{ backgroundColor: '#2064d8', color: 'white' }}>
								<tr>
									<th className="center" style={{ padding: '0.5rem' }}>#</th>
									<th style={{ padding: '0.5rem' }}>{strings.CreditNoteNumber}</th>
									<th style={{ padding: '0.5rem' }}>{strings.CreditNoteDate}</th>
									<th style={{ padding: '0.5rem' }}>{strings.Status}</th>
									<th style={{ padding: '0.5rem', textAlign: 'right' }}>{strings.CreditAmount}</th>
								</tr>
							</thead>
							<tbody className=" table-bordered table-hover">
								<tr onClick={() => {
									redirectToCreditNote(creditNoteDataList);
								}}>
									<td className="center">{1}</td>
									<td style={{ color: 'blue' }}>{creditNoteDataList.creditNoteNumber}</td>
									<td>{creditNoteDataList.creditNoteDate ? dayjs(creditNoteDataList.creditNoteDate).format('DD-MM-YYYY') : ''}</td>
									<td align="right">{creditNoteDataList?.status}</td>
									<td align="right">
										{creditNoteDataList.totalAmount ? <Currency
											value={creditNoteDataList.totalAmount}
											currencySymbol={
												currencyData[0]
													? currencyData[0].currencyIsoCode
													: 'AED'
											}
										/> : '0.00'}
									</td>
								</tr>
							</tbody>
						</Table>
					</div>
				</Card>
				<div>
					{invoiceStatus && invoiceStatus !== 'Draft' &&
						<InvoiceViewJournalEntries
							history={props.history}
							invoiceURL={'/admin/income/customer-invoice/view'}
							invoiceId={id}
							invoiceType={2}
						/>
					}
				</div>
			</div>
		</div>
	);
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(ViewCustomerInvoice);
