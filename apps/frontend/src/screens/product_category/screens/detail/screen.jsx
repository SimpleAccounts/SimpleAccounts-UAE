import React, { useState, useEffect, useCallback } from 'react';
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
} from 'reactstrap';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import './style.scss';
import * as DetailProductCategoryAction from './actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import * as ProductCategoryActions from '../../actions';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const detailProductCategorySchema = z
  .object({
    productCategoryCode: z
      .string()
      .min(1, 'Product category code is required')
      .max(20, 'Code is too long'),
    productCategoryName: z
      .string()
      .min(1, 'Product category name is required')
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
    detailProductCategoryAction: bindActionCreators(DetailProductCategoryAction, dispatch),
    productCategoryActions: bindActionCreators(ProductCategoryActions, dispatch),
  };
};

const regExBoth = /^[a-zA-Z0-9\s,'\-/()]+$/;

const DetailProductCategory = ({
  commonActions,
  detailProductCategoryAction,
  productCategoryActions,
  history,
  location,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [dialog, setDialog] = useState(null);
  const [currentProductCategoryId, setCurrentProductCategoryId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [isAssociatedWithProduct, setIsAssociatedWithProduct] = useState(false);
  const [productCategoryList, setProductCategoryList] = useState([]);
  const [originalCode, setOriginalCode] = useState('');

  const form = useForm({
    resolver: zodResolver(detailProductCategorySchema),
    defaultValues: {
      id: '',
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

  const getProductCategoryList = useCallback(() => {
    productCategoryActions.getProductCategoryList().then(res => {
      if (res.status === 200) {
        const categoryList = res.data.data.map(item => item.productCategoryCode);
        setProductCategoryList(categoryList);
      }
    });
  }, [productCategoryActions]);

  const getAssociatedProductWithCategory = useCallback(
    category_id => {
      detailProductCategoryAction
        .getProductBy()
        .then(res => {
          if (res.status === 200) {
            const hasAssociation = res.data.data.some(
              product => product.productCategoryId === category_id
            );
            setIsAssociatedWithProduct(hasAssociation);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    [detailProductCategoryAction]
  );

  const initializeData = useCallback(() => {
    const id = location.state?.id;
    if (location.state && id) {
      detailProductCategoryAction
        .getProductCategoryById(id)
        .then(res => {
          if (res.status === 200) {
            setLoading(false);
            setCurrentProductCategoryId(id);
            setOriginalCode(res.data.productCategoryCode);
            reset({
              id: res.data.id ? res.data.id : '',
              productCategoryCode: res.data.productCategoryCode ? res.data.productCategoryCode : '',
              productCategoryName: res.data.productCategoryName ? res.data.productCategoryName : '',
            });
            getAssociatedProductWithCategory(id);
          }
        })
        .catch(err => {
          setLoading(false);
          history.push('/admin/master/product-category');
        });
    } else {
      history.push('/admin/master/product-category');
    }
  }, [
    location.state,
    detailProductCategoryAction,
    history,
    reset,
    getAssociatedProductWithCategory,
  ]);

  useEffect(() => {
    getProductCategoryList();
    initializeData();
  }, [getProductCategoryList, initializeData]);

  const onSubmit = data => {
    // Check for duplicate code only if code has changed
    if (
      data.productCategoryCode !== originalCode &&
      productCategoryList.includes(data.productCategoryCode)
    ) {
      setError('productCategoryCode', {
        type: 'manual',
        message: 'Product category code already exists',
      });
      return;
    }

    setDisabled(true);
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Product Category...');

    const postData = {
      id: data.id,
      productCategoryName: data.productCategoryName ? data.productCategoryName : '',
      productCategoryCode: data.productCategoryCode ? data.productCategoryCode : '',
    };

    detailProductCategoryAction
      .updateProductCategory(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Category Updated Successfully'
          );
          history.push('/admin/master/product-category');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Product Category Updated Unsuccessfully'
        );
      });
  };

  const deleteProductCategory = () => {
    const message1 = (
      <text>
        <b>Delete Product Category?</b>
      </text>
    );
    const message = 'This Product Category will be deleted permanently and cannot be recovered. ';
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeProductCategory}
        cancelHandler={removeDialog}
        message={message}
        message1={message1}
      />
    );
  };

  const removeProductCategory = () => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Product Category...');
    detailProductCategoryAction
      .deleteProductCategory(currentProductCategoryId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Product Category Deleted Successfully'
          );
          history.push('/admin/master/product-category');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled1(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Product Category Deleted Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
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
      <div className="detail-vat-code-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-boxes" />
                    <span className="ml-2"> {strings.UpdateProductCategory}</span>
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
                        <Row>
                          <Col
                            lg={12}
                            className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
                          >
                            <FormGroup>
                              {isAssociatedWithProduct === false && (
                                <Button
                                  type="button"
                                  color="danger"
                                  className="btn-square"
                                  disabled={disabled1}
                                  onClick={deleteProductCategory}
                                >
                                  <i className="fa fa-trash"></i>{' '}
                                  {disabled1 ? 'Deleting...' : strings.Delete}
                                </Button>
                              )}
                            </FormGroup>
                            <FormGroup className="text-right">
                              <Button
                                type="submit"
                                name="submit"
                                color="primary"
                                className="btn-square mr-3"
                                disabled={disabled}
                              >
                                <i className="fa fa-dot-circle-o"></i>{' '}
                                {disabled ? 'Updating...' : strings.Update}
                              </Button>
                              <Button
                                type="button"
                                color="secondary"
                                className="btn-square"
                                onClick={() => {
                                  history.push('/admin/master/product-category');
                                }}
                              >
                                <i className="fa fa-ban mr-1"></i>
                                {strings.Cancel}
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
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailProductCategory);
