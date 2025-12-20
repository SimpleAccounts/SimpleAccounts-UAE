import React, { useState, useEffect } from 'react';
import {
	Button,
	Input,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Label,
} from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import { selectOptionsFactory } from 'utils';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

const customStyles = {
	control: (base, state) => ({
		...base,
		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		},
	}),
};

// Zod validation schema
const openingBalanceSchema = z.object({
	accountName: z
		.object({
			value: z.union([z.string(), z.number()]),
			label: z.string(),
		})
		.nullable()
		.refine((val) => val !== null, 'Account name is required'),
	openingBalance: z.string().min(1, 'Opening balance is required'),
	currency: z.string().optional(),
});

const regEx = /^[0-9\d]+$/;

const OpeningBalanceModal = ({
	showOpeningBalanceModal,
	bankAccountList,
	closeOpeningBalanceModal,
	selectedRowData,
	createOpeningBalance,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm({
		resolver: zodResolver(openingBalanceSchema),
		defaultValues: {
			accountName: null,
			openingBalance: '',
			currency: '',
		},
		mode: 'onChange',
	});

	strings.setLanguage(language);

	useEffect(() => {
		if (selectedRowData && selectedRowData !== '') {
			setValue('accountName', {
				label: selectedRowData.accountName,
				value: selectedRowData.accountId,
			});
			setValue('openingBalance', selectedRowData.openingBalance);
			setValue('currency', selectedRowData.currency);
		} else {
			reset({
				accountName: null,
				openingBalance: '',
				currency: '',
			});
		}
	}, [selectedRowData, setValue, reset]);

	const onSubmit = (data) => {
		const postData = {
			accountName: data.accountName ? data.accountName.value : '',
			openingBalance: data.openingBalance,
			currency: data.currency,
		};
		createOpeningBalance(postData).then((res) => {
			if (res.status === 200) {
				closeOpeningBalanceModal();
			}
		});
	};

	return (
		<div className="opening-balance-screen">
			<div className="animated fadeIn">
				<Modal isOpen={showOpeningBalanceModal} className="modal-primary">
					<ModalHeader>
						<i className="nav-icon fas fa-area-chart" /> {selectedRowData ? 'Update' : 'Add'}{' '}
						{strings.OpeningBalance}
					</ModalHeader>
					<ModalBody>
						<Form onSubmit={handleSubmit(onSubmit)}>
							<FormGroup>
								<Label htmlFor="categoryCode">
									<span className="text-danger">* </span>
									{strings.Account}
								</Label>
								<Controller
									name="accountName"
									control={control}
									render={({ field: { onChange, value } }) => (
										<Select
											styles={customStyles}
											options={
												bankAccountList
													? selectOptionsFactory.renderOptions(
															'name',
															'bankAccountId',
															bankAccountList,
															'Account'
														)
													: []
											}
											placeholder={strings.Select + strings.Account}
											onChange={(option) => {
												onChange(option || null);
											}}
											value={value}
											className={errors.accountName ? 'is-invalid' : ''}
											isClearable
										/>
									)}
								/>
								{errors.accountName && (
									<div className="invalid-feedback">{errors.accountName.message}</div>
								)}
							</FormGroup>
							<FormGroup>
								<Label htmlFor="openingBalance">
									<span className="text-danger">* </span>
									{strings.OpeningBalance}
								</Label>
								<Controller
									name="openingBalance"
									control={control}
									render={({ field: { onChange, value } }) => (
										<Input
											type="text"
											id="openingBalance"
											placeholder={strings.Enter + strings.OpeningBalance}
											onChange={(e) => {
												if (e.target.value === '' || regEx.test(e.target.value)) {
													onChange(e.target.value);
												}
											}}
											value={value}
											autoComplete="off"
											className={errors.openingBalance ? 'is-invalid' : ''}
										/>
									)}
								/>
								{errors.openingBalance && (
									<div className="invalid-feedback">{errors.openingBalance.message}</div>
								)}
							</FormGroup>
							<FormGroup>
								<Label htmlFor="categoryCode">{strings.Currency}</Label>
								<Controller
									name="currency"
									control={control}
									render={({ field: { value } }) => (
										<Input
											type="text"
											id="categoryCode"
											placeholder={strings.Select + strings.Currency}
											disabled
											value={value}
										/>
									)}
								/>
							</FormGroup>
						</Form>
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							type="button"
							className="btn-square"
							onClick={handleSubmit(onSubmit)}
						>
							{strings.Save}
						</Button>
						&nbsp;
						<Button color="secondary" className="btn-square" onClick={closeOpeningBalanceModal}>
							{strings.Cancel}
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		</div>
	);
};

export default OpeningBalanceModal;
