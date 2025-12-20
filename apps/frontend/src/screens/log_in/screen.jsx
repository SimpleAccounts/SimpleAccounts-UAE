import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

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
  Row,
} from 'reactstrap';

import { AuthActions, CommonActions } from 'services/global';
import { FormField } from '@/components/ui/form';
import { getFieldError } from '@/lib/validations/utils';

import './style.scss';
import logo from 'assets/images/brand/logo.png';
import config from 'constants/config';

import LocalizedStrings from 'react-localization';
import { data } from 'screens/Language/index';
import { withNavigation } from 'utils/withNavigation';

let strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

const mapStateToProps = state => {
  return {
    version: state.common.version,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const LogIn = ({ authActions, commonActions, history, version }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    getInitialData();
  }, []);

  const getInitialData = () => {
    authActions
      .getCompanyCount()
      .then(response => {
        // If company count is 0, redirect to register screen
        if (response.data === 0) {
          history.push('/register');
        }
      })
      .catch(err => {
        // If API fails, don't redirect - let user see login screen
      });

    authActions
      .getUserSubscription()
      .then(action => {
        // Redux Toolkit thunks return an action object, not the response directly
        let message = null;
        if (action && action.type && action.type.includes('fulfilled')) {
          const data = action.payload;
          if (
            (data && data.message && data.message.toLowerCase() === 'active') ||
            (data && data.status && data.status.toLowerCase() === 'active')
          ) {
            message = null;
          } else {
            message = strings.SubscriptionExpiredMessage;
          }
        } else {
          // Rejected or other error
          message = strings.SubscriptionFailedMessage;
        }
        setSubscriptionMessage(message);
      })
      .catch(err => {
        setSubscriptionMessage(strings.SubscriptionErrorMessage);
      });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const onSubmit = data => {
    setLoading(true);
    const { username, password } = data;
    const obj = {
      username,
      password,
    };

    authActions
      .logIn(obj)
      .then(action => {
        // Redux Toolkit thunks return an action object, not the response directly
        if (action && action.type && action.type.includes('fulfilled')) {
          toast.success('Log in Successfully', {
            position: 'top-right',
          });
          history.push(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
        } else {
          // Login failed - action is rejected
          setLoading(false);
          // Map technical error messages to user-friendly ones
          let errorMessage =
            action?.payload?.message || action?.payload || 'Invalid email or password';
          if (errorMessage === 'Unauthorized') {
            errorMessage = 'Invalid email or password';
          }
          toast.error(errorMessage, {
            position: 'top-right',
          });
        }
      })
      .catch(err => {
        // This catches unexpected errors (network issues, etc.)
        setLoading(false);
        toast.error('Something went wrong. Please try again.', {
          position: 'top-right',
        });
      });
  };

  return (
    <div className="log-in-screen">
      <div className="animated fadeIn">
        <div className="main-banner_container col-md-12 flex">
          {/* Background images can be added here if needed */}
        </div>
        <div className="app flex-row align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col md="6">
                <CardGroup>
                  <Card className="p-4">
                    <CardBody>
                      <div>
                        {subscriptionMessage && config.VALIDATE_SUBSCRIPTION && (
                          <div className="alert alert-danger mb-4">{subscriptionMessage}</div>
                        )}
                        <div className="logo-container">
                          <img src={logo} alt="logo" />
                        </div>
                        <Form onSubmit={form.handleSubmit(onSubmit)}>
                          <div className="registerScreen">
                            <h2>Login</h2>
                            <p>Enter your details below to continue</p>
                          </div>
                          <Row>
                            <Col lg={12}>
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field, fieldState }) => (
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="username">
                                      <b>Email</b>
                                    </Label>
                                    <Input
                                      type="text"
                                      id="username"
                                      name="username"
                                      placeholder="Enter Email Id"
                                      {...field}
                                      className={fieldState.error ? 'is-invalid' : ''}
                                    />
                                    {fieldState.error && (
                                      <div className="invalid-feedback">
                                        {getFieldError(fieldState)}
                                      </div>
                                    )}
                                  </FormGroup>
                                )}
                              />
                            </Col>
                            <Col lg={12}>
                              <FormField
                                control={form.control}
                                name="password"
                                render={({ field, fieldState }) => (
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="password">
                                      <b>Password</b>
                                    </Label>
                                    <Input
                                      type={isPasswordShown ? 'text' : 'password'}
                                      id="password"
                                      name="password"
                                      placeholder="Enter password"
                                      maxLength={255}
                                      onPaste={e => {
                                        e.preventDefault();
                                        return false;
                                      }}
                                      onCopy={e => {
                                        e.preventDefault();
                                        return false;
                                      }}
                                      {...field}
                                      className={fieldState.error ? 'is-invalid' : ''}
                                    />
                                    <i
                                      className={`fa ${isPasswordShown ? 'fa-eye' : 'fa-eye-slash'} password-icon fa-lg`}
                                      onClick={togglePasswordVisibility}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          togglePasswordVisibility();
                                        }
                                      }}
                                    />
                                    {fieldState.error && (
                                      <div className="invalid-feedback">
                                        {getFieldError(fieldState)}
                                      </div>
                                    )}
                                  </FormGroup>
                                )}
                              />
                            </Col>
                            <Col>
                              <Button
                                type="button"
                                color="link"
                                className="px-0"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  history.push('/reset-password');
                                }}
                                style={{ marginTop: '-10px' }}
                              >
                                Forgot password?
                              </Button>
                            </Col>
                          </Row>
                          <Row>
                            <Col className="text-center">
                              <Button
                                color="primary"
                                type="submit"
                                className="px-4 btn-square mt-3"
                                style={{ width: '200px' }}
                                disabled={loading}
                              >
                                <i className="fa fa-sign-in" /> Log In
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </CardBody>
                  </Card>
                </CardGroup>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(LogIn));
