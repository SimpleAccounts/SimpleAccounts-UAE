import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
} from 'components/migration';
import { LeavePage } from 'components';
import { CommonActions } from 'services/global';
import * as SalaryRoleActions from '../../actions';
import * as SalaryRoleCreateActions from './actions';
import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { UserCircle, CircleDot, RefreshCw, Ban } from 'lucide-react';

const regExAlpha = /^[a-zA-Z ]+$/;

const strings = new LocalizedStrings(data);

// Zod validation schema
const createSalaryRoleSchema = z.object({
  salaryRoleName: z.string().min(1, 'Salary role name is required'),
});

const mapStateToProps = state => {
  return {
    currency_list: state.employee.currency_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    salaryRoleActions: bindActionCreators(SalaryRoleActions, dispatch),
    salaryRoleCreateActions: bindActionCreators(SalaryRoleCreateActions, dispatch),
  };
};

const CreateSalaryRoles = props => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [disabled, setDisabled] = useState(false);

  strings.setLanguage(language);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createSalaryRoleSchema),
    defaultValues: {
      salaryRoleName: '',
    },
  });

  const salaryRoleName = watch('salaryRoleName');

  useEffect(() => {
    // Initialize data if needed
  }, []);

  const onSubmit = data => {
    setDisabled(true);
    setDisableLeavePage(true);

    const { salaryRoleName } = data;

    const formData = new FormData();
    formData.append('salaryRoleName', salaryRoleName != null ? salaryRoleName : '');

    props.salaryRoleCreateActions
      .createSalaryRole(formData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          props.commonActions.tostifyAlert('success', 'New Salary Role Created Successfully');
          if (createMore) {
            setCreateMore(false);
            reset({
              salaryRoleName: '',
            });
          } else {
            props.history.push('/admin/payroll/config', { tabNo: '1' });
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        props.commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  const handleSalaryRoleNameChange = e => {
    const value = e.target.value;
    if (value === '' || regExAlpha.test(value)) {
      setValue('salaryRoleName', value, { shouldValidate: true });
    }
  };

  const handleCreateClick = () => {
    if (errors && Object.keys(errors).length !== 0) {
      props.commonActions.fillManDatoryDetails();
    }
    setCreateMore(false);
  };

  const handleCreateAndMoreClick = () => {
    if (errors && Object.keys(errors).length !== 0) {
      props.commonActions.fillManDatoryDetails();
    }
    setCreateMore(true);
  };

  return (
    <div className="create-employee-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <Card>
              <CardHeader>
                <Row>
                  <Col lg={12}>
                    <div className="h4 mb-0 d-flex align-items-center">
                      <UserCircle className="h-4 w-4" />
                      <span className="ml-2">{strings.CreateSalaryRole}</span>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                      <Row>
                        <Col lg={10}>
                          <Row className="row-wrapper">
                            <Col lg={4}>
                              <FormGroup>
                                <Label htmlFor="select">
                                  <span className="text-danger">* </span>
                                  {strings.SalaryRoleName}
                                </Label>
                                <Input
                                  type="text"
                                  id="salaryRoleName"
                                  name="salaryRoleName"
                                  maxLength="30"
                                  value={salaryRoleName}
                                  placeholder={strings.Enter + strings.SalaryRoleName}
                                  onChange={handleSalaryRoleNameChange}
                                  className={
                                    errors.salaryRoleName && touchedFields.salaryRoleName
                                      ? 'is-invalid'
                                      : ''
                                  }
                                />
                                {errors.salaryRoleName && touchedFields.salaryRoleName && (
                                  <div className="invalid-feedback">
                                    {errors.salaryRoleName.message}
                                  </div>
                                )}
                              </FormGroup>
                            </Col>
                          </Row>

                          <hr />
                        </Col>
                      </Row>
                      <Row>
                        <Col lg={12} className="mt-5">
                          <FormGroup className="text-right">
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={handleCreateClick}
                            >
                              <CircleDot className="h-4 w-4" />{' '}
                              {disabled ? 'Creating...' : strings.Create}
                            </Button>
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square mr-3"
                              disabled={disabled}
                              onClick={handleCreateAndMoreClick}
                            >
                              <RefreshCw className="h-4 w-4" />{' '}
                              {disabled ? 'Creating...' : strings.CreateandMore}
                            </Button>
                            <Button
                              color="secondary"
                              className="btn-square"
                              onClick={() => {
                                props.history.push('/admin/payroll/config', { tabNo: '1' });
                              }}
                            >
                              <Ban className="h-4 w-4" /> {strings.Cancel}
                            </Button>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      {disableLeavePage ? '' : <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateSalaryRoles);
