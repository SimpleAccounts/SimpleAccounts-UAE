import React, { useState, useEffect, useRef } from 'react';
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
	ModalHeader,
} from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import * as CTReportActions from '../actions';
import dayjs from '@/utils/date';

const mapStateToProps = (state) => {
	return {
		contact_list: state.request_for_quotation.contact_list,
		payroll_employee_list: state.payrollEmployee.payroll_employee_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
		ctReportActions: bindActionCreators(CTReportActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const fileCtReportSchema = z.object({
	taxFiledOn: z.union([z.string(), z.date()]).optional(),
	corporateTaxFiling: z.union([z.string(), z.number()]).optional(),
}).refine((data) => {
	if (data.corporateTaxFiling && !data.taxFiledOn) {
		return false;
	}
	return true;
}, {
	message: 'Date of filling is required',
	path: ['taxFiledOn'],
});

const FileCtReportModal = (props) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
	const [disabled, setDisabled] = useState(false);

	const { openModal, closeModal, current_report_id, taxReturns, endDate, dueDate } = props;

	const {
		control,
		handleSubmit: rhfHandleSubmit,
		formState: { errors },
		setValue,
		trigger,
	} = useForm({
		resolver: zodResolver(fileCtReportSchema),
		defaultValues: {
			taxFiledOn: '',
			corporateTaxFiling: '',
		},
	});

	useEffect(() => {
		props.ctReportActions.getCompanyDetails().then((res) => {
			if (res.status == 200) {
				// Handle company details if needed
			}
		});
	}, []);

	const handleFormSubmit = (data) => {
		setDisabled(true);
		const postData = {
			taxFiledOn: dayjs(data.taxFiledOn ? data.taxFiledOn : endDate).format('DD/MM/YYYY'),
			id: data.corporateTaxFiling ? data.corporateTaxFiling : current_report_id,
		};

		props.ctReportActions
			.fileCTReport(postData)
			.then((res) => {
				if (res.status === 200) {
					setDisabled(false);
					props.commonActions.tostifyAlert(
						'success',
						'Report Filed Successfully!',
					);
				}
				closeModal(false);
			})
			.catch((err) => {
				setDisabled(false);
			});
	};

	const onSubmit = (data) => {
		if (Object.keys(errors).length !== 0) {
			props.commonActions.fillManDatoryDetails();
			return;
		}
		handleFormSubmit(data);
	};

	strings.setLanguage(language);

	return (
		<div className="contact-modal-screen">
			<Modal isOpen={openModal} className="modal-success contact-modal">
				<ModalHeader>
					<Row>
						<Col lg={12}>
							<div className="h4 mb-0 d-flex align-items-center">
								<i className="nav-icon fas fa-user-tie" />
								<span className="ml-2">File The Report For Tax Period ( {taxReturns} )</span>
							</div>
						</Col>
					</Row>
				</ModalHeader>

				<Form onSubmit={rhfHandleSubmit(onSubmit)} className="create-contact-screen">
					<ModalBody>
						<Row className='mb-4'>
							<Col>
								<h4>Transactions for the tax period cannot be edited after the tax report has been filed.</h4>
							</Col>
						</Row>
						<br></br>
						<Row>
							<Col lg={4}>
								<FormGroup className="mb-3">
									<span className="text-danger">* </span>
									<Label htmlFor="taxFiledOn">Date Of Filling</Label>
									<Controller
										name="taxFiledOn"
										control={control}
										render={({ field: { onChange, value } }) => (
											<DatePicker
												id="taxFiledOn"
												placeholderText={"Tax Filed On"}
												showMonthDropdown
												showYearDropdown
												autoComplete="off"
												dateFormat="dd-MM-yyyy"
												dropdownMode="select"
												minDate={endDate}
												maxDate={dueDate}
												selected={value || endDate}
												onChange={(date) => {
													onChange(date);
													setValue('corporateTaxFiling', current_report_id);
												}}
												className={`form-control ${errors.taxFiledOn ? 'is-invalid' : ''}`}
											/>
										)}
									/>
									{errors.taxFiledOn && (
										<div className="invalid-feedback">
											{errors.taxFiledOn.message}
										</div>
									)}
								</FormGroup>
							</Col>
						</Row>
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							type="submit"
							className="btn-square"
							disabled={disabled}
						>
							<i className="fa fa-dot-circle-o"></i> {disabled ? 'Saving...' : "File"}
						</Button>
						&nbsp;
						<Button
							color="secondary"
							className="btn-square"
							onClick={() => {
								closeModal(false);
							}}
						>
							<i className="fa fa-ban"></i> {strings.Cancel}
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(FileCtReportModal);
