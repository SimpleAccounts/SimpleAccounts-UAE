import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'reactstrap';
import * as ExpenseDetailsAction from '../detail/actions';
import * as ExpenseActions from '../../actions';
import ReactToPrint from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import { ExpenseTemplate } from './sections/';
import ActionButtons from 'components/view_actions_buttons';
import { InvoiceViewJournalEntries } from 'components';
import { StatusActionList } from 'utils';

const mapStateToProps = (state) => {
	return {
		expense_detail: state.expense.expense_detail,
		profile: state.auth.profile,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		expenseActions: bindActionCreators(ExpenseActions, dispatch),
		expenseDetailsAction: bindActionCreators(ExpenseDetailsAction, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

const ViewExpense = (props) => {
	const [expenseData, setExpenseData] = useState({});
	const [id] = useState(props.location?.state?.expenseId);
	const [expenseId, setExpenseId] = useState(props?.location?.state?.id);
	const [expenseStatus, setExpenseStatus] = useState('');
	const [actionList, setActionList] = useState([]);
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
		props.expenseActions
			.getCompanyDetails()
			.then((res) => {
				if (res.status === 200) {
					setCompanyData(res.data);
				}
			});

		if (props.location.state && props.location.state.expenseId) {
			console.log(props.location.state.expenseId);
			props.expenseDetailsAction
				.getExpenseDetail(props.location.state.expenseId)
				.then((res) => {
					if (res.status === 200) {
						const data = res.data;
						const status = data.expenseStatus ?? '';
						let statusActionList = StatusActionList.ExpenseStatusActionList;
						if (status && statusActionList && statusActionList.length > 0) {
							const statuslist = statusActionList.find(obj => obj.status === status);
							statusActionList = statuslist ? statuslist.list : [];
						}

						setExpenseData({ id: props.location.state.expenseId, ...res.data });
						setExpenseId(props.location.state.expenseId);
						setActionList(statusActionList);
						setExpenseStatus(res.data.expenseStatus);
					}
				});
		}
	};

	const exportPDFWithComponent = () => {
		pdfExportComponent.current.save();
	};

	return (
		<div className="view-invoice-screen">
			<div className="animated fadeIn">
				<Row>
					<Col lg={12} className="mx-auto">
						<div className="pull-left">
							<ActionButtons
								id={props.location.state.expenseId}
								history={props.history}
								URL={'/admin/expense/expense'}
								invoiceData={expenseData}
								postingRefType={'EXPENSE'}
								initializeData={() => {
									initializeData();
								}}
								actionList={actionList}
								invoiceStatus={expenseStatus}
								documentTitle={"Expense"}
								documentCreated={false}
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
									<Button
										type="button"
										className="ml-1 mb-1 mr-1 print-btn-cont btn-lg"
										onClick={() => window.print()}
									>
										<i className="fa fa-print"></i>
									</Button>
								)}
								content={() => componentRef.current}
							/>
							<Button
								className="close-btn mb-1 btn-lg print-btn-cont"
								onClick={() => {
									if (props.location?.state?.crossLinked === true) {
										props.history.push('/admin/report/vatreports/vatreturnsubreports', {
											boxNo: props.location.state.description,
											description: props.location.state.description,
											startDate: props.location.state.startDate,
											endDate: props.location.state.endDate,
											placeOfSupplyId: props.location.state.placeOfSupplyId
										});
									} else if (props.location && props.location.state && props.location.state.gotoReports) {
										props.history.push(props.location.state.gotoReports);
									} else if (props.location && props.location.state && props.location.state.gotoDGLReport) {
										props.history.push('/admin/report/detailed-general-ledger');
									} else {
										props.history.push('/admin/expense');
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
								fileName="Expense.pdf"
							>
								<ExpenseTemplate
									expenseData={expenseData}
									companyData={companyData}
									ref={componentRef}
								/>
							</PDFExport>
						</div>
						<div>
							{expenseStatus && expenseStatus !== 'Draft' &&
								<InvoiceViewJournalEntries
									history={props.history}
									invoiceURL={'/admin/expense/expense/view'}
									invoiceId={id}
									invoiceType={3}
								/>
							}
						</div>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewExpense);
