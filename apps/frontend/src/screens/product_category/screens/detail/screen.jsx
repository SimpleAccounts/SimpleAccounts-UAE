import { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Boxes, Trash2, CircleDot, Ban, ChevronRight, Home } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import { CommonActions } from 'services/global';
import * as DetailProductCategoryAction from './actions';
import * as ProductCategoryActions from '../../actions';

import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);
strings.setLanguage(localStorage.getItem('language') || 'en');

// Corporate theme constants
const theme = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  primary: '#2064d8',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  danger: '#ef4444',
};

// Zod validation schema
const detailProductCategorySchema = z.object({
  productCategoryCode: z
    .string()
    .min(1, 'Product category code is required')
    .max(20, 'Code is too long'),
  productCategoryName: z
    .string()
    .min(1, 'Product category name is required')
    .max(50, 'Name is too long'),
});

const mapStateToProps = state => ({
  product_category_list: state.product_category.product_category_list,
});

const mapDispatchToProps = dispatch => ({
  commonActions: bindActionCreators(CommonActions, dispatch),
  detailProductCategoryAction: bindActionCreators(DetailProductCategoryAction, dispatch),
  productCategoryActions: bindActionCreators(ProductCategoryActions, dispatch),
});

const regExBoth = /^[a-zA-Z0-9\s,'\-/()]+$/;

const DetailProductCategory = ({
  commonActions,
  detailProductCategoryAction,
  productCategoryActions,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const { setError, clearErrors, reset } = form;

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
              id: res.data.id || '',
              productCategoryCode: res.data.productCategoryCode || '',
              productCategoryName: res.data.productCategoryName || '',
            });
            getAssociatedProductWithCategory(id);
          }
        })
        .catch(() => {
          setLoading(false);
          navigate('/admin/master/product-category');
        });
    } else {
      navigate('/admin/master/product-category');
    }
  }, [
    location.state,
    detailProductCategoryAction,
    navigate,
    reset,
    getAssociatedProductWithCategory,
  ]);

  useEffect(() => {
    getProductCategoryList();
    initializeData();
  }, [getProductCategoryList, initializeData]);

  const onSubmit = data => {
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
      productCategoryName: data.productCategoryName || '',
      productCategoryCode: data.productCategoryCode || '',
    };

    detailProductCategoryAction
      .updateProductCategory(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          commonActions.tostifyAlert(
            'success',
            res.data?.message || 'Product Category Updated Successfully'
          );
          navigate('/admin/master/product-category');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err?.data?.message || 'Product Category Updated Unsuccessfully'
        );
      });
  };

  const deleteProductCategory = () => {
    setDialog(
      <ConfirmDeleteModal
        isOpen={true}
        okHandler={removeProductCategory}
        cancelHandler={() => setDialog(null)}
        message="This Product Category will be deleted permanently and cannot be recovered."
        message1={<b>Delete Product Category?</b>}
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
            res.data?.message || 'Product Category Deleted Successfully'
          );
          navigate('/admin/master/product-category');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled1(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err?.data?.message || 'Product Category Deleted Unsuccessfully'
        );
      });
  };

  const handleCodeChange = (value, onChange) => {
    if (value === '' || regExBoth.test(value)) {
      onChange(value);
      if (
        form.formState.errors.productCategoryCode?.message ===
        'Product category code already exists'
      ) {
        clearErrors('productCategoryCode');
      }
    }
  };

  const handleNameChange = (value, onChange) => {
    if (value === '' || regExBoth.test(value)) {
      onChange(value);
    }
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div style={{ background: theme.bg, minHeight: '100%' }}>
      {dialog}

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              Edit Product Category
            </h1>
            <div
              className="flex items-center gap-2 mt-1 text-sm"
              style={{ color: theme.textMuted }}
            >
              <Home className="w-4 h-4" />
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() => navigate('/admin/dashboard')}
              >
                Home
              </span>
              <ChevronRight className="w-4 h-4" />
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() => navigate('/admin/master/product-category')}
              >
                Product Category
              </span>
              <ChevronRight className="w-4 h-4" />
              <span>Edit</span>
            </div>
          </div>
          {!isAssociatedWithProduct && (
            <Button
              type="button"
              variant="outline"
              onClick={deleteProductCategory}
              disabled={disabled1}
              className="h-10 px-4"
              style={{ borderColor: theme.danger, color: theme.danger }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {disabled1 ? 'Deleting...' : strings.Delete || 'Delete'}
            </Button>
          )}
        </div>
      </div>

      {/* Form Card */}
      <Card
        className="rounded-xl"
        style={{
          background: theme.bgWhite,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardHeader className="border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#eff6ff' }}
            >
              <Boxes className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            <CardTitle className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              {strings.UpdateProductCategory || 'Update Product Category'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
              {/* Product Category Code */}
              <FormField
                control={form.control}
                name="productCategoryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: theme.textPrimary }}>
                      <span className="text-red-500">*</span>
                      {strings.ProductCategoryCode || 'Product Category Code'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`${strings.Enter || 'Enter'} ${strings.ProductCategoryCode || 'Product Category Code'}`}
                        maxLength={20}
                        value={field.value}
                        onChange={e => handleCodeChange(e.target.value, field.onChange)}
                        className="h-11"
                        style={{ borderColor: theme.border }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Category Name */}
              <FormField
                control={form.control}
                name="productCategoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: theme.textPrimary }}>
                      <span className="text-red-500">*</span>
                      {strings.ProductCategoryName || 'Product Category Name'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`${strings.Enter || 'Enter'} ${strings.ProductCategoryName || 'Product Category Name'}`}
                        maxLength={50}
                        value={field.value}
                        onChange={e => handleNameChange(e.target.value, field.onChange)}
                        className="h-11"
                        style={{ borderColor: theme.border }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm" style={{ color: theme.textMuted }}>
                Note: If the product category is associated with the product, it cannot be deleted.
              </p>

              {/* Action Buttons */}
              <div
                className="flex items-center justify-end gap-3 pt-4 border-t"
                style={{ borderColor: theme.border }}
              >
                <Button
                  type="submit"
                  disabled={disabled}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <CircleDot className="w-4 h-4 mr-2" />
                  {disabled ? 'Updating...' : strings.Update || 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/master/product-category')}
                  className="h-10 px-4"
                  style={{ borderColor: theme.border, color: theme.textSecondary }}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {strings.Cancel || 'Cancel'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailProductCategory);
