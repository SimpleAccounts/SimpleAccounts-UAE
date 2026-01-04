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
import { LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global';
import './style.scss';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import * as CreateProductCategoryActions from './actions';
import * as ProductCategoryActions from '../../actions';
import { Package, HelpCircle, CircleDot, RefreshCw, Ban } from '@/components/icons';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const createProductCategorySchema = z
  .object({
    productCategoryCode: z
      .string()
      .min(1, strings.ProductCategoryCodeRequired || 'Product Category Code is required')
      .max(20, 'Code is too long'),
    productCategoryName: z
      .string()
      .min(1, strings.ProductCategoryNameRequired || 'Product Category Name is required')
      .max(50, 'Name is too long'),
  })
  .refine(
    data => {
      return true; // Custom validation for duplicate code will be handled separately
    },
    {
      message: 'Product category code already exists',
      path: ['productCategoryCode'],
    }
  );

const mapStateToProps = state => {
  return {
    product_category_list: state.product_category.product_category_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    createProductCategoryActions: bindActionCreators(CreateProductCategoryActions, dispatch),
    productCategoryActions: bindActionCreators(ProductCategoryActions, dispatch),
  };
};

const regExBoth = /^[a-zA-Z0-9\s,'\-/()]+$/;

const CreateProductCategory = ({
  commonActions,
  createProductCategoryActions,
  productCategoryActions,
  history,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [createMore, setCreateMore] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [productCategoryList, setProductCategoryList] = useState([]);

  const form = useForm({
    resolver: zodResolver(createProductCategorySchema),
    defaultValues: {
      productCategoryCode: '',
      productCategoryName: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = form;

  useEffect(() => {
    productCategoryActions.getProductCategoryList().then(res => {
      if (res.status === 200) {
        const categoryList = res.data.data.map(item => item.productCategoryCode);
        setProductCategoryList(categoryList);
      }
    });
  }, [productCategoryActions]);

  const onSubmit = data => {
    // Check for duplicate code
    if (productCategoryList.includes(data.productCategoryCode)) {
      setError('productCategoryCode', {
        type: 'manual',
        message: 'Product category code already exists',
      });
      return;
    }

    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Creating Product Category...');

    createProductCategoryActions
      .createProductCategory(data)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          setLoading(false);
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Category Created Successfully'
          );

          if (createMore) {
            reset();
            // Refresh the category list
            productCategoryActions.getProductCategoryList().then(res => {
              if (res.status === 200) {
                const categoryList = res.data.data.map(item => item.productCategoryCode);
                setProductCategoryList(categoryList);
              }
            });
            setCreateMore(false);
            setDisableLeavePage(false);
          } else {
            history.push('/admin/master/product-category');
            setLoading(false);
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err && err.data ? err.data.message : 'Product Category Created Unsuccessfully'
        );
      });
  };

  const handleCodeChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regExBoth.test(value)) {
      onChange(e);
      // Clear error if it exists
      if (
        errors.productCategoryCode &&
        errors.productCategoryCode.message === 'Product category code already exists'
      ) {
        clearErrors('productCategoryCode');
      }
    }
  };

  const handleNameChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regExBoth.test(value)) {
      onChange(e);
    }
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="vat-code-create-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <Package className="h-4 w-4" />
                    <span className="ml-2">{strings.NewProductCategory}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                        <FormGroup>
                          <Label htmlFor="productCategoryCode">
                            <span className="text-danger">* </span>
                            {strings.ProductCategoryCode}
                            <HelpCircle
                              id="ProductcatcodeTooltip"
                              className="h-4 w-4 ml-1 inline"
                            />
                            <UncontrolledTooltip placement="right" target="ProductcatcodeTooltip">
                              Product Category Code - Unique identifier code of the product
                            </UncontrolledTooltip>
                          </Label>
                          <Controller
                            name="productCategoryCode"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                maxLength="20"
                                id="productCategoryCode"
                                placeholder={strings.Enter + strings.ProductCategoryCode}
                                {...field}
                                onChange={e => handleCodeChange(e, field.onChange)}
                                className={errors.productCategoryCode ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.productCategoryCode && (
                            <div className="invalid-feedback">
                              {errors.productCategoryCode.message}
                            </div>
                          )}
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="productCategoryName">
                            <span className="text-danger">* </span>
                            {strings.ProductCategoryName}
                          </Label>
                          <Controller
                            name="productCategoryName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                maxLength="50"
                                id="productCategoryName"
                                placeholder={strings.Enter + strings.ProductCategoryName}
                                {...field}
                                onChange={e => handleNameChange(e, field.onChange)}
                                className={errors.productCategoryName ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.productCategoryName && (
                            <div className="invalid-feedback">
                              {errors.productCategoryName.message}
                            </div>
                          )}
                        </FormGroup>
                        Note: If the product category is associated with the product, it cannot be
                        deleted.
                        <FormGroup className="text-right mt-5">
                          <Button
                            type="submit"
                            name="submit"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={disabled}
                            onClick={() => {
                              setCreateMore(false);
                            }}
                          >
                            <CircleDot className="h-4 w-4" />{' '}
                            {disabled ? 'Creating...' : strings.Create}
                          </Button>

                          <Button
                            type="submit"
                            name="button"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={disabled}
                            onClick={() => {
                              setCreateMore(true);
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
                              history.push('/admin/master/product-category');
                            }}
                          >
                            <Ban className="h-4 w-4" />
                            {strings.Cancel}
                          </Button>
                        </FormGroup>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateProductCategory);
