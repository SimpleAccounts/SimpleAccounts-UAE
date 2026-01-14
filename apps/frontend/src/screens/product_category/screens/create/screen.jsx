import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Boxes, HelpCircle, CircleDot, RefreshCw, Ban, ChevronRight, Home } from 'lucide-react';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { LeavePage, Loader } from 'components';
import { CommonActions } from 'services/global';
import * as CreateProductCategoryActions from './actions';
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
const createProductCategorySchema = z.object({
  productCategoryCode: z
    .string()
    .min(1, strings.ProductCategoryCodeRequired || 'Product Category Code is required')
    .max(20, 'Code is too long'),
  productCategoryName: z
    .string()
    .min(1, strings.ProductCategoryNameRequired || 'Product Category Name is required')
    .max(50, 'Name is too long'),
});

const mapStateToProps = state => ({
  product_category_list: state.product_category.product_category_list,
});

const mapDispatchToProps = dispatch => ({
  commonActions: bindActionCreators(CommonActions, dispatch),
  createProductCategoryActions: bindActionCreators(CreateProductCategoryActions, dispatch),
  productCategoryActions: bindActionCreators(ProductCategoryActions, dispatch),
});

const regExBoth = /^[a-zA-Z0-9\s,'\-/()]+$/;

const CreateProductCategory = ({
  commonActions,
  createProductCategoryActions,
  productCategoryActions,
}) => {
  const navigate = useNavigate();
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

  const { setError, clearErrors } = form;

  useEffect(() => {
    productCategoryActions.getProductCategoryList().then(res => {
      if (res.status === 200) {
        const categoryList = res.data.data.map(item => item.productCategoryCode);
        setProductCategoryList(categoryList);
      }
    });
  }, [productCategoryActions]);

  const onSubmit = data => {
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
            res.data?.message || 'Product Category Created Successfully'
          );

          if (createMore) {
            form.reset();
            productCategoryActions.getProductCategoryList().then(res => {
              if (res.status === 200) {
                const categoryList = res.data.data.map(item => item.productCategoryCode);
                setProductCategoryList(categoryList);
              }
            });
            setCreateMore(false);
            setDisableLeavePage(false);
          } else {
            navigate('/admin/master/product-category');
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert(
          'error',
          err?.data?.message || 'Product Category Created Unsuccessfully'
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
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
          Add Product Category
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: theme.textMuted }}>
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
          <span>Add Product Category</span>
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
              {strings.NewProductCategory || 'New Product Category'}
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
                    <FormLabel
                      className="flex items-center gap-1"
                      style={{ color: theme.textPrimary }}
                    >
                      <span className="text-red-500">*</span>
                      {strings.ProductCategoryCode || 'Product Category Code'}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle
                              className="w-4 h-4 cursor-help"
                              style={{ color: theme.textMuted }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Unique identifier code for the product category</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                  onClick={() => setCreateMore(false)}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <CircleDot className="w-4 h-4 mr-2" />
                  {disabled ? 'Creating...' : strings.Create || 'Create'}
                </Button>
                <Button
                  type="submit"
                  disabled={disabled}
                  onClick={() => setCreateMore(true)}
                  className="h-10 px-4"
                  style={{ background: theme.primary }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {disabled ? 'Creating...' : strings.CreateandMore || 'Create and More'}
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateProductCategory);
