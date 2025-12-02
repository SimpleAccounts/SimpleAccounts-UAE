import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  FormGroup,
  Label,
  Row
} from 'reactstrap'
import {
  api,
} from 'utils'

import { Formik } from "formik";
import * as Yup from "yup";

import { toast } from "react-toastify";
import './style.scss'
import {
  Message
} from 'components'
import PasswordChecklist from "react-password-checklist"
// import { display } from "html2canvas/dist/types/css/property-descriptors/display";

class ResetNewPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initValue: {
        password: "",
        confirmPassword: ''
      },
      isPasswordShown: false,
      alert: null,
      displayRules:false
    };
    this.formikRef = React.createRef();
  }

  handleSubmit = (val) => {
   let obj = {
      password: val.password,
      token: this.props.token
    }
      let data = {
        method: 'post',
        url: '/public/resetPassword',
        data: obj
      } 
    api(data).then((res) => {
      if(res.status === 200 ) {
        this.setState({
          alert: <Message
            type="success"
            content="Password Reset Successfully."
          />
        },() => {
          setTimeout(() => {
            this.props.history.push('/login')
          },1500)
        })
      }
    }).catch((err) => {
      this.setState({
        alert: <Message
          type="danger"
          content="Email Verification Link Is Expired. Please enter your email address and we'll send another verification link."
          link="/reset-password"
        />
      })
  })
}

  displayMsg = (msg) => {
    toast.error(msg, {
      position: toast.POSITION.TOP_RIGHT
    });
  }
  togglePasswordVisiblity = () => {
		const { isPasswordShown } = this.state;
		this.setState({ isPasswordShown: !isPasswordShown });
	};

  render() {
    const { initValue } = this.state;
    const { isPasswordShown } = this.state;
    return (
      // <div className="reset-password-screen">
        <div className="animated fadeIn">
          <div className="app flex-row align-items-center">
            <Container>
              <Row className="justify-content-center">
                <Col md="5">
                  {this.state.alert}
                </Col>
              </Row>
              <Row className="justify-content-center">
                <Col md="5">
                  <Card>
                    <CardHeader className="register-header d-flex">
                      <i className="fas fa-lock"></i> <h5 className="mb-0">Reset Password</h5>
                    </CardHeader>
                    <CardBody className="p-4">
                      <Formik
                        ref={this.formikRef}
                        initialValues={initValue}
                        onSubmit={(values, { resetForm }) => {
                          this.handleSubmit(values, resetForm);
                        }}
                        validationSchema={Yup.object().shape({
                          password: Yup.string()
                            .required("Password is required")
                            // .min(8, "Password Too Short")
                            .matches(
                              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                              "Must contain 8 characters, must contain max 255 characters, one uppercase, one lowercase, one number and one special case character"
                            ),
                          confirmPassword: Yup.string()
                            .required('Confirm password is required')
                            .oneOf([Yup.ref("password"), null], "Passwords must match"),
                        })}
                      >
                        {(props) => {
                          return (
                            <Form >
                              <Row>
                                <Col lg={12}>
                                  <FormGroup>
																			<Label htmlFor="select">
																				<span className="text-danger">* </span> Password
																			</Label>
																			<div>
																				<Input
                                        onPaste={(e)=>{
                                          e.preventDefault()
                                          return false;
                                          }} onCopy={(e)=>{
                                          e.preventDefault()
                                          return false;
                                          }}
																					type={
																						this.state.isPasswordShown
																							? 'text'
																							: 'password'
																					}
                                          minLength={8}
                                          maxLength={255}
                                          autoComplete="off"
																					id="password"
																					name="password"
																					placeholder=" Enter New Password"
																					value={props.values.password}
																					onChange={(option) => {
                                            if(option.target.value!="")
																				  {		
                                            props.handleChange('password')(
																							option,
																						);
                                            this.setState({displayRules:true})}
                                            else{
                                              props.handleChange('password')(
                                                option,
                                              );
                                              this.setState({displayRules:false})
                                            }
																					}}
																					className={
																						props.errors.password &&
																							props.touched.password
																							? 'is-invalid'
																							: ''
																					}
																				/>
																				<i className={`fa ${isPasswordShown ? "fa-eye" : "fa-eye-slash"} password-icon fa-lg`}
																					onClick={this.togglePasswordVisiblity}
																				>
																					{/* <img 
																			src={eye}
																			style={{ width: '20px' }}
																		/> */}
																				</i>
																			</div>
																			{props.errors.password &&
																				props.touched.password && (
																					<div style={{ color: "red" }}>
																						{props.errors.password}
																					</div>
																				)}
																			{this.state.displayRules==true&&( <PasswordChecklist
																				rules={["maxLength", "minLength", "specialChar", "number", "capital"]}
																				minLength={8}
                                        maxLength={255}
																				value={props.values.password}
																				valueAgain={props.values.confirmPassword}
																			/>)}
																		</FormGroup>
                                </Col>
                                <Col lg={12}>
                                  <FormGroup>
																			<Label htmlFor="select">
																				<span className="text-danger">* </span> Confirm Password
																			</Label>
																			<Input
                                      onPaste={(e)=>{
                                        e.preventDefault()
                                        return false;
                                        }} onCopy={(e)=>{
                                        e.preventDefault()
                                        return false;
                                        }}
                                        minLength={8}
                                        maxLength={255}
                                        autoComplete="off"
																				type="password"
																				id="confirmPassword"
																				name="confirmPassword"
																				value={props.values.confirmPassword}
																				placeholder="Confirm Password"
																				onChange={(value) => {
																					props.handleChange('confirmPassword')(
																						value,
																					);
																				}}
																				className={
																					props.errors.confirmPassword &&
																						props.touched.confirmPassword
																						? 'is-invalid'
																						: ''
																				}
																			/>
																			{props.errors.confirmPassword &&
																				props.touched.confirmPassword && (
																					<div className="invalid-feedback">
																						{props.errors.confirmPassword}
																					</div>
																				)}
																				{this.state.displayRules==true&&( <PasswordChecklist
																				rules={[ "match"]}
																				minLength={8}
                                        maxLength={255}
																				value={props.values.password}
																				valueAgain={props.values.confirmPassword}
																			/>)}
																		</FormGroup>
                                </Col>
                              </Row>
                              <Row className="button-group">
                                <Col lg="12">
                                  <Button
                                    color="primary"
                                    type="button"
                                    className="btn-square w-100 submit-btn"
                                 //   disabled={isSubmitting}
                                    onClick={() => { props.handleSubmit() }}
                                  >
                                   Reset Password
                               </Button>
                                </Col>
                              </Row>
                            </Form>
                          );
                        }}
                      </Formik>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      // </div>
    );
  }
}

export default ResetNewPassword;
