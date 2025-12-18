import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Button,
	Card,
	CardBody,
	Col,
	Container,
	Form,
	Input,
	FormGroup,
	Label,
	Row,
} from 'reactstrap';
import { api } from 'utils';
import { toast } from 'react-toastify';
import './style.scss';
import { Message } from 'components';
import PasswordChecklist from 'react-password-checklist';
import { withNavigation } from 'utils/withNavigation';
import logo from 'assets/images/brand/logo.png';

// Zod validation schema
const newPasswordSchema = z
	.object({
		password: z
			.string()
			.min(1, 'Password is required')
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
				'Must contain minimum 8 characters, must contain maximum 255 characters, one uppercase, one lowercase, one number and one special case character'
			),
		confirmPassword: z.string().min(1, 'Confirm password is required'),
		token: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords must match',
		path: ['confirmPassword'],
	});

const NewPassword = ({ history, location }) => {
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [alert, setAlert] = useState(null);
	const [displayRules, setDisplayRules] = useState(false);

	// Get token from URL query params
	const queryParams = new URLSearchParams(location?.search || window.location.search);
	const token = queryParams.get('token') || '';

	const form = useForm({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
			token: token,
		},
	});

	const togglePasswordVisiblity = () => {
		setIsPasswordShown(!isPasswordShown);
	};

	const handlePasswordChange = (e) => {
		const value = e.target.value;
		form.setValue('password', value);
		if (value !== '') {
			setDisplayRules(true);
		} else {
			setDisplayRules(false);
		}
	};

	const onSubmit = async (data) => {
		const obj = {
			password: data.password,
			token: data.token || token,
		};

		const requestData = {
			method: 'post',
			url: '/public/resetPassword',
			data: obj,
		};

		try {
			const res = await api(requestData);
			if (res.status === 200) {
				setAlert(
					<Message
						type="success"
						content="Password Created Successfully."
					/>
				);
				setTimeout(() => {
					history.push('/login');
				}, 1500);
			}
		} catch (err) {
			setAlert(
				<Message
					type="danger"
					content="Email Verification Link Is Expired. Please enter your email address and we'll send another verification link."
					link="/reset-password"
				/>
			);
		}
	};

	return (
		<div className="reset-password-screen">
			<div className="animated fadeIn">
				<div className="app flex-row align-items-center">
					<Container>
						<Row className="justify-content-center">
							<Col md="5">
								{alert}
							</Col>
						</Row>
						<Row className="justify-content-center">
							<Col md="5">
								<Card>
									<CardBody className="p-4">
										<div className="logo-container">
											<img src={logo} alt="logo" />
										</div>
										<div className="d-flex registerScreen">
											<h2 className="mb-0">Create Password</h2>
										</div>
										<div>
											<Form onSubmit={form.handleSubmit(onSubmit)}>
										<Row>
											<Col lg={12}>
												<FormGroup>
													<Label htmlFor="password">
														<span className="text-danger">* </span>
														Password
													</Label>
													<div>
														<Input
															onPaste={(e) => {
																e.preventDefault();
																return false;
															}}
															onCopy={(e) => {
																e.preventDefault();
																return false;
															}}
															type={isPasswordShown ? 'text' : 'password'}
															autoComplete="off"
															id="password"
															name="password"
															placeholder=" Enter Password"
															{...form.register('password')}
															onChange={(e) => {
																form.setValue('password', e.target.value);
																handlePasswordChange(e);
															}}
															invalid={!!form.formState.errors.password}
														/>
														<i
															className={`fa ${isPasswordShown ? 'fa-eye' : 'fa-eye-slash'} password-icon fa-lg`}
															onClick={togglePasswordVisiblity}
															style={{ cursor: 'pointer' }}
														>
														</i>
													</div>
													{form.formState.errors.password && (
														<div className="invalid-feedback d-block">
															{form.formState.errors.password.message}
														</div>
													)}
													{displayRules === true && (
														<PasswordChecklist
															rules={['maxLength', 'minLength', 'specialChar', 'number', 'capital']}
															minLength={8}
															maxLength={255}
															value={form.watch('password')}
															valueAgain={form.watch('confirmPassword')}
														/>
													)}
												</FormGroup>
											</Col>
											<Col lg={12}>
												<FormGroup>
													<Label htmlFor="confirmPassword">
														<span className="text-danger">* </span>
														Confirm Password
													</Label>
													<Input
														onPaste={(e) => {
															e.preventDefault();
															return false;
														}}
														onCopy={(e) => {
															e.preventDefault();
															return false;
														}}
														type="password"
														id="confirmPassword"
														name="confirmPassword"
														value={form.watch('confirmPassword')}
														placeholder="Confirm Password"
														{...form.register('confirmPassword')}
														invalid={!!form.formState.errors.confirmPassword}
													/>
													{form.formState.errors.confirmPassword && (
														<div className="invalid-feedback d-block">
															{form.formState.errors.confirmPassword.message}
														</div>
													)}
													{displayRules === true && (
														<PasswordChecklist
															rules={['match']}
															minLength={8}
															value={form.watch('password')}
															valueAgain={form.watch('confirmPassword')}
														/>
													)}
												</FormGroup>
											</Col>
										</Row>
										<Row className="button-group mt-4">
											<Col lg="12">
												<Button
													color="primary"
													type="submit"
													className="btn-square w-100 submit-btn"
													disabled={form.formState.isSubmitting}
												>
													Create Password
												</Button>
											</Col>
										</Row>
											</Form>
										</div>
									</CardBody>
							</Card>
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
};

export default withNavigation(NewPassword);

