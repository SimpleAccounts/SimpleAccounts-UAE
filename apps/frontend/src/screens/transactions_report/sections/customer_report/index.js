import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	FormGroup,
	Form,
	Badge,
	Row,
	Col,
	Input,
	Button,
	ButtonGroup,
} from 'reactstrap';

import Select from 'react-select';
import * as customerReportData from '../../actions';

import { DateRangePicker2 } from 'components';
import moment from 'moment';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DateRangePicker from 'react-bootstrap-daterangepicker';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-toastify/dist/ReactToastify.css';
// import 'react-select/dist/react-select.css'
import 'bootstrap-daterangepicker/daterangepicker.css';
import 'bootstrap/dist/css/bootstrap.css';
import './style.scss';
import { selectOptionsFactory } from 'utils';

const mapStateToProps = (state) => {
	return {
		customer_invoice_report: state.transaction_data.customer_invoice_report,
		contact_list: state.transaction_data.contact_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		customerReportData: bindActionCreators(customerReportData, dispatch),
	};
};

const ranges = {
	'This Week': [moment().startOf('week'), moment().endOf('week')],
	'This Month': [moment().startOf('month'), moment().endOf('month')],
	'Last 7 Days': [moment().subtract(6, 'days'), moment()],
	'Last 30 Days': [moment().subtract(29, 'days'), moment()],
	'Last Month': [
		moment().subtract(1, 'month').startOf('month'),
		moment().subtract(1, 'month').endOf('month'),
	],
};

class CustomerReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedOption: '',
			filter_refNumber: '',
			filter_contactName: '',
			payment_date: '',
			startDate: '',
			endDate: '',
			currentData: {},
			currentDate: {},
		};
	}
	componentDidMount = () => {
		this.getCustomerInvoice();
	};
	getCustomerInvoice = () => {
		//this.props.customerReportData.getCustomerInvoiceReport();
		//this.props.customerReportData.getContactNameList();
	};

	// handleChange(selectedOption) {
	//   this.setState({ selectedOption })
	// }

	getInvoiceStatus = (cell, row) => {
		return <Badge color={cell === 'Paid' ? 'success' : 'danger'}>{cell}</Badge>;
	};

	getSelectedData = () => {
		const postObj = {
			startDate: this.state.startDate !== '' ? this.state.startDate : '',
			endDate: this.state.endDate !== '' ? this.state.endDate : '',
			contactName:
				this.state.filter_contactName !== ''
					? this.state.filter_contactName
					: '',
			refNumber:
				this.state.filter_refNumber !== '' ? this.state.filter_refNumber : '',
		};
		this.props.customerReportData.getCustomerInvoiceReport(postObj);
	};

	inputHandler = (key, value) => {
		this.setState({
			[key]: value,
		});
	};

	handleEvent = (event, picker) => {
		// alert(picker.minDate, picker.maxDate)
	};

	handleChange = (e, picker) => {
		let startingDate = picker ? moment(picker.startDate._d).format('L') : '';
		let endingDate = picker ? moment(picker.endDate._d).format('L') : '';
		this.setState({ startDate: startingDate, endDate: endingDate });
	};

	render() {
		const customerInvoice = this.props.customer_invoice_report
			? this.props.customer_invoice_report.map((customer) => ({
					status: customer.status,
					referenceNumber: customer.refNumber,
					date: moment(customer.invoiceDate).format('L'),
					dueDate: moment(customer.invoiceDueDate).format('L'),
					contactName: customer.contactName,
					numberOfItems: customer.noOfItem,
					totalCost: customer.totalCost,
			  }))
			: '';

		const { contact_list } = this.props;

		return (
			<div className="invoice-report-section">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12}>
							<div className="flex-wrap d-flex align-items-start justify-content-between">
								<div className="info-block">
									<h4>
										Company Name -{' '}
										<small>
											<i>Invoices</i>
										</small>
									</h4>
								</div>
								<Form onSubmit={this.handleSubmit} name="simpleForm">
									<div className="flex-wrap d-flex align-items-center">
										<FormGroup>
											<ButtonGroup className="mr-3">
												<Button
													color="success"
													className="btn-square"
													onClick={() => this.table.handleExportCSV()}
												>
													<i className="fa glyphicon glyphicon-export fa-download mr-1" />
													Export to CSV
												</Button>
											</ButtonGroup>
										</FormGroup>
										<FormGroup>
											<div className="date-range">
												<DateRangePicker2 ranges={ranges} opens={'left'} />
											</div>
										</FormGroup>
									</div>
								</Form>
							</div>
							<div className="py-3">
								<h5>Filter : </h5>
								<Row>
									<Col lg={2} className="mb-1">
										<Input
											type="text"
											placeholder="Ref. Number"
											value={this.state.filter_refNumber}
											onChange={(e) =>
												this.inputHandler('filter_refNumber', e.target.value)
											}
										/>
									</Col>
									<Col lg={2} className="mb-1">
										<DateRangePicker
											id="payment_date"
											name="payment_date"
											// onChange={(option) => this.handleChange('payment_date')(option)}

											onApply={this.handleChange}
										>
											<Input
												type="text"
												value={this.state.startDate}
												selected={this.state.startDate}
												placeholder="Start Date"
											/>
										</DateRangePicker>
									</Col>
									<Col lg={2} className="mb-1">
										{/* <DateRangePicker> */}
										<Input
											type="number"
min="0"
											value={this.state.endDate}
											selected={this.state.endDate}
											placeholder="End Date"
										/>
										{/* </DateRangePicker> */}
									</Col>
									<Col lg={2} className="mb-1">
										{/* <Input type="text" placeholder="Contact Name" /> */}
										<Select
											className=""
											// options={accountOptions}
											options={
												contact_list
													? selectOptionsFactory.renderOptions(
															'firstName',
															'contactId',
															contact_list,
													  )
													: []
											}
											value={this.state.filter_contactName}
											onChange={(option) =>
												this.setState({
													filter_contactName: option,
												})
											}
											placeholder="contact Name"
											// onChange={this.changeType}
										/>
									</Col>
									<Col lg={2} className="mb-1">
										<Button
											color="secondary"
											className="btn-square"
											type="submit"
											name="submit"
											onClick={this.getSelectedData}
										>
											<i className="fa glyphicon glyphicon-export fa-search mr-1" />
											Search
										</Button>
									</Col>
								</Row>
							</div>
							<div className="table-wrapper">
								<BootstrapTable
									data={customerInvoice}
									hover
									pagination={
										customerInvoice && customerInvoice.length > 0 ? true : false
									}
									fetchInfo={{
										dataTotalSize: customerInvoice.count
											? customerInvoice.count
											: 0,
									}}
									csvFileName="customerInvoice.csv"
									ref={(node) => {
										this.table = node;
									}}
									filter={true}
									responsive={true}
									version="4"
								>
									<TableHeaderColumn
										width="130"
										dataField="status"
										dataFormat={this.getInvoiceStatus}
									>
										Status
									</TableHeaderColumn>
									<TableHeaderColumn isKey dataField="referenceNumber" dataSort>
										Ref. Number
									</TableHeaderColumn>
									<TableHeaderColumn dataField="date" dataSort>
										Date
									</TableHeaderColumn>
									<TableHeaderColumn dataField="dueDate" dataSort>
										Due Date
									</TableHeaderColumn>
									<TableHeaderColumn dataField="contactName" dataSort>
										Contact Name
									</TableHeaderColumn>
									<TableHeaderColumn dataField="numberOfItems" dataSort>
										No. of Items
									</TableHeaderColumn>
									<TableHeaderColumn dataField="totalCost" dataSort>
										Total Cost
									</TableHeaderColumn>
								</BootstrapTable>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerReport);
