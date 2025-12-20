import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	CardBody,
	ModalHeader,
} from 'reactstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { toast } from 'sonner';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import { Loader } from 'components';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import * as VatReportActions from '../actions';

const mapStateToProps = (state) => {
	return {
		contact_list: state.request_for_quotation.contact_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
		vatReportActions: bindActionCreators(VatReportActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);

const GenerateVatReportModal = (props) => {
	const { openModal, closeModal, monthOption, setState, state, vatReportDataList } = props;

	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [monthlyDate, setMonthlyDate] = useState(null);
	const [VRN, setVRN] = useState('');

	strings.setLanguage(language);

	const getStartDate = () => {
		if (monthlyDate) {
			return dayjs(monthlyDate).format('DD-MM-YYYY');
		}
		return '';
	};

	const getEndDate = () => {
		if (monthlyDate) {
			if (monthOption.value === 0) {
				return dayjs(monthlyDate)
					.add(1, 'month')
					.subtract(1, 'day')
					.format('DD-MM-YYYY');
			} else if (monthOption.value === 2) {
				return dayjs(monthlyDate)
					.add(3, 'month')
					.subtract(1, 'day')
					.format('DD-MM-YYYY');
			}
		}
		return '';
	};

	const generateReport = () => {
		let notGenerated = true;
		vatReportDataList.data.map(({ taxReturns }) => {
			let dateArr = taxReturns ? taxReturns.split('-') : [];
			let currentStartDate = dayjs(getStartDate());
			let currentEndDate = dayjs(getEndDate(), 'DD-MM-YYYY');
			let startDate = dayjs(dateArr[0]);
			let endDate = dayjs(dateArr[1], 'DD/MM/YYYY');

			if (
				currentStartDate.diff(startDate, 'days') === 0 ||
				currentEndDate.diff(endDate, 'days') === 0 ||
				(currentStartDate.diff(startDate, 'days') >= 0 &&
					currentEndDate.diff(endDate, 'days') <= 0)
			) {
				notGenerated = false;
			}
		});

		if (!notGenerated) {
			return props.commonActions.tostifyAlert('error', 'VAT Report is Already generated');
		}

		setDisabled(true);
		const postData = {
			vrn: VRN,
			startDate: getStartDate().replaceAll('-', '/'),
			endDate: getEndDate().replaceAll('-', '/'),
		};

		props.vatReportActions
			.generateReport(postData)
			.then((res) => {
				if (res.status === 200) {
					props.commonActions.tostifyAlert(
						'success',
						res.data && res.data.message
							? res.data.message
							: 'VAT Report Generated Successfully'
					);
				}
				closeModal(false);
			})
			.catch((err) => {
				props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong'
				);
				closeModal(false);
			});
	};

	return (
		<div className="contact-modal-screen">
			<Modal isOpen={openModal} className="modal-success contact-modal">
				<ModalHeader>
					<Row>
						<Col lg={12}>
							<div className="h4 mb-0 d-flex align-items-center">
								<i className="nav-icon fas fa-user-tie" />
								<span className="ml-2">{strings.GenerateVATReport}</span>
							</div>
						</Col>
					</Row>
				</ModalHeader>
				<ModalBody style={{ padding: '15px 0px 0px 0px' }}>
					<div style={{ padding: ' 0px 1px' }}>
						<div>
							<CardBody>
								{loading ? (
									<Row>
										<Col lg={12}>
											<Loader />
										</Col>
									</Row>
								) : (
									<Form>
										<Row>
											<Col lg={4} className=" pull-right ">
												<Label>
													<span className="text-danger">* </span>
													{strings.ReportingPeriod}
												</Label>
												<Select
													options={state.options}
													id="option"
													name="option"
													value={state.monthOption}
													placeholder="VAT Reporting Period"
													onChange={(e) => {
														setState({
															enbaleReportGeneration: true,
															monthOption: e,
														});
													}}
												/>
											</Col>

											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="startDate">
														<span className="text-danger">* </span>
														{strings.GenerateVATReportFor}
													</Label>
													<b>
														<DatePicker
															selected={monthlyDate}
															onChange={(date) => {
																setMonthlyDate(date);
															}}
															selectsStart
															dateFormat="MMMM - yyyy"
															minDate={new Date('01/01/2018')}
															showMonthYearPicker
															withPortal
															placeholderText="Select Month"
															portalId="root-portal"
															className="text-center"
														/>
													</b>
												</FormGroup>
											</Col>

											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="startDate">{strings.VATReportNumber}</Label>
													<Input
														value={VRN}
														name="VRN"
														id="VRN"
														onChange={(e) => {
															setVRN(e.target.value);
														}}
														placeholder={strings.Enter + strings.VATReportNumber}
													/>
												</FormGroup>
											</Col>
										</Row>
										<Row style={{ marginTop: 20 }}>
											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="startDate">{strings.StartDate}</Label>
													<Input
														value={getStartDate()}
														placeholder="Select Month For Start Date"
														disabled
													/>
												</FormGroup>
											</Col>
											<Col lg={4}>
												<FormGroup className="mb-3">
													<Label htmlFor="endDate">{strings.EndDate}</Label>
													<Input
														value={getEndDate()}
														placeholder="Select Month For End Date"
														disabled
													/>
												</FormGroup>
											</Col>
										</Row>
									</Form>
								)}
							</CardBody>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Row className="mb-4 ">
						<Col>
							<Button
								color="primary"
								className="btn-square "
								title={monthlyDate ? '' : 'Please Select Month'}
								onClick={generateReport}
								disabled={monthOption === '' || !monthlyDate}
							>
								<i className="fas fa-check-double mr-1"></i>
								Generate
							</Button>
							<Button
								color="secondary"
								className="btn-square"
								onClick={() => {
									closeModal(false);
								}}
							>
								<i className="fa fa-ban"></i> {strings.Cancel}
							</Button>
						</Col>
					</Row>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(GenerateVatReportModal);
