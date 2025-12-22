import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from 'components/migration';
import { withNavigation } from 'utils/withNavigation';
import { api } from 'utils';
import { Message } from 'components';
import ResetNewPassword from './sections/reset_new_password.jsx';
import './style.scss';
import logo from 'assets/images/brand/logo.png';

// Zod validation schema
const resetPasswordSchema = z.object({
  username: z.string().min(1, 'Email id is required').email('Invalid email address'),
});

const ResetPassword = ({ history, location }) => {
  const [token, setToken] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange', // Validate on change for immediate feedback
    defaultValues: {
      username: '',
    },
  });

  useEffect(() => {
    // Check for token in URL query params
    // Also check window.location.search as fallback for test environments
    const search = location?.search || window.location.search;
    if (search) {
      const query = new URLSearchParams(search);
      const urlToken = query.get('token');
      if (urlToken) {
        setToken(urlToken);
      }
    }
  }, [location]);

  const onSubmit = async data => {
    setLoading(true);
    const requestData = {
      method: 'post',
      url: '/public/forgotPassword',
      data: { username: data.username, url: window.location.href },
    };

    try {
      await api(requestData);
      setAlert(
        <Message
          type="success"
          content="We Have Sent You a Verification Email. Please Check Your Mail Box."
        />
      );
      setTimeout(() => {
        history.push('/login');
      }, 1500);
    } catch (err) {
      setAlert(<Message type="danger" content="Invalid Email Address" />);
    } finally {
      setLoading(false);
    }
  };

  // If token exists, show ResetNewPassword component
  if (token) {
    return <ResetNewPassword token={token} history={history} location={location} />;
  }

  return (
    <div className="reset-password-screen">
      <div className="animated fadeIn">
        <div className="app flex-row align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col md="5">{alert}</Col>
            </Row>
            <Row className="justify-content-center">
              <Col md="6">
                <CardGroup>
                  <Card className="p-4">
                    <CardBody>
                      <div className="logo-container">
                        <img src={logo} alt="logo" />
                      </div>

                      <div className="d-flex registerScreen">
                        <h2 className="mb-0">Forgot Password</h2>
                      </div>
                      <div>
                        <Form onSubmit={form.handleSubmit(onSubmit)}>
                          <Row>
                            <Col lg="12">
                              <FormGroup className="mb-3">
                                <Label htmlFor="username">
                                  <span className="text-danger">* </span>
                                  <b>Email Address</b>
                                </Label>
                                <Controller
                                  name="username"
                                  control={form.control}
                                  render={({ field, fieldState }) => (
                                    <Input
                                      type="email"
                                      id="username"
                                      name="username"
                                      placeholder="Please Enter Your Email Address"
                                      {...field}
                                      onChange={e => {
                                        // Trim whitespace on change
                                        const trimmedValue = e.target.value.trim();
                                        field.onChange(trimmedValue);
                                      }}
                                      invalid={!!fieldState.error}
                                    />
                                  )}
                                />
                                {form.formState.errors.username && (
                                  <div className="invalid-feedback d-block">
                                    {form.formState.errors.username.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row className="button-group">
                            <Col lg="6" className="mt-4">
                              <Button
                                color="primary"
                                type="submit"
                                className="btn-square w-100 submit-btn"
                                disabled={loading}
                              >
                                Send Verification Email
                              </Button>
                            </Col>
                            <Col lg="6" className="mt-4">
                              <Button
                                color="primary"
                                type="button"
                                className="btn-square w-100 submit-btn"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  history.push('/login');
                                }}
                              >
                                Back To Login
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

export default withNavigation(ResetPassword);
