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
} from 'components/migration';
import { toast } from 'sonner';
import Select from 'react-select';
import Autosuggest from 'react-autosuggest';
import { Loader } from 'components';

import './style.scss';

import * as TransactionActions from './actions';
import { Trash2, CircleDot, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    transactionActions: bindActionCreators(TransactionActions, dispatch),
  };
};

// Zod validation schema
const updateTransactionCategorySchema = z.object({
  categoryName: z.string().min(1, 'Category Name is required'),
  categoryCode: z.string().min(1, 'Category Code is required'),
  categoryDiscription: z.string().min(1, 'Category Description is required'),
  defaltFlag: z.string(),
  selectVatCategoryCode: z.string().optional(),
});

const DetailTransactionCategory = ({ transactionActions, history, location }) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [parentValue, setParentValue] = useState('');
  const [parentSuggestions, setParentSuggestions] = useState([]);
  const [transactionCategoryList, setTransactionCategoryList] = useState([]);
  const [parentCategoryCodeList, setParentCategoryCodeList] = useState([]);
  const [vatCategoryList, setVatCategoryList] = useState([]);
  const [selectedTransactionCategory, setSelectedTransactionCategory] = useState(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [id, setId] = useState(null);

  const form = useForm({
    resolver: zodResolver(updateTransactionCategorySchema),
    defaultValues: {
      categoryName: '',
      categoryCode: '',
      categoryDiscription: '',
      defaltFlag: 'N',
      selectVatCategoryCode: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = form;

  useEffect(() => {
    getTransactionTypes();
    getTransactionVatCategories();

    const searchParams = new URLSearchParams(location.search);
    const transactionId = searchParams.get('id');

    if (transactionId) {
      setId(transactionId);
      setLoading(true);
      transactionActions.getTransactionByID(transactionId).then(res => {
        if (res.status === 200) {
          const {
            transactionCategoryId,
            transactionCategoryName,
            transactionCategoryCode,
            transactionCategoryDescription,
            parentTransactionCategory,
            defaltFlag,
            transactionType,
          } = res.data;

          reset({
            categoryName: transactionCategoryName,
            categoryCode: transactionCategoryCode,
            categoryDiscription: transactionCategoryDescription,
            defaltFlag: defaltFlag,
            selectVatCategoryCode: '',
          });

          setValue(transactionType.transactionTypeName);
          setParentValue(parentTransactionCategory?.transactionCategoryName || '');
          setSelectedParentCategory(parentTransactionCategory);
          setSelectedTransactionCategory(transactionType);
          setLoading(false);
        }
      });
    }
  }, [location.search]);

  // --------------------------------------
  // Transaction Type Suggestion Callbacks
  //---------------------------------------

  const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : transactionCategoryList.filter(
          transaction =>
            transaction.transactionTypeName.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = suggestion => {
    return suggestion.transactionTypeName;
  };

  const renderSuggestion = suggestion => {
    return <div>{suggestion.transactionTypeName}</div>;
  };

  const onChangeTransactionType = (event, { newValue }) => {
    setValue(newValue);
  };

  const onSuggestionSelected = (e, val) => {
    setSelectedTransactionCategory(val.suggestion);
  };

  const getParentCategoryCodeListData = val => {
    if (!selectedTransactionCategory) return;
    const code = selectedTransactionCategory.transactionTypeCode;
    transactionActions.getParentCategoryCodeListData(code, val).then(res => {
      if (res.status === 200) {
        setLoading(false);
        setParentCategoryCodeList(res.data);
      }
    });
  };

  // ----------------------------------------------
  // Parent Transaction Type Suggestion Callbacks
  //-----------------------------------------------

  const getParentSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    getParentCategoryCodeListData(inputValue);
    return inputLength === 0
      ? []
      : parentCategoryCodeList.filter(
          transaction =>
            transaction.transactionCategoryName.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  const getParentSuggestionValue = suggestion => {
    return suggestion.transactionCategoryName;
  };

  const renderParentSuggestion = suggestion => {
    return <div>{suggestion.transactionCategoryName}</div>;
  };

  const onParentChange = (event, { newValue }) => {
    setParentValue(newValue);
  };

  const onParentSuggestionsFetchRequested = ({ value }) => {
    setParentSuggestions(getParentSuggestions(value));
  };

  const onParentSuggestionsClearRequested = () => {
    setParentSuggestions([]);
  };

  const onParentSuggestionSelected = (e, val) => {
    setSelectedParentCategory(val.suggestion);
  };

  // Get All Transaction Types
  const getTransactionTypes = () => {
    setLoading(true);
    transactionActions.getTransactionTypes().then(res => {
      if (res.status === 200) {
        setLoading(false);
        setTransactionCategoryList(res.data);
      }
    });
  };

  // Get All Transaction VAT Categories
  const getTransactionVatCategories = () => {
    setLoading(true);
    transactionActions.getTransactionVatCategories().then(res => {
      if (res.status === 200) {
        setLoading(false);
        setVatCategoryList(res.data);
      }
    });
  };

  // Show Success Message
  const success = () => {
    return toast.success('Transaction Category Updated successfully... ', {
      position: 'top-right',
    });
  };

  // Update Transaction
  const onSubmit = data => {
    const postObj = {
      transactionCategoryId: id ? id : '0',
      transactionCategoryName: data.categoryName,
      transactionCategoryCode: data.categoryCode,
      defaltFlag: data.defaltFlag,
      parentTransactionCategory: selectedParentCategory
        ? selectedParentCategory.transactionCategoryId
        : '',
      transactionCategoryDescription: data.categoryDiscription,
      vatCategory: data.selectVatCategoryCode,
      transactionType: selectedTransactionCategory
        ? selectedTransactionCategory.transactionTypeCode
        : '',
    };

    transactionActions.createAndUpdateTransaction(postObj).then(res => {
      if (res.status === 200) {
        success();
        history.push('/admin/settings/transaction-category');
      }
    });
  };

  const inputProps = {
    placeholder: 'Type Transaction CategoryType',
    value: value,
    onChange: onChangeTransactionType,
  };

  const parentInputProps = {
    placeholder: 'Type Parent Category Code',
    value: parentValue,
    onChange: onParentChange,
  };

  return loading === true ? (
    <Loader />
  ) : (
    <div>
      <div className="detial-transaction-category-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-graph" />
                    <span className="ml-2">Update Transaction Category</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                        <FormGroup>
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Controller
                            name="categoryName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                id="categoryName"
                                placeholder="Enter Category Name"
                                {...field}
                                className={errors.categoryName ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.categoryName && (
                            <div className="invalid-feedback d-block">
                              {errors.categoryName.message}
                            </div>
                          )}
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="categoryCode">Category Code</Label>
                          <Controller
                            name="categoryCode"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                id="categoryCode"
                                placeholder="Enter Category Code"
                                {...field}
                                className={errors.categoryCode ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.categoryCode && (
                            <div className="invalid-feedback d-block">
                              {errors.categoryCode.message}
                            </div>
                          )}
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="categoryDiscription">Category Description</Label>
                          <Controller
                            name="categoryDiscription"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="textarea"
                                id="categoryDiscription"
                                placeholder="Enter Category Description"
                                {...field}
                                rows="5"
                                className={errors.categoryDiscription ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.categoryDiscription && (
                            <div className="invalid-feedback d-block">
                              {errors.categoryDiscription.message}
                            </div>
                          )}
                        </FormGroup>
                        <hr />
                        <FormGroup>
                          <div className="d-flex">
                            <Label>Default Flag</Label>
                            <Col xs="1"></Col>
                            <div>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <Controller
                                    name="defaltFlag"
                                    control={control}
                                    render={({ field }) => (
                                      <>
                                        <input
                                          className="custom-control-input"
                                          type="radio"
                                          id="inline-radio1"
                                          value="Y"
                                          checked={field.value === 'Y'}
                                          onChange={() => field.onChange('Y')}
                                        />
                                        <label
                                          className="custom-control-label"
                                          htmlFor="inline-radio1"
                                        >
                                          Yes
                                        </label>
                                      </>
                                    )}
                                  />
                                </div>
                              </FormGroup>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <Controller
                                    name="defaltFlag"
                                    control={control}
                                    render={({ field }) => (
                                      <>
                                        <input
                                          className="custom-control-input"
                                          type="radio"
                                          id="inline-radio2"
                                          value="N"
                                          checked={field.value === 'N'}
                                          onChange={() => field.onChange('N')}
                                        />
                                        <label
                                          className="custom-control-label"
                                          htmlFor="inline-radio2"
                                        >
                                          No
                                        </label>
                                      </>
                                    )}
                                  />
                                </div>
                              </FormGroup>
                            </div>
                          </div>
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="selectCategoryCode">VAT Code</Label>
                          <Select
                            id="selectCategoryCode"
                            name="selectCategoryCode"
                            options={null}
                          />
                        </FormGroup>

                        <FormGroup className="auto-suggestion-form-group">
                          <Label htmlFor="selectTransactionType">Transaction Type</Label>
                          <Autosuggest
                            className="autoSuggest form-control"
                            suggestions={suggestions}
                            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                            onSuggestionsClearRequested={onSuggestionsClearRequested}
                            getSuggestionValue={getSuggestionValue}
                            onSuggestionSelected={onSuggestionSelected}
                            renderSuggestion={renderSuggestion}
                            inputProps={inputProps}
                          />
                        </FormGroup>

                        {selectedTransactionCategory ? (
                          <FormGroup className="auto-suggestion-form-group">
                            <Label htmlFor="selectTransactionType">Parent Transaction Type</Label>
                            <Autosuggest
                              className="autoSuggest form-control"
                              suggestions={parentSuggestions}
                              onSuggestionsFetchRequested={onParentSuggestionsFetchRequested}
                              onSuggestionsClearRequested={onParentSuggestionsClearRequested}
                              getSuggestionValue={getParentSuggestionValue}
                              onSuggestionSelected={onParentSuggestionSelected}
                              renderSuggestion={renderParentSuggestion}
                              inputProps={parentInputProps}
                            />
                          </FormGroup>
                        ) : (
                          ''
                        )}
                        <Row>
                          <Col
                            lg={12}
                            className="d-flex flex-wrap align-items-center justify-content-between mt-5"
                          >
                            <FormGroup>
                              <Button type="button" color="danger" className="btn-square">
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button type="submit" color="primary" className="btn-square mr-3">
                                <CircleDot className="h-4 w-4" /> Save
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/settings/transaction-category');
                                }}
                              >
                                <Ban className="h-4 w-4" /> Cancel
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
          {loading ? <Loader></Loader> : ''}
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailTransactionCategory);
