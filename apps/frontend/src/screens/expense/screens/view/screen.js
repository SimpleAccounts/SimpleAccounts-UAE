import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'reactstrap';
import * as ExpenseDetailsAction from '../detail/actions';
import * as ExpenseActions from '../../actions';
import ReactToPrint from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import './style.scss';
import { ExpenseTemplate } from './sections/';
import ActionButtons from 'components/view_actions_buttons';
import { InvoiceViewJournalEntries, } from 'components';
import { StatusActionList } from 'utils';

const mapStateToProps = (state) => {
	return {
		expense_detail: state.expense.expense_detail,
		profile: state.auth.profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		expenseActions: bindActionCreators(
			ExpenseActions,
			dispatch,
		),
		expenseDetailsAction: bindActionCreators(
			ExpenseDetailsAction,
			dispatch,
		),
		
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ViewExpense extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			expenseData: {},
			id: this.props.location?.state?.expenseId,
			expenseId: this.props?.location?.state?.id,
			expenseStatus: '',
		};

		this.formRef = React.createRef();
		this.termList = [
			{ label: 'Net 7', value: 'NET_7' },
			{ label: 'Net 10', value: 'NET_10' },
			{ label: 'Net 30', value: 'NET_30' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		
		this.props.expenseActions
				.getCompanyDetails()
				.then((res) => {
					
					if (res.status === 200) {
						
						this.setState(
							{
								companyData: res.data,							
							},
						
						);
					}
				});
		if (this.props.location.state && this.props.location.state.expenseId) {
			console.log(this.props.location.state.expenseId)
			this.props.expenseDetailsAction
				.getExpenseDetail(this.props.location.state.expenseId)
				.then((res) => {
		
					if (res.status === 200) {
						const invoiceData = res.data;
                        const invoiceStatus = invoiceData.expenseStatus ?? '';
                        var actionList = StatusActionList.ExpenseStatusActionList;
                        if (invoiceStatus && actionList && actionList.length > 0) {
                            const statuslist = actionList.find(obj => obj.status === invoiceStatus);
                            actionList = statuslist ? statuslist.list : [];
                        }
						
						
						this.setState(
							{
								expenseData: {id:this.props.location.state.expenseId,...res.data},                              
                                expenseId: this.props.location.state.expenseId,
                                actionList: actionList,
								expenseStatus: res.data.expenseStatus
							},
						);
					}
				});
		}
	};

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		const { expenseData, invoiceData, actionList, invoiceStatus, expenseStatus, id } = this.state;
		const { profile } = this.props;
		return (
			<div className="view-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
						<div className="pull-left">
						<ActionButtons
                                    id={this.props.location.state.expenseId}
                                    history={this.props.history}
                                    URL={'/admin/expense/expense'}
                                    invoiceData={expenseData}
                                    postingRefType={'EXPENSE'}
                                    initializeData={() => {
                                        this.initializeData();
                                    }}
                                    actionList={actionList}
                                    invoiceStatus={invoiceStatus}
                                    documentTitle={"Expense"}
                                    documentCreated={false} // Any Further document against this document is created(e.g.  CN,DN,CI,...)
                                />
                                </div>
							<div className="pull-right">
						
								<Button
									className="btn-lg mb-1 print-btn-cont"
									onClick={() => {
										this.exportPDFWithComponent();
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
									content={() => this.componentRef}
								/>

								<Button
									className="close-btn mb-1 btn-lg print-btn-cont"
									onClick={() => {
										if(this.props.location?.state?.crossLinked==true){
											this.props.history.push('/admin/report/vatreports/vatreturnsubreports',{
												boxNo:this.props.location.state.description,
												description:this.props.location.state.description,
												startDate:this.props.location.state.startDate,
												endDate:this.props.location.state.endDate,
												placeOfSupplyId:this.props.location.state.placeOfSupplyId
											});
										} else if (this.props.location && this.props.location.state && this.props.location.state.gotoReports) {
											this.props.history.push(this.props.location.state.gotoReports)
										}else if (this.props.location && this.props.location.state && this.props.location.state.gotoDGLReport)
											this.props.history.push('/admin/report/detailed-general-ledger');
										else{
											this.props.history.push('/admin/expense');
										}
									}}
								>
									<i className="fas fa-times"></i>
								</Button>
							</div>
							<div>
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
									fileName="Expense.pdf"
								>
									<ExpenseTemplate
										expenseData={expenseData}
										companyData={this.state && this.state.companyData ?this.state.companyData:''}
										ref={(el) => (this.componentRef = el)}								
									/>
								</PDFExport>
							</div>
							<div>
								{expenseStatus && expenseStatus !== 'Draft' &&
									<InvoiceViewJournalEntries
										history={this.props.history}
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
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewExpense);
