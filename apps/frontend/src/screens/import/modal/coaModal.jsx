import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  ModalHeader,
} from 'components/migration';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';

import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

import '../style.scss';

import { Loader } from 'components';

import * as ChartOfAccountActions from '../../chart_account/actions';
import * as CreateChartOfAccountActions from '../../chart_account/screens/create/actions';
import { UserCircle, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    sub_transaction_type_list: state.chart_account.sub_transaction_type_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ChartOfAccountActions: bindActionCreators(ChartOfAccountActions, dispatch),
    createChartOfAccountActions: bindActionCreators(CreateChartOfAccountActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    },
  }),
};

const strings = new LocalizedStrings(data);

// Zod validation schema
const chartOfAccountSchema = z.object({
  transactionCategoryName: z.string().optional(),
  chartOfAccount: z
    .object({
      value: z.any(),
      label: z.string().optional(),
    })
    .refine(val => val && val.value, {
      message: 'Type is required',
    }),
});

const AddEmployeesModal = props => {
  const {
    openModal,
    closeModal,
    coaName,
    ChartOfAccountActions,
    createChartOfAccountActions,
    commonActions,
  } = props;

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [exist, setExist] = useState(false);
  const [chartOfAccountCategory, setChartOfAccountCategory] = useState([]);

  strings.setLanguage(language);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(chartOfAccountSchema),
    defaultValues: {
      transactionCategoryName: '',
      chartOfAccount: '',
    },
  });

  const regExAlpha = /^[A-Za-z0-9 !@#$%^&*)(+=._-]+$/;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    ChartOfAccountActions.getSubTransactionTypes().then(res => {
      if (res.status === 200) {
        const val = Object.assign({}, res.data);
        const temp = [];
        Object.keys(val).forEach(item => {
          temp.push({
            label: item,
            options: val[`${item}`],
          });
        });
        setChartOfAccountCategory(temp);
      }
    });
  };

  const validationCheck = value => {
    const data = {
      moduleType: 16,
      name: value,
    };
    createChartOfAccountActions.checkValidation(data).then(response => {
      if (response.data === 'Transaction Category Name Already Exists') {
        setExist(true);
      } else {
        setExist(false);
      }
    });
  };

  const onSubmit = data => {
    if (exist) {
      commonActions.tostifyAlert('error', 'Chart Of Account Name already exists');
      return;
    }

    setDisabled(true);
    const postData = {
      transactionCategoryName: coaName,
      chartOfAccount: data.chartOfAccount.value,
    };

    createChartOfAccountActions
      .createTransactionCategory(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert('success', 'New Chart of Account Created Successfully');
          if (createMore) {
            setCreateMore(false);
            reset();
          } else {
            closeModal(false);
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Something Went Wrong'
        );
      });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openModal} className="modal-success chartofaccounts-modal">
        <ModalHeader>
          <Row>
            <Col lg={12}>
              <div className="h4 mb-0 d-flex align-items-center">
                <UserCircle className="h-4 w-4" />
                <span className="ml-2">Create Chart Of Account</span>
              </div>
            </Col>
          </Row>
        </ModalHeader>
        <ModalBody>
          <div>
            <div>
              {loading ? (
                <Row>
                  <Col lg={12}>
                    <Loader />
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col lg={12}>
                    <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                      <FormGroup>
                        <Label htmlFor="name">
                          <span className="text-danger">* </span>
                          {strings.Name}
                        </Label>
                        <Controller
                          name="transactionCategoryName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              maxLength="50"
                              id="transactionCategoryName"
                              name="transactionCategoryName"
                              placeholder={strings.Enter + strings.Name}
                              disabled={true}
                              value={coaName}
                              className={
                                (errors.transactionCategoryName &&
                                  touchedFields.transactionCategoryName) ||
                                exist
                                  ? 'is-invalid'
                                  : ''
                              }
                            />
                          )}
                        />
                        {errors.transactionCategoryName &&
                          touchedFields.transactionCategoryName && (
                            <div className="invalid-feedback">
                              {errors.transactionCategoryName.message}
                            </div>
                          )}
                        {exist && (
                          <div className="invalid-feedback">
                            Chart Of Account Name is already exist
                          </div>
                        )}
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="name">
                          <span className="text-danger">* </span>
                          {strings.Type}
                        </Label>
                        <Controller
                          name="chartOfAccount"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              styles={customStyles}
                              id="chartOfAccount"
                              name="chartOfAccount"
                              placeholder={strings.Select + strings.Type}
                              options={chartOfAccountCategory}
                              className={
                                errors.chartOfAccount && touchedFields.chartOfAccount
                                  ? 'is-invalid'
                                  : ''
                              }
                            />
                          )}
                        />
                        {errors.chartOfAccount && touchedFields.chartOfAccount && (
                          <div className="invalid-feedback">{errors.chartOfAccount.message}</div>
                        )}
                      </FormGroup>
                      <FormGroup className="text-right mt-5">
                        <Button
                          type="submit"
                          name="submit"
                          color="primary"
                          className="btn-square mr-3"
                          disabled={disabled}
                        >
                          <CircleDot className="h-4 w-4" />{' '}
                          {disabled ? 'Creating...' : strings.Create}
                        </Button>

                        <Button
                          color="secondary"
                          className="btn-square"
                          onClick={() => {
                            closeModal(false);
                          }}
                        >
                          <Ban className="h-4 w-4" /> Cancel
                        </Button>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              )}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEmployeesModal);
