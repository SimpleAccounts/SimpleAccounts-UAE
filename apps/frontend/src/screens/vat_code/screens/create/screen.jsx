import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Form,
  FormGroup,
  Label,
  Row,
  Col,
  UncontrolledTooltip,
} from 'components/migration';
import { Loader } from 'components';
import { CommonActions } from 'services/global';
import './style.scss';
import * as VatCreateActions from './actions';
import * as VatActions from '../../actions';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import { Input as ShadcnInput } from '@/components/ui/input';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { Ban, CircleDot, HelpCircle, RefreshCw } from 'lucide-react';

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator
      suffix="%"
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    vat_row: state.vat.vat_row,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    vatActions: bindActionCreators(VatActions, dispatch),
    vatCreateActions: bindActionCreators(VatCreateActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

// Zod validation schema
const createVatCodeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(30, 'Name is too long')
    .regex(/^[a-zA-Z0-9 ]+$/, 'Name must contain only letters, numbers, and spaces'),
  vat: z
    .string()
    .min(1, 'Percentage is required')
    .regex(/^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$/, 'Invalid percentage value'),
});

const CreateVatCode = ({ vatActions, vatCreateActions, commonActions, history }) => {
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [vatList, setVatList] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const form = useForm({
    resolver: zodResolver(createVatCodeSchema),
    defaultValues: {
      name: '',
      vat: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = form;

  const nameValue = watch('name');

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, []);

  // Check for duplicate VAT category name
  useEffect(() => {
    if (nameValue && vatList.includes(nameValue)) {
      setError('name', {
        type: 'manual',
        message: 'VAT category already exists',
      });
    }
  }, [nameValue, vatList, setError]);

  const initializeData = () => {
    vatActions.getVatList().then(res => {
      if (res.status === 200) {
        const list = res.data.data.map(item => item.name);
        setVatList(list);
      }
    });
  };

  const onSubmit = data => {
    // Check for duplicate name
    if (vatList.includes(data.name)) {
      setError('name', {
        type: 'manual',
        message: 'VAT category already exists',
      });
      return;
    }

    setDisabled(true);
    vatCreateActions
      .createVat(data)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert('success', 'New VAT category Created Successfully!');
          reset();
          if (createMore) {
            setCreateMore(false);
            initializeData();
          } else {
            history.push('/admin/master/vat-category');
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err.data.message);
      });
  };

  const vatCode = /[a-zA-Z0-9 ]+$/;

  return (
    <div className="vat-code-create-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <div className="h4 mb-0 d-flex align-items-center">
                  <i className="nav-icon icon-briefcase" />
                  <span className="ml-2">New Tax Category</span>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                      <FormGroup>
                        <Label htmlFor="name">
                          <span className="text-danger">* </span>
                          {strings.VatCategoryName}
                          <HelpCircle id="VatCodeTooltip" className="h-4 w-4 inline" />
                          <UncontrolledTooltip placement="right" target="VatCodeTooltip">
                            VAT Category Name – Unique identifier VAT category name
                          </UncontrolledTooltip>
                        </Label>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              maxLength="30"
                              id="name"
                              placeholder="Enter Tax Category Name"
                              {...field}
                              onChange={e => {
                                if (e.target.value === '' || vatCode.test(e.target.value)) {
                                  field.onChange(e);
                                }
                              }}
                              className={errors.name ? 'is-invalid' : ''}
                            />
                          )}
                        />
                        {errors.name && (
                          <div className="invalid-feedback d-block">{errors.name.message}</div>
                        )}
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="vat">
                          <span className="text-danger">* </span>
                          {strings.Percentage}
                          <HelpCircle id="VatPercentTooltip" className="h-4 w-4 inline" />
                          <UncontrolledTooltip placement="right" target="VatPercentTooltip">
                            Percentage – VAT percentage charged by your country
                          </UncontrolledTooltip>
                        </Label>
                        <Controller
                          name="vat"
                          control={control}
                          render={({ field }) => (
                            <div className="w-full">
                              <NumberFormat
                                customInput={ShadcnInput}
                                type="text"
                                id="vat"
                                placeholder="Enter VAT Percentage"
                                {...field}
                                className={errors.vat ? 'border-red-500' : ''}
                                onValueChange={values => {
                                  field.onChange(values.value);
                                }}
                                thousandSeparator
                                suffix="%"
                                maxLength={5}
                              />
                            </div>
                          )}
                        />
                        {errors.vat && (
                          <div className="invalid-feedback d-block">{errors.vat.message}</div>
                        )}
                      </FormGroup>
                      <FormGroup className="text-right mt-5">
                        <Button
                          type="button"
                          name="submit"
                          color="primary"
                          className="btn-square mr-3"
                          disabled={disabled}
                          onClick={() => {
                            setCreateMore(false);
                            handleSubmit(onSubmit)();
                          }}
                        >
                          <CircleDot className="h-4 w-4" />{' '}
                          {disabled ? 'Creating...' : strings.Create}
                        </Button>
                        <Button
                          name="button"
                          color="primary"
                          className="btn-square mr-3"
                          disabled={disabled}
                          onClick={() => {
                            setCreateMore(true);
                            handleSubmit(onSubmit)();
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />{' '}
                          {disabled ? 'Creating...' : strings.CreateandMore}
                        </Button>
                        <Button
                          type="button"
                          color="secondary"
                          className="btn-square"
                          onClick={() => {
                            history.push('/admin/master/vat-category');
                          }}
                        >
                          <Ban className="h-4 w-4" /> {strings.Cancel}
                        </Button>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {loading ? <Loader></Loader> : ''}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateVatCode);
