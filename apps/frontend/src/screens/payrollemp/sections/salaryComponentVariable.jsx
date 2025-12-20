import React, { useState, useEffect } from 'react';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
} from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { selectOptionsFactory } from 'utils';
import Select from 'react-select';
import { toast } from 'sonner';
import { Button as ShadcnButton } from '@/components/ui/button';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

const SalaryComponentVariable = ({
	openSalaryComponentVariable,
	closeSalaryComponentVariable,
	CreateComponent,
	salary_component_dropdown,
	selectedData,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [showDetails, setShowDetails] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [selectDisable, setSelectDisable] = useState(true);
	const [addNewDisabled, setAddNewDisabled] = useState(false);

	const regEx = /^[0-9\d]+$/;
	const regExAlpha = /^[a-zA-Z][a-zA-Z ]*$/;
	const regDec1 = /^\d{1,2}\.\d{1,2}$|^\d{1,2}$/;
	const type = [
		{ label: 'Flat Amount', value: 1 },
		{ label: '% of Basic', value: 2 }
	];

	strings.setLanguage(language);

	// Create a dynamic schema based on showDetails state
	const createSchema = () => {
		if (addNewDisabled) {
			return z.object({
				description: z.string().min(1, 'Component name is required'),
				type: z.object({
					label: z.string(),
					value: z.number(),
				}, { required_error: 'Type is required' }),
				formula: z.string().optional(),
				flatAmount: z.union([z.string(), z.number()]).optional(),
			}).refine((data) => {
				if (data.type?.label === '% of Basic' && !data.formula) {
					return false;
				}
				return true;
			}, {
				message: 'Percentage is required',
				path: ['formula'],
			}).refine((data) => {
				if (data.type?.label === 'Flat Amount' && !data.flatAmount) {
					return false;
				}
				return true;
			}, {
				message: 'Flat amount is required',
				path: ['flatAmount'],
			}).refine((data) => {
				if (data.flatAmount && parseFloat(data.flatAmount) === 0) {
					return false;
				}
				return true;
			}, {
				message: 'Flat Amount should be greater than zero',
				path: ['flatAmount'],
			});
		} else {
			return z.object({
				id: z.object({
					label: z.string(),
					value: z.any(),
				}).refine((val) => val.label !== "Select Type", {
					message: 'Component is required',
				}),
				description: z.string().optional(),
				type: z.any().optional(),
				formula: z.string().optional(),
				flatAmount: z.union([z.string(), z.number()]).optional(),
			});
		}
	};

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm({
		resolver: zodResolver(createSchema()),
		defaultValues: {
			employeeId: '',
			salaryStructure: 1,
			type: '',
			flatAmount: 1,
			email: '',
			description: '',
			formula: '',
			id: '',
		},
	});

	const watchType = watch('type');

	const onSubmit = (data) => {
		setDisabled(true);
		const { id, description, formula, flatAmount } = data;

		const formData = new FormData();
		formData.append('id', id != null ? id.value : '');
		formData.append('employeeId', selectedData?.id || '');
		formData.append('salaryStructure', 2);
		formData.append('description', description != null ? description : '');
		formData.append('formula', formula != null ? formula : '');
		formData.append('flatAmount', flatAmount != null ? flatAmount : '');

		CreateComponent(formData)
			.then((res) => {
				if (res.status === 200) {
					setDisabled(false);
					reset();
					closeSalaryComponentVariable(true);
				}
			})
			.catch((err) => {
				setDisabled(false);
				toast.error(`${err.data}`, {
					position: 'top-right',
				});
			});
	};

	const toggleShowDetails = (bool) => {
		setShowDetails(bool);
		if (bool === true) {
			setAddNewDisabled(true);
			setSelectDisable(false);
		} else {
			setAddNewDisabled(false);
			setSelectDisable(true);
		}
	};

	return (
		<div style={{ width: "250px" }}>
			<Modal
				isOpen={openSalaryComponentVariable}
				className="modal-success salary-model"
			>
				<Form
					name="simpleForm"
					onSubmit={handleSubmit(onSubmit)}
					className="create-contact-screen"
				>
					<CardHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fas fa-id-card-alt" />
									<span className="ml-2">{strings.CreateVariableComponent}</span>
								</div>
							</Col>
						</Row>
					</CardHeader>
					<ModalBody>
						{selectDisable && (
							<Row>
								<Col lg={8}>
									<FormGroup>
										<Label htmlFor="id">{strings.Select + " " + strings.Component}</Label>
										<Controller
											name="id"
											control={control}
											render={({ field }) => (
												<Select
													{...field}
													options={
														salary_component_dropdown?.data
															? selectOptionsFactory.renderOptions(
																'label',
																'value',
																salary_component_dropdown.data,
																'Type',
															)
															: []
													}
													id="id"
													placeholder={strings.Select + strings.Component}
													className={errors.id ? 'is-invalid' : ''}
												/>
											)}
										/>
										{errors.id && (
											<div className="text-danger">
												{errors.id.message}
											</div>
										)}
									</FormGroup>
								</Col>
								<Col>
									<Button
										style={{
											width: 80,
											borderRadius: 50,
										}}
										color="primary"
										className="btn-square mr-3 mt-4"
										onClick={() => toggleShowDetails(true)}
										disabled={showDetails === true}
									>
										<i className="fa fa-plus"></i> {strings.AddNewComponent}
									</Button>
								</Col>
							</Row>
						)}

						{showDetails && (
							<div id="moreDetails">
								<Row>
									<Col lg={8}>
										<FormGroup className="mb-3">
											<Label htmlFor="description">
												<span className="text-danger">* </span>{strings.ComponentName}
											</Label>
											<Controller
												name="description"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="text"
														id="description"
														placeholder={strings.Enter + strings.SalaryComponent + " " + strings.Name}
														onChange={(e) => {
															const value = e.target.value;
															if (value === '' || regExAlpha.test(value)) {
																field.onChange(value);
															}
														}}
														className={errors.description ? "is-invalid" : ""}
													/>
												)}
											/>
											{errors.description && (
												<div className="invalid-feedback">{errors.description.message}</div>
											)}
										</FormGroup>
									</Col>
								</Row>
								<Row>
									<Col md="8">
										<FormGroup>
											<Label htmlFor="type">
												<span className="text-danger">* </span>{strings.Type}
											</Label>
											<Controller
												name="type"
												control={control}
												render={({ field }) => (
													<Select
														{...field}
														options={
															type
																? selectOptionsFactory.renderOptions(
																	'label',
																	'value',
																	type,
																	'Type',
																)
																: []
														}
														id="type"
														placeholder={strings.Select + strings.Type}
														className={errors.type ? 'is-invalid' : ''}
													/>
												)}
											/>
											{errors.type && (
												<div className="text-danger">
													{errors.type.message}
												</div>
											)}
										</FormGroup>
									</Col>
								</Row>
								<Row style={{ display: watchType?.value !== 2 ? 'none' : '' }}>
									<Col lg={8}>
										<FormGroup className="mb-3">
											<Label htmlFor="formula">
												<span className="text-danger">* </span> {strings.Percentage}
											</Label>
											<Controller
												name="formula"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														type="number"
														id="formula"
														min="0"
														max="99"
														step="0.01"
														maxLength={2}
														placeholder={strings.Enter + strings.Percentage}
														onChange={(e) => {
															const value = e.target.value;
															if (value === '' || regDec1.test(value)) {
																field.onChange(value);
															}
														}}
														className={errors.formula ? "is-invalid" : ""}
													/>
												)}
											/>
											{errors.formula && (
												<div className="text-danger">{errors.formula.message}</div>
											)}
										</FormGroup>
									</Col>
								</Row>
								<Row style={{ display: watchType?.value !== 1 ? 'none' : '' }}>
									<Col lg={8}>
										<FormGroup className="mb-3">
											<Label htmlFor="flatAmount">
												<span className="text-danger">* </span>	{strings.FlatAmount}
											</Label>
											<Controller
												name="flatAmount"
												control={control}
												render={({ field }) => (
													<Input
														{...field}
														maxLength="8"
														type="text"
														id="flatAmount"
														placeholder={strings.Enter + strings.FlatAmount}
														onChange={(e) => {
															const value = e.target.value;
															if (value === '' || regEx.test(value)) {
																field.onChange(value);
															}
														}}
														className={errors.flatAmount ? "is-invalid" : ""}
													/>
												)}
											/>
											{errors.flatAmount && (
												<div className="text-danger">{errors.flatAmount.message}</div>
											)}
										</FormGroup>
									</Col>
								</Row>
								<Row>
									<ShadcnButton
										variant="ghost"
										size="icon"
										aria-label="delete"
										onClick={() => toggleShowDetails(false)}
									>
										<i className="fa fa-angle-double-up" aria-hidden="true"></i>
									</ShadcnButton>
								</Row>
							</div>
						)}
					</ModalBody>
					<ModalFooter style={{ padding: "10px" }}>
						<Button
							type="submit"
							color="primary"
							className="btn-square mr-3"
							disabled={disabled}
						>
							<i className="fa fa-dot-circle-o"></i> 	{disabled
								? 'Creating...'
								: strings.Create}
						</Button>
						<Button
							color="secondary"
							className="btn-square"
							onClick={() => {
								closeSalaryComponentVariable(false);
							}}
						>
							<i className="fa fa-ban"></i>  {strings.Cancel}
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
};

export default SalaryComponentVariable;
