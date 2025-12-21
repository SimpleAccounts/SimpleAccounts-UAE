import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  CardHeader,
  ModalBody,
  ModalFooter,
  UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import * as ProductActions from '../../product/actions';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import '../../product/screens/create/style.scss';
import { toast } from 'sonner';
import { selectOptionsFactory } from 'utils';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import { Ban, CircleDot, HelpCircle, IdCard } from 'lucide-react';

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
    },
  }),
};

let strings = new LocalizedStrings(data);

// Validation schema
const productSchema = z
  .object({
    productName: z.string().min(1, 'Product Name is required'),
    productDescription: z.string().optional(),
    productCode: z.string().min(1, 'Product Code is Required'),
    vatCategoryId: z.string().min(1, 'VAT Category is Required'),
    productCategoryId: z.string().optional(),
    productWarehouseId: z.string().optional(),
    vatIncluded: z.boolean().default(false),
    productType: z.enum(['GOODS', 'SERVICE']).default('GOODS'),
    salesUnitPrice: z.string().optional(),
    purchaseUnitPrice: z.string().optional(),
    productPriceType: z.array(z.string()).min(1, 'At least one Selling type is Required'),
    salesTransactionCategoryId: z.string().optional(),
    purchaseTransactionCategoryId: z.string().optional(),
    salesDescription: z.string().optional(),
    purchaseDescription: z.string().optional(),
    productSalesPriceType: z.string().optional(),
    productPurchasePriceType: z.string().optional(),
    disabled: z.boolean().default(false),
  })
  .refine(
    data => {
      if (data.productPriceType.includes('PURCHASE')) {
        return !!data.purchaseUnitPrice && data.purchaseUnitPrice.length > 0;
      }
      return true;
    },
    {
      message: 'Purchase Price is Required',
      path: ['purchaseUnitPrice'],
    }
  )
  .refine(
    data => {
      if (data.productPriceType.includes('PURCHASE')) {
        return (
          !!data.purchaseTransactionCategoryId && data.purchaseTransactionCategoryId.length > 0
        );
      }
      return true;
    },
    {
      message: 'Purchase Category is Required',
      path: ['purchaseTransactionCategoryId'],
    }
  )
  .refine(
    data => {
      if (data.productPriceType.includes('SALES')) {
        return !!data.salesTransactionCategoryId && data.salesTransactionCategoryId.length > 0;
      }
      return true;
    },
    {
      message: 'Selling Category is Required',
      path: ['salesTransactionCategoryId'],
    }
  )
  .refine(
    data => {
      if (data.productPriceType.includes('SALES')) {
        return !!data.salesUnitPrice && data.salesUnitPrice.length > 0;
      }
      return true;
    },
    {
      message: 'Selling Price is Required',
      path: ['salesUnitPrice'],
    }
  );

const ProductModal = ({
  openProductModal,
  closeProductModal,
  vat_list,
  product_category_list,
  salesCategory,
  purchaseCategory,
  createProduct,
  getCurrentProduct,
  productActions,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [disabled, setDisabled] = useState(false);
  const [exist, setExist] = useState(false);
  const [productExist, setProductExist] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(true);

  const regEx = /^[0-9]+$/;
  const regExBoth = /[ +a-zA-Z0-9-./\\|!@#$%^&*()_<>,]+$/;
  const regExAlpha = /^[a-zA-Z ]+$/;
  const regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$/;

  strings.setLanguage(language);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      productCode: '',
      vatCategoryId: '',
      productCategoryId: '',
      productWarehouseId: '',
      vatIncluded: false,
      productType: 'GOODS',
      salesUnitPrice: '',
      purchaseUnitPrice: '',
      productPriceType: ['SALES'],
      salesTransactionCategoryId: { value: 84, label: 'Sales' },
      purchaseTransactionCategoryId: {
        value: 49,
        label: 'Cost of Goods Sold',
      },
      salesDescription: '',
      purchaseDescription: '',
      productSalesPriceType: '',
      productPurchasePriceType: '',
      disabled: false,
    },
  });

  const productPriceType = watch('productPriceType');

  useEffect(() => {
    if (openProductModal) {
      getProductCode();
    }
  }, [openProductModal]);

  useEffect(() => {
    if (exist) {
      setError('productName', {
        type: 'manual',
        message: 'Product Name is already exist',
      });
    } else {
      clearErrors('productName');
    }
  }, [exist, setError, clearErrors]);

  useEffect(() => {
    if (productExist) {
      setError('productCode', {
        type: 'manual',
        message: 'Product Code is already exist',
      });
    } else {
      clearErrors('productCode');
    }
  }, [productExist, setError, clearErrors]);

  const getProductCode = () => {
    productActions.getProductCode().then(res => {
      if (res.status === 200) {
        setValue('productCode', res.data, { shouldValidate: true });
      }
    });
  };

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const onSubmit = data => {
    setDisabled(true);
    const productCode = data['productCode'];
    const salesUnitPrice = data['salesUnitPrice'];
    const salesTransactionCategoryId = data['salesTransactionCategoryId'];
    const salesDescription = data['salesDescription'];
    const purchaseDescription = data['purchaseDescription'];
    const purchaseTransactionCategoryId = data['purchaseTransactionCategoryId'];
    const purchaseUnitPrice = data['purchaseUnitPrice'];
    const vatCategoryId = data['vatCategoryId'];
    const vatIncluded = data['vatIncluded'];

    let productPriceTypeValue;
    if (data['productPriceType'].includes('SALES')) {
      productPriceTypeValue = 'SALES';
    }
    if (data['productPriceType'].includes('PURCHASE')) {
      productPriceTypeValue = 'PURCHASE';
    }
    if (
      data['productPriceType'].includes('SALES') &&
      data['productPriceType'].includes('PURCHASE')
    ) {
      productPriceTypeValue = 'BOTH';
    }

    const productName = data['productName'];
    const productType = data['productType'];

    const dataNew = {
      productCode,
      productName,
      productType,
      productPriceType: productPriceTypeValue,
      vatCategoryId,
      vatIncluded,

      ...(salesUnitPrice.length !== 0 && {
        salesUnitPrice,
      }),
      ...(salesTransactionCategoryId.length !== 0 && {
        salesTransactionCategoryId,
      }),
      ...(salesDescription.length !== 0 && {
        salesDescription,
      }),
      ...(purchaseDescription.length !== 0 && {
        purchaseDescription,
      }),
      ...(purchaseTransactionCategoryId.length !== 0 && {
        purchaseTransactionCategoryId,
      }),
      ...(purchaseUnitPrice.length !== 0 && {
        purchaseUnitPrice,
      }),
    };

    const postData = getData(dataNew);
    createProduct(postData)
      .then(res => {
        if (res.status === 200) {
          reset();
          closeProductModal(true);
          getCurrentProduct(res.data);
        }
      })
      .catch(err => {
        displayMsg(err);
        setDisabled(false);
      });
  };

  const displayMsg = err => {
    toast.error(`${err.data}`, {
      position: 'top-right',
    });
  };

  const validationCheck = value => {
    const data = {
      moduleType: 1,
      name: value,
    };
    productActions.checkValidation(data).then(response => {
      if (response.data === 'Product name Already Exists') {
        setExist(true);
      } else {
        setExist(false);
      }
    });
  };

  const ProductvalidationCheck = value => {
    const data = {
      moduleType: 7,
      productCode: value,
    };
    productActions.checkProductNameValidation(data).then(response => {
      if (response.data === 'Product code Already Exists') {
        setProductExist(true);
      } else {
        setProductExist(false);
      }
    });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openProductModal} className="modal-success contact-modal">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <IdCard className="h-4 w-4" />
                  <span className="ml-2">{strings.CreateProduct}</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <ModalBody>
            <Row>
              <Col lg={4}>
                <FormGroup check inline className="mb-3">
                  <Label className="productlabel mb-0 mr-1">{strings.Type}</Label>
                  <div className="wrapper">
                    <Label className="form-check-label mr-1" check htmlFor="producttypeone">
                      <Controller
                        name="productType"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="form-check-input"
                            type="radio"
                            id="producttypeone"
                            value="GOODS"
                            checked={field.value === 'GOODS'}
                          />
                        )}
                      />
                      {strings.Goods}
                    </Label>
                    <Label className="form-check-label" check htmlFor="producttypetwo">
                      <Controller
                        name="productType"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="form-check-input"
                            type="radio"
                            id="producttypetwo"
                            value="SERVICE"
                            checked={field.value === 'SERVICE'}
                          />
                        )}
                      />
                      {strings.Service}
                    </Label>
                  </div>
                </FormGroup>
              </Col>

              <Col lg={4}>
                <FormGroup check inline className="mb-3">
                  <Label className="productlabel mb-0 mr-1">
                    <span className="text-danger">* </span>
                    {strings.Status}
                  </Label>
                  <div className="wrapper">
                    <Label className="form-check-label mr-1" check>
                      <Input
                        className="form-check-input"
                        type="radio"
                        id="inline-radio1"
                        name="isActive"
                        checked={selectedStatus}
                        value={true}
                        onChange={e => {
                          if (e.target.value === 'true') {
                            setSelectedStatus(true);
                            setIsActive(true);
                          }
                        }}
                      />
                      {strings.Active}
                    </Label>
                    <Label className="productlabel mb-0 mr-1" check>
                      <Input
                        className="form-check-input"
                        type="radio"
                        id="inline-radio2"
                        name="isActive"
                        value={false}
                        checked={!selectedStatus}
                        onChange={e => {
                          if (e.target.value === 'false') {
                            setSelectedStatus(false);
                            setIsActive(false);
                          }
                        }}
                      />
                      {strings.Inactive}
                    </Label>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="productName">
                    <span className="text-danger">* </span> {strings.Name}
                  </Label>
                  <Controller
                    name="productName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        maxLength="70"
                        id="productName"
                        onChange={e => {
                          if (e.target.value === '' || regExBoth.test(e.target.value)) {
                            field.onChange(e);
                            validationCheck(e.target.value);
                          }
                        }}
                        placeholder={strings.Enter + strings.ProductName}
                        className={errors.productName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.productName && (
                    <div className="invalid-feedback">{errors.productName.message}</div>
                  )}
                </FormGroup>
              </Col>

              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="productCode">
                    <span className="text-danger">* </span>
                    {strings.ProductCode}
                    <HelpCircle id="ProductCodeTooltip" className="h-4 w-4 inline" />
                    <UncontrolledTooltip placement="right" target="ProductCodeTooltip">
                      Product Code - Unique identifier code for the product
                    </UncontrolledTooltip>
                  </Label>
                  <Controller
                    name="productCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        maxLength="70"
                        id="productCode"
                        placeholder={strings.Enter + strings.ProductCode}
                        onChange={e => {
                          if (e.target.value === '' || regExBoth.test(e.target.value)) {
                            field.onChange(e);
                            ProductvalidationCheck(e.target.value);
                          }
                        }}
                        className={errors.productCode ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.productCode && (
                    <div className="invalid-feedback">{errors.productCode.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="productCategoryId">{strings.ProductCategory}</Label>
                  <Controller
                    name="productCategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        styles={customStyles}
                        className="select-default-width"
                        options={
                          product_category_list && product_category_list.data
                            ? selectOptionsFactory.renderOptions(
                                'productCategoryName',
                                'id',
                                product_category_list.data,
                                'Product Category'
                              )
                            : []
                        }
                        id="productCategoryId"
                        placeholder={strings.Select + strings.ProductCategory}
                        value={
                          product_category_list &&
                          product_category_list.data &&
                          selectOptionsFactory
                            .renderOptions(
                              'productCategoryName',
                              'id',
                              product_category_list.data,
                              'Product Category'
                            )
                            .find(option => option.value === field.value)
                        }
                        onChange={option => {
                          if (option && option.value) {
                            field.onChange(option.value);
                          } else {
                            field.onChange('');
                          }
                        }}
                      />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col lg={4}>
                <FormGroup className="mb-3">
                  <Label htmlFor="vatCategoryId">
                    <span className="text-danger">* </span> {strings.VatPercentage}
                  </Label>
                  <Controller
                    name="vatCategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        styles={customStyles}
                        options={
                          vat_list
                            ? selectOptionsFactory.renderOptions('name', 'id', vat_list, 'VAT')
                            : []
                        }
                        id="vatCategoryId"
                        placeholder={strings.Select + strings.VATCategory}
                        value={
                          vat_list &&
                          selectOptionsFactory
                            .renderOptions('name', 'id', vat_list, 'VAT')
                            .find(option => option.value === field.value)
                        }
                        onChange={option => {
                          if (option && option.value) {
                            field.onChange(option.value);
                          } else {
                            field.onChange('');
                          }
                        }}
                        className={errors.vatCategoryId ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.vatCategoryId && (
                    <div className="invalid-feedback">{errors.vatCategoryId.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row className="secondary-info">
              <Col lg={4}>
                <FormGroup check inline className="mb-3">
                  <Label className="form-check-label" check htmlFor="productPriceTypeOne">
                    <Controller
                      name="productPriceType"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="checkbox"
                          id="productPriceTypeOne"
                          onChange={event => {
                            if (field.value.includes('SALES')) {
                              const nextValue = field.value.filter(value => value !== 'SALES');
                              field.onChange(nextValue);
                            } else {
                              const nextValue = field.value.concat('SALES');
                              field.onChange(nextValue);
                            }
                          }}
                          checked={field.value.includes('SALES')}
                          className={errors.productPriceType ? 'is-invalid' : ''}
                        />
                      )}
                    />
                    {strings.SalesInformation}
                    {errors.productPriceType && (
                      <div className="invalid-feedback">{errors.productPriceType.message}</div>
                    )}
                  </Label>
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label htmlFor="salesUnitPrice">
                    <span className="text-danger">* </span> {strings.SellingPrice}
                    <HelpCircle id="SalesTooltip" className="h-4 w-4 inline" />
                    <UncontrolledTooltip placement="right" target="SalesTooltip">
                      Selling price – Price at which your product is sold
                    </UncontrolledTooltip>
                  </Label>
                  <Controller
                    name="salesUnitPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        maxLength="10"
                        id="salesUnitPrice"
                        placeholder={strings.Enter + strings.SellingPrice}
                        readOnly={!productPriceType.includes('SALES')}
                        onChange={e => {
                          if (e.target.value === '' || regDecimal.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.salesUnitPrice ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.salesUnitPrice && (
                    <div className="invalid-feedback">{errors.salesUnitPrice.message}</div>
                  )}
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label htmlFor="salesTransactionCategoryId">
                    <span className="text-danger">* </span> {strings.Account}
                  </Label>
                  <Controller
                    name="salesTransactionCategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        styles={customStyles}
                        isDisabled={!productPriceType.includes('SALES')}
                        options={salesCategory ? salesCategory : []}
                        value={
                          salesCategory && typeof field.value === 'object'
                            ? field.value
                            : salesCategory.find(option => option.value === field.value)
                        }
                        id="salesTransactionCategoryId"
                        onChange={option => {
                          if (option && option.value) {
                            field.onChange(option);
                          } else {
                            field.onChange('');
                          }
                        }}
                        className={errors.salesTransactionCategoryId ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.salesTransactionCategoryId && (
                    <div className="invalid-feedback">
                      {errors.salesTransactionCategoryId.message}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className="">
                  <Label htmlFor="salesDescription">{strings.Description}</Label>
                  <Controller
                    name="salesDescription"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        readOnly={!productPriceType.includes('SALES')}
                        type="textarea"
                        maxLength="200"
                        id="salesDescription"
                        rows="3"
                        placeholder={strings.Description}
                      />
                    )}
                  />
                </FormGroup>
              </Col>
              <Col lg={4}>
                <FormGroup check inline className="mb-3">
                  <Label className="form-check-label" check htmlFor="productPriceTypetwo">
                    <Controller
                      name="productPriceType"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="checkbox"
                          id="productPriceTypetwo"
                          onChange={event => {
                            if (field.value.includes('PURCHASE')) {
                              const nextValue = field.value.filter(value => value !== 'PURCHASE');
                              field.onChange(nextValue);
                            } else {
                              const nextValue = field.value.concat('PURCHASE');
                              field.onChange(nextValue);
                            }
                          }}
                          checked={field.value.includes('PURCHASE')}
                          className={errors.productPriceType ? 'is-invalid' : ''}
                        />
                      )}
                    />
                    {strings.PurchaseInformation}
                    {errors.productPriceType && (
                      <div className="invalid-feedback">{errors.productPriceType.message}</div>
                    )}
                  </Label>
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label htmlFor="purchaseUnitPrice">
                    <span className="text-danger">* </span> {strings.PurchasePrice}
                    <HelpCircle id="PurchaseTooltip" className="h-4 w-4 inline" />
                    <UncontrolledTooltip placement="right" target="PurchaseTooltip">
                      Purchase price – Amount of money you paid for the product
                    </UncontrolledTooltip>
                  </Label>
                  <Controller
                    name="purchaseUnitPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        maxLength="10"
                        id="purchaseUnitPrice"
                        placeholder={strings.Enter + strings.SellingPrice}
                        onChange={e => {
                          if (e.target.value === '' || regDecimal.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        readOnly={!productPriceType.includes('PURCHASE')}
                        className={errors.purchaseUnitPrice ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.purchaseUnitPrice && (
                    <div className="invalid-feedback">{errors.purchaseUnitPrice.message}</div>
                  )}
                </FormGroup>

                <FormGroup className="mb-3">
                  <Label htmlFor="purchaseTransactionCategoryId">
                    <span className="text-danger">* </span>
                    {strings.Account}
                  </Label>
                  <Controller
                    name="purchaseTransactionCategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        styles={customStyles}
                        isDisabled={!productPriceType.includes('PURCHASE')}
                        options={purchaseCategory ? purchaseCategory : []}
                        value={
                          purchaseCategory && typeof field.value === 'object'
                            ? field.value
                            : purchaseCategory.find(option => option.value === field.value)
                        }
                        id="purchaseTransactionCategoryId"
                        onChange={option => {
                          if (option && option.value) {
                            field.onChange(option);
                          } else {
                            field.onChange('');
                          }
                        }}
                        className={errors.purchaseTransactionCategoryId ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.purchaseTransactionCategoryId && (
                    <div className="invalid-feedback">
                      {errors.purchaseTransactionCategoryId.message}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className="">
                  <Label htmlFor="purchaseDescription">{strings.Description}</Label>
                  <Controller
                    name="purchaseDescription"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        readOnly={!productPriceType.includes('PURCHASE')}
                        type="textarea"
                        maxLength="200"
                        id="purchaseDescription"
                        rows="3"
                        placeholder={strings.Description}
                      />
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              color="primary"
              className="btn-square mr-3"
              disabled={disabled || isSubmitting}
            >
              <CircleDot className="h-4 w-4" /> {strings.Create}
            </Button>
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closeProductModal(false);
              }}
            >
              <Ban className="h-4 w-4" /> {strings.Cancel}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    productActions: bindActionCreators(ProductActions, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(ProductModal);
