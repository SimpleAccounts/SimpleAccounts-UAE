import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  Input,
  FormGroup,
  Label,
  Row
} from 'reactstrap'


import { Formik } from "formik";
import * as Yup from "yup";

import { toast } from "react-toastify";
import './style.scss'
import {
  Message
} from 'components'
import ResetNewPassword from './sections/reset_new_password'
import {
  api,
} from 'utils'
import logo from 'assets/images/brand/logo.png';
// import login_bg from 'assets/images/brand/login_bg.png';
// import login_banner from 'assets/images/brand/login_banner.png';

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initValue: {
        username: "",
      },
      alert: null
    };
    this.formikRef = React.createRef();
  }

  componentDidMount = () => {
    if (this.props && this.props.location && this.props.location.search) {
      const query = new URLSearchParams(this.props.location.search);
      const token = query.get('token')
      this.setState({
        token
      })
    }
  }

  // Create or Contact
  handleSubmit = (obj) => {
    let data = {
      method: 'post',
      url: '/public/forgotPassword',
      data: { "username": obj.username,url:window.location.href }
    }
    api(data).then((res) => {
      this.setState({
        alert: <Message
          type="success"
          content="We Have Sent You a Verification Email. Please Check Your Mail Box."
        />
      },() => {
          setTimeout(() => {
            this.props.history.push('/login')
        }, 1500);
      })
    }).catch((err) => {
      this.setState({
        alert: <Message
          type="danger"
          content="Invalid Email Address"
        />
      })
    })
  }

  displayMsg = (msg) => {
    toast.error(msg, {
      position: toast.POSITION.TOP_RIGHT
    });
  }

  render() {
    const { initValue, token } = this.state;

    return (
      <div className="reset-password-screen">
        {!token ? (
          <div className="animated fadeIn">
            	{/* <div className="main-banner_container col-md-8 flex">
													<img src={login_bg} alt="login_bg" className="login_banckground" />
													<img src={login_banner} alt="login_banner" className="login_banner"/>
												</div> */}
            <div className="app flex-row align-items-center">
              <Container>
                <Row className="justify-content-center">
                  <Col md="5">
                    {this.state.alert}
                  </Col>
                </Row>
                <Row className="justify-content-center">
                  <Col md="6">
                  <CardGroup>
										<Card className="p-4">
											<CardBody>
                  <div className="logo-container">
													<img src={logo} alt="logo" />
												</div>

                      <div className=" d-flex registerScreen">
                        {/* <i className="fas fa-lock"></i>*/} <h2 className="mb-0">Forgot Password</h2> 
                      </div>
                      <div >
                        <Formik
                          ref={this.formikRef}
                          initialValues={initValue}
                          onSubmit={(values, { resetForm }) => {
                            this.handleSubmit(values, resetForm);
                          }}
                          validationSchema={Yup.object().shape({
                            username: Yup.string()
                              .required("Email id is required")
                              .email("Invalid email Id"),
                          })}
                        >
                          {(props) => {
                            return (
                              <Form >
                                <Row>
                                  <Col lg="12">
                                    <FormGroup className="mb-3">
                                      <Label htmlFor="username">
                                        <span className="text-danger">* </span> <b>Email Address</b>
                                     </Label>
                                      <Input
                                        type="text"
                                        id="username"
                                        name="username"
                                        onChange={(value) => {
                                          props.handleChange("username")(value);
                                        }}
                                        placeholder="Please Enter Your Email Address"
                                        value={props.values.username}
                                        className={
                                          props.errors.username && props.touched.username
                                            ? "is-invalid"
                                            : ""
                                        }
                                      />
                                      {props.errors.username && props.touched.username && (
                                        <div className="invalid-feedback">
                                          {props.errors.username}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row className="button-group">
                                  <Col lg="6 mt-4">
                                    <Button
                                      color="primary"
                                      type="button"
                                      className="btn-square w-100 submit-btn"
                                  //    disabled={isSubmitting}
                                      onClick={() => { props.handleSubmit() }}
                                    >
                                      Send Verification Email
                               </Button>
                                  </Col>
                                  <Col lg="6 mt-4">
                                    <Button
                                      color="primary"
                                      className="btn-square w-100 submit-btn"
                                      onClick={() => {
                                        this.props.history.push('/login')
                                      }}
                                    >
                                      Back To Login
                                     </Button>
                                  </Col>
                                </Row>
                              </Form>
                            );
                          }}
                        </Formik>
                      </div>
                  
                      </CardBody>
										</Card>
									</CardGroup>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>) : (
            <ResetNewPassword token={token} {...this.props}/>)
        }
      </div>
    );
  }
}

export default ResetPassword;
