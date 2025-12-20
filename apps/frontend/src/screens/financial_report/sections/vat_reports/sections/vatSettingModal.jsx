import React from 'react';
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
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { toast } from 'sonner';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import * as VatreportActions from '../actions';

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
		vatreportActions: bindActionCreators(VatreportActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);

// Validation schema
const createValidationSchema = () => z.object({
	taxablePersonNameInEnglish: z.string().optional().refine((val) => {
		if (!val) return true;
		return /^[a-zA-Z ]+$/.test(val);
	}, { message: "A taxable person's name must contain only alphabets" }),
	taxablePersonNameInArabic: z.string().optional().refine((val) => {
		if (!val) return true;
		return /^[a-zA-Z ]+$/.test(val);
	}, { message: "A taxable person's name must contain only alphabets" }),
	taxAgentName: z.string().optional().refine((val) => {
		if (!val) return true;
		return /^[a-zA-Z ]+$/.test(val);
	}, { message: "Tax agent name must contain only alphabets" }),
	taxAgencyName: z.string().optional().refine((val) => {
		if (!val) return true;
		return /^[a-zA-Z ]+$/.test(val);
	}, { message: "Tax agency name must contain only alphabets" }),
	taxAgentApprovalNumber: z.string().optional().refine((val) => {
		if (!val) return true;
		if (!/^[0-9\d]+$/.test(val)) return false;
		if (val.length !== 8) return false;
		return true;
	}, { message: "The TAAN must consist of an 8-digit number" }),
	taxAgencyNumber: z.string().optional().refine((val) => {
		if (!val) return true;
		if (!/[a-zA-Z0-9]+$/.test(val)) return false;
		if (val.length !== 10) return false;
		return true;
	}, { message: "TAN must contain 10 digits alphanumeric" }),
	vatRegistrationNumber: z.string().optional(),
});

function VatSettingModalForm({ onSubmit, closeModal, commonActions, initValue }) {
	const [disabled, setDisabled] = React.useState(false);
	const [isTANMandetory, setIsTANMandetory] = React.useState(false);
	const [isTAANMandetory, setIsTAANMandetory] = React.useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		watch,
		trigger,
	} = useForm({
		resolver: zodResolver(createValidationSchema()),
		defaultValues: initValue,
	});

	const regEx = /^[0-9\d]+$/;
	const regExBoth = /[a-zA-Z0-9]+$/;
	const regExAlpha = /^[a-zA-Z ]+$/;

	const handleFormSubmit = async (data) => {
		setDisabled(true);
		let formData = new FormData();
		for (var key in data) {
			formData.append(key, data[key]);
		}

		try {
			await onSubmit(formData);
			setDisabled(false);
			setIsTANMandetory(false);
			setIsTAANMandetory(false);
		} catch (err) {
			setDisabled(false);
		}
	};

	const taxAgencyName = watch('taxAgencyName');
	const taxAgentName = watch('taxAgentName');

	React.useEffect(() => {
		if (taxAgencyName && taxAgencyName !== "") {
			setIsTANMandetory(true);
		} else {
			setIsTANMandetory(false);
		}
	}, [taxAgencyName]);

	React.useEffect(() => {
		if (taxAgentName && taxAgentName !== "") {
			setIsTAANMandetory(true);
		} else {
			setIsTAANMandetory(false);
		}
	}, [taxAgentName]);

	return (
		<Form onSubmit={handleSubmit(handleFormSubmit)}>
			<ModalBody>
				<Row>
					<Col lg={4}>
						<FormGroup className="mb-3">
							<Label htmlFor="taxablePersonNameInEnglish">
								Taxable Person Name (English)
							</Label>
							<Input
								type="text"
								id="taxablePersonNameInEnglish"
								maxLength="100"
								placeholder="Enter Taxable Person Name (English)"
								{...register('taxablePersonNameInEnglish')}
								onChange={(e) => {
									if (e.target.value === '' || regExAlpha.test(e.target.value)) {
										setValue('taxablePersonNameInEnglish', e.target.value);
									}
								}}
								className={errors.taxablePersonNameInEnglish ? 'is-invalid' : ''}
							/>
							{errors.taxablePersonNameInEnglish && (
								<div className="invalid-feedback">
									{errors.taxablePersonNameInEnglish.message}
								</div>
							)}
						</FormGroup>
					</Col>
					<Col lg={4}>
						<FormGroup className="mb-3">
							<Label htmlFor="taxablePersonNameInArabic">
								Taxable Person Name (Arabic)
							</Label>
							<Input
								type="text"
								id="taxablePersonNameInArabic"
								maxLength="100"
								placeholder="Enter Taxable Person Name (Arabic)"
								{...register('taxablePersonNameInArabic')}
								className={errors.taxablePersonNameInArabic ? 'is-invalid' : ''}
							/>
							{errors.taxablePersonNameInArabic && (
								<div className="invalid-feedback">
									{errors.taxablePersonNameInArabic.message}
								</div>
							)}
						</FormGroup>
					</Col>
					<Col lg="4">
						<FormGroup>
							<Label htmlFor="vatRegistrationNumber">
								{strings.TaxRegistrationNumber}
							</Label>
							<Input
								disabled
								type="text"
								maxLength="15"
								id="vatRegistrationNumber"
								placeholder={strings.Enter + strings.TaxRegistrationNumber}
								{...register('vatRegistrationNumber')}
								className={errors.vatRegistrationNumber ? 'is-invalid' : ''}
							/>
							{errors.vatRegistrationNumber && (
								<div className="invalid-feedback">
									{errors.vatRegistrationNumber.message}
								</div>
							)}
						</FormGroup>
					</Col>
					<Col lg={4}>
						<FormGroup className="mb-3">
							<Label htmlFor="taxAgencyName">Tax Agency Name</Label>
							<Input
								type="text"
								id="taxAgencyName"
								maxLength="100"
								placeholder="Enter Tax Agency Name"
								{...register('taxAgencyName')}
								className={errors.taxAgencyName ? 'is-invalid' : ''}
							/>
							{errors.taxAgencyName && (
								<div className="invalid-feedback">
									{errors.taxAgencyName.message}
								</div>
							)}
						</FormGroup>
					</Col>

					<Col lg={4}>
						<FormGroup className="mb-3">
							{isTANMandetory && <span className="text-danger">* </span>}
							<Label htmlFor="taxAgencyNumber">Tax Agency Number (TAN)</Label>
							<Input
								type="text"
								id="taxAgencyNumber"
								maxLength="10"
								autoComplete='off'
								placeholder="Enter Tax Agency Number (TAN)"
								{...register('taxAgencyNumber')}
								onChange={(e) => {
									if (e.target.value === '' || regExBoth.test(e.target.value)) {
										setValue('taxAgencyNumber', e.target.value);
									}
								}}
								className={errors.taxAgencyNumber ? 'is-invalid' : ''}
							/>
							{errors.taxAgencyNumber && (
								<div className="invalid-feedback">
									{errors.taxAgencyNumber.message}
								</div>
							)}
						</FormGroup>
					</Col>
				</Row>

				<Row>
					<Col lg={4}>
						<FormGroup className="mb-3">
							<Label htmlFor="taxAgentName">Tax Agent Name</Label>
							<Input
								type="text"
								id="taxAgentName"
								maxLength="100"
								placeholder="Enter Agent Name"
								{...register('taxAgentName')}
								className={errors.taxAgentName ? 'is-invalid' : ''}
							/>
							{errors.taxAgentName && (
								<div className="invalid-feedback">
									{errors.taxAgentName.message}
								</div>
							)}
						</FormGroup>
					</Col>
					<Col lg={4}>
						<FormGroup className="mb-3">
							<span className="text-danger"> </span>
							<Label htmlFor="taxAgentApprovalNumber">
								Tax Agent Approval Number (TAAN)
							</Label>
							<Input
								type="text"
								id="taxAgentApprovalNumber"
								maxLength="8"
								autoComplete='off'
								placeholder="Enter Tax Agent Approval Number (TAAN)"
								{...register('taxAgentApprovalNumber')}
								onChange={(e) => {
									if (e.target.value === '' || regEx.test(e.target.value)) {
										setValue('taxAgentApprovalNumber', e.target.value);
									}
								}}
								className={errors.taxAgentApprovalNumber ? 'is-invalid' : ''}
							/>
							{errors.taxAgentApprovalNumber && (
								<div className="invalid-feedback">
									{errors.taxAgentApprovalNumber.message}
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
					onClick={async () => {
						await trigger();
						const hasErrors = Object.keys(errors).length !== 0;
						if (hasErrors) {
							commonActions.fillManDatoryDetails();
						}
					}}
				>
					<i className="fa fa-dot-circle-o"></i>{' '}
					{disabled ? 'Saving...' : strings.Save}
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
	);
}

class VatSettingModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
			initValue: {
				taxablePersonNameInEnglish: '',
				vatRegistrationNumber: '',
				taxAgentApprovalNumber: '',
				taxAgencyNumber: '',
				taxAgencyName: '',
				taxAgentName: '',
				taxablePersonNameInArabic: '',
			},
		};
	}

	handleSubmit = (formData) => {
		return this.props.vatreportActions
			.VATSetting(formData)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						res.data.message ? res.data.message : 'VAT Report Filed Successfully',
					);
					this.props.closeModal(true);
				}
			})
			.catch((err) => {
				throw err;
			});
	};

	componentDidMount = () => {
		this.props.vatreportActions.getCompanyDetails().then((res) => {
			if (res.status == 200) {
				this.setState({
					initValue: {
						vatRegistrationNumber: res.data.vatRegistrationNumber
							? res.data.vatRegistrationNumber
							: "",
					},
				});
			}
		});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { openModal, closeModal } = this.props;
		const { initValue } = this.state;

		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal">
					<ModalHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fa" />
									<span className="ml-2">Company Details</span>
								</div>
							</Col>
						</Row>
					</ModalHeader>

					<VatSettingModalForm
						onSubmit={this.handleSubmit}
						closeModal={closeModal}
						commonActions={this.props.commonActions}
						initValue={initValue}
					/>
				</Modal>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(VatSettingModal);
