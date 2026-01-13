import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { selectOptionsFactory, InputValidation, DropdownLists, Lists } from 'utils';
import { LeavePage, Loader, ConfirmDeleteModal } from 'components';
import './style.scss';
import { AddressComponent } from 'screens/contact/sections';
import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as DetailContactActions from '../detail/actions';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import {
  Ban,
  HelpCircle,
  IdCard,
  Trash2,
  User,
  Building2,
  MapPin,
  ChevronRight,
  Save,
  ArrowLeft,
} from 'lucide-react';

const mapStateToProps = state => {
  const currencyList = state.common.currency_convert_list;
  return {
    country_list: state.contact.country_list,
    currency_list_dropdown: DropdownLists.getCurrencyDropdown(currencyList),
    contact_type_list: state.contact.contact_type_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    contactActions: bindActionCreators(ContactActions, dispatch),
    detailContactActions: bindActionCreators(DetailContactActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

const strings = new LocalizedStrings(data);

// Zod validation schema
const detailContactSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  middleName: z.string().optional(),
  currencyCode: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== '', 'Currency is required'),
  contactType: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== '', 'Contact type is required'),
  taxTreatmentId: z
    .union([
      z.number(),
      z.object({
        value: z.number(),
        label: z.string(),
      }),
    ])
    .refine(val => val !== null && val !== '', 'Tax Treatment is required'),
  email: z.string().min(1, 'Email is required').email('Invalid Email'),
  organization: z.string().optional(),
  telephone: z.string().optional(),
  mobileNumber: z.string().optional(),
  website: z.string().optional(),
  vatRegistrationNumber: z.string().optional(),
  billingAddress: z.object({
    email: z.string().optional(),
    city: z.string().optional(),
    countryId: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
    postZipCode: z.string().optional(),
    stateId: z.union([z.string(), z.number()]).optional(),
    telephone: z.string().optional(),
    fax: z.string().optional(),
  }),
  shippingAddress: z.object({
    city: z.string().optional(),
    countryId: z.union([z.string(), z.number()]).optional(),
    address: z.string().optional(),
    postZipCode: z.string().optional(),
    stateId: z.union([z.string(), z.number()]).optional(),
    telephone: z.string().optional(),
    fax: z.string().optional(),
  }),
});

const EditContact = ({
  contactActions,
  detailContactActions,
  commonActions,
  country_list,
  currency_list_dropdown,
  contact_type_list,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [dialog, setDialog] = useState(null);
  const [currentContactId, setCurrentContactId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [disabled1, setDisabled1] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [disableLeavePage, setDisableLeavePage] = useState(false);
  const [childRecordsPresent, setChildRecordsPresent] = useState(false);
  const [taxTreatmentList, setTaxTreatmentList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [isSame, setIsSame] = useState(false);
  const [disableCountry, setDisableCountry] = useState(false);
  const [isRegisteredForVat, setIsRegisteredForVat] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');
  const [existingTrn, setExistingTrn] = useState('');
  const [trnExist, setTrnExist] = useState(false);
  const [emailExist, setEmailExist] = useState(false);

  const regEx = /^[0-9]+$/;
  const regExTelephone = /^[0-9-]+$/;
  const regExAlpha = /^[a-zA-Z ]+$/;
  const regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;

  const form = useForm({
    resolver: zodResolver(detailContactSchema),
    defaultValues: {
      contactType: '',
      currencyCode: '',
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      mobileNumber: '',
      organization: '',
      telephone: '',
      website: '',
      vatRegistrationNumber: '',
      taxTreatmentId: '',
      billingAddress: {
        email: '',
        city: '',
        countryId: '',
        address: '',
        postZipCode: '',
        stateId: '',
        telephone: '',
        fax: '',
      },
      shippingAddress: {
        city: '',
        countryId: '',
        address: '',
        postZipCode: '',
        stateId: '',
        telephone: '',
        fax: '',
      },
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    trigger,
  } = form;

  const watchedValues = watch();

  // Corporate theme constants
  const theme = {
    bg: '#f8f9fa',
    bgWhite: '#ffffff',
    primary: '#2064d8',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    border: '#e5e7eb',
  };

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    detailContactActions
      .getTaxTreatment()
      .then(res => {
        if (res.status === 200) {
          const array = res.data.filter(row => row.id !== 8);
          setTaxTreatmentList(array);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert('error', err?.data?.message || err?.message || 'ERROR');
      });

    initializeData();
  }, []);

  // Update country list when country_list from Redux changes
  useEffect(() => {
    if (country_list && country_list.length > 0) {
      const taxTreatmentId = watchedValues.taxTreatmentId;
      if (taxTreatmentId) {
        resetCountryList(taxTreatmentId);
      }
    }
  }, [country_list, watchedValues.taxTreatmentId]);

  const initializeData = () => {
    if (location?.state?.id) {
      contactActions.getContactTypeList();
      contactActions.getCountryList();
      detailContactActions
        .getContactById(location.state.id)
        .then(res => {
          const data = res.data;
          setCurrentContactId(location.state.id);
          setLoading(false);
          setIsActive(data ? data.isActive : false);
          setSelectedStatus(data ? data.isActive : false);
          setExistingEmail(data.email ?? '');
          setExistingTrn(data.vatRegistrationNumber ?? '');
          setIsRegisteredForVat(data.isRegisteredForVat ?? false);
          setIsSame(data.isBillingAndShippingAddressSame);

          const taxTreatmentId = data.taxTreatmentId ?? '';
          if (taxTreatmentId) {
            if (
              taxTreatmentId === 1 ||
              taxTreatmentId === 2 ||
              taxTreatmentId === 3 ||
              taxTreatmentId === 4
            ) {
              setDisableCountry(true);
            }
            if (taxTreatmentId === 1 || taxTreatmentId === 3 || taxTreatmentId === 5) {
              setIsRegisteredForVat(true);
            }
            // Reset country list based on tax treatment
            resetCountryList(taxTreatmentId);
          }

          reset({
            billingAddress: {
              email: data.billingEmail ?? '',
              city: data.city ?? '',
              countryId: data.countryId ?? '',
              address: data.addressLine1 ?? '',
              postZipCode: data.postZipCode ?? '',
              stateId: data.stateId ?? '',
              telephone: data.billingTelephone ?? '',
              fax: data.fax ?? '',
            },
            shippingAddress: {
              city: data.shippingCity ?? '',
              countryId: data.shippingCountryId ?? '',
              address: data.addressLine2 ?? '',
              postZipCode: data.shippingPostZipCode || data.shippingPoBoxNumber,
              stateId: data.shippingStateId ?? '',
              telephone: data.shippingTelephone ?? '',
              fax: data.shippingFax ?? '',
            },
            contactType: data.contactType ?? '',
            currencyCode: data.currencyCode ?? '',
            email: data.email ?? '',
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            middleName: data.middleName ?? '',
            website: data.website ?? '',
            mobileNumber: data.mobileNumber ?? '',
            organization: data.organization ?? '',
            telephone: data.telephone ?? '',
            vatRegistrationNumber: data.vatRegistrationNumber ?? '',
            taxTreatmentId: taxTreatmentId,
          });

          checkChildActivitiesForContactId(location.state.id);
        })
        .catch(err => {
          setLoading(false);
          commonActions.tostifyAlert('error', err);
        });
    } else {
      navigate('/admin/master/contact');
    }
  };

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else if (data[`${item}`] && data[`${item}`].value !== undefined) {
        temp[`${item}`] = data[`${item}`].value;
      } else {
        temp[`${item}`] = data[`${item}`];
      }
    }

    const billingcountryId = data[`billingAddress`].countryId;
    const shippingCountryId = data[`shippingAddress`].countryId;

    temp[`isActive`] = isActive;
    temp[`isBillingAndShippingAddressSame`] = isSame;
    temp[`addressLine1`] = data[`billingAddress`].address;
    temp[`countryId`] = billingcountryId;
    temp[`stateId`] = data[`billingAddress`].stateId;
    temp[`postZipCode`] = data[`billingAddress`].postZipCode;
    temp[`city`] = data[`billingAddress`].city;
    temp[`fax`] = data[`billingAddress`].fax;
    temp[`billingTelephone`] = data[`billingAddress`].telephone;
    temp[`addressLine2`] = data[`shippingAddress`].address;
    temp[`poBoxNumber`] = data[`billingAddress`].postZipCode;

    const billingAdress = {
      billingAddress: data[`billingAddress`].address,
      billingCity: data[`billingAddress`].city,
      billingEmail: data[`billingAddress`].email,
      billingFax: data[`billingAddress`].fax,
      billingPoBoxNumber: billingcountryId === 229 ? data[`billingAddress`].postZipCode : '',
      billingPostZipCode: billingcountryId !== 229 ? data[`billingAddress`].postZipCode : '',
      billingStateProvince: data[`billingAddress`].stateId,
      billingcountryId: data[`billingAddress`].countryId,
    };

    const shippingAddress = {
      shippingAddress: data[`shippingAddress`].address,
      shippingCity: data[`shippingAddress`].city,
      billingEmail: data[`shippingAddress`].email,
      shippingFax: data[`shippingAddress`].fax,
      shippingTelephone: data[`shippingAddress`].telephone,
      shippingPoBoxNumber: shippingCountryId === 229 ? data[`shippingAddress`].postZipCode : '',
      shippingPostZipCode: shippingCountryId !== 229 ? data[`shippingAddress`].postZipCode : '',
      shippingStateId: data[`shippingAddress`].stateId,
      shippingCountryId: data[`shippingAddress`].countryId,
    };
    temp = { ...temp, ...billingAdress, ...shippingAddress };

    return temp;
  };

  const onSubmit = data => {
    // Custom validation
    if (isRegisteredForVat === true) {
      if (data.vatRegistrationNumber === '') {
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Tax Registration Number is Required',
        });
        return;
      }
      if (data.vatRegistrationNumber.length !== 15) {
        setError('vatRegistrationNumber', {
          type: 'manual',
          message: 'Please enter 15 digit Tax Registration Number',
        });
        return;
      }
    }
    if (trnExist === true) {
      setError('vatRegistrationNumber', {
        type: 'manual',
        message: 'Tax registration number already exists',
      });
      return;
    }
    if (emailExist === true) {
      setError('email', { type: 'manual', message: 'Email Already Exists' });
      return;
    }

    const shippingAddressError = InputValidation.addressValidation(data.shippingAddress);
    if (shippingAddressError && Object.values(shippingAddressError).length > 0) {
      setError('shippingAddress', { type: 'manual', message: 'Invalid shipping address' });
      return;
    }
    const billingAddressError = InputValidation.addressValidation(data.billingAddress);
    if (billingAddressError && Object.values(billingAddressError).length > 0) {
      setError('billingAddress', { type: 'manual', message: 'Invalid billing address' });
      return;
    }

    setDisabled(true);
    let postData = getData(data);
    postData = { ...postData, ...{ contactId: currentContactId } };
    setLoading(true);
    setDisableLeavePage(true);
    setLoadingMsg('Updating Contact...');

    detailContactActions
      .updateContact(postData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          reset();
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Contact Updated Successfully'
          );
          navigate('/admin/master/contact');
          setLoading(false);
        }
      })
      .catch(err => {
        setDisabled(false);
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Contact Updated Unsuccessfully'
        );
        setLoading(false);
      });
  };

  const checkChildActivitiesForContactId = id => {
    contactActions.getInvoicesCountContact(id).then(res => {
      if (res.data > 0) {
        setChildRecordsPresent(true);
      } else {
        setChildRecordsPresent(false);
      }
    });
  };

  const deleteContact = () => {
    contactActions.getInvoicesCountContact(currentContactId).then(res => {
      if (res.data > 0) {
        commonActions.tostifyAlert('error', 'You need to delete invoices to delete the contact');
      } else {
        const message1 = (
          <text>
            <b>Delete Contact?</b>
          </text>
        );
        const message = 'This Contact will be deleted permanently and cannot be recovered. ';
        setDialog(
          <ConfirmDeleteModal
            isOpen={true}
            okHandler={removeContact}
            cancelHandler={removeDialog}
            message1={message1}
            message={message}
          />
        );
      }
    });
  };

  const removeContact = () => {
    setDisabled1(true);
    setLoading(true);
    setLoadingMsg('Deleting Contact...');
    detailContactActions
      .deleteContact(currentContactId)
      .then(res => {
        if (res.status === 200) {
          commonActions.tostifyAlert(
            'success',
            res.data ? res.data.message : 'Contact Deleted Successfully'
          );
          navigate('/admin/master/contact');
          setLoading(false);
        }
      })
      .catch(err => {
        commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Contact Deleted Unsuccessfully'
        );
      });
  };

  const removeDialog = () => {
    setDialog(null);
  };

  const resetCountryList = taxtid => {
    let list = [];
    if (taxtid === 7 || taxtid === 5 || taxtid === 6) {
      country_list.forEach(obj => {
        if (
          (taxtid === 6 || taxtid === 5) &&
          (obj.countryCode === 229 ||
            obj.countryCode === 191 ||
            obj.countryCode === 178 ||
            obj.countryCode === 165 ||
            obj.countryCode === 117 ||
            obj.countryCode === 17)
        ) {
          list.push(obj);
        }
        if (
          taxtid === 7 &&
          obj.countryCode !== 229 &&
          obj.countryCode !== 191 &&
          obj.countryCode !== 178 &&
          obj.countryCode !== 165 &&
          obj.countryCode !== 117 &&
          obj.countryCode !== 17
        ) {
          list.push(obj);
        }
      });
    } else {
      list = country_list;
    }
    setIsSame(false);
    list = list
      ? selectOptionsFactory.renderOptions('countryName', 'countryCode', list, 'Country')
      : [];
    setCountryList(list);
  };

  const validationCheck = value => {
    const data = {
      moduleType: 21,
      name: value,
    };
    contactActions.checkValidation(data).then(response => {
      if (response.data === 'Tax Registration Number Already Exists') {
        setTrnExist(true);
      } else {
        setTrnExist(false);
      }
    });
  };

  const emailvalidationCheck = value => {
    const data = {
      moduleType: 22,
      name: value,
    };
    contactActions.checkValidation(data).then(response => {
      if (response.data === 'Email Already Exists') {
        setEmailExist(true);
      } else {
        setEmailExist(false);
      }
    });
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div
      className="edit-contact-screen"
      style={{ background: theme.bg, minHeight: '100vh', padding: '24px' }}
    >
      <div className="animated fadeIn max-w-7xl mx-auto">
        {dialog}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-corp-text-muted mb-2">
          <a href="/admin" className="hover:text-corp-primary transition-colors">
            {strings.Home || 'Home'}
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a href="/admin/master/contact" className="hover:text-corp-primary transition-colors">
            {strings.Contact || 'Contacts'}
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-corp-text-primary font-medium">
            {strings.UpdateContact || 'Edit Contact'}
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/master/contact')}
              className="rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-corp-text-primary flex items-center gap-2">
                <IdCard className="h-6 w-6" style={{ color: theme.primary }} />
                {strings.UpdateContact || 'Edit Contact'}
              </h1>
              <p className="text-sm text-corp-text-muted mt-1">
                Update contact information and details
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={deleteContact}
            className="rounded-lg"
            disabled={disabled1}
          >
            <Trash2 className="h-4 w-4" />
            {disabled1 ? 'Deleting...' : strings.Delete || 'Delete'}
          </Button>
        </div>

        {/* Main Form Card */}
        <Card
          className="rounded-xl overflow-hidden corp-card"
          style={{
            background: theme.bgWhite,
            border: `1px solid ${theme.border}`,
          }}
        >
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Status Radio Group - IMPROVED ALIGNMENT */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    <span className="text-red-500">* </span>
                    {strings.Status || 'Status'}
                  </Label>
                  <RadioGroup
                    value={selectedStatus ? 'true' : 'false'}
                    onValueChange={value => {
                      const boolValue = value === 'true';
                      setSelectedStatus(boolValue);
                      setIsActive(boolValue);
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="true" id="status-active" />
                      <Label htmlFor="status-active" className="text-sm font-medium cursor-pointer">
                        {strings.Active || 'Active'}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="false" id="status-inactive" />
                      <Label
                        htmlFor="status-inactive"
                        className="text-sm font-medium cursor-pointer"
                      >
                        {strings.Inactive || 'Inactive'}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Contact Name Section */}
                <Card className="corp-card border-corp-border-light">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                      <User className="h-5 w-5 text-corp-primary" />
                      <h3 className="text-lg font-semibold text-corp-text-primary">
                        {strings.ContactName || 'Contact Name'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.FirstName || 'First Name'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${strings.FirstName || 'First Name'}`}
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAlpha.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                maxLength={100}
                                className="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{strings.MiddleName || 'Middle Name'}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${strings.MiddleName || 'Middle Name'}`}
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAlpha.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                maxLength={100}
                                className="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.LastName || 'Last Name'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${strings.LastName || 'Last Name'}`}
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAlpha.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                maxLength={100}
                                className="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Details Section */}
                <Card className="corp-card border-corp-border-light">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Building2 className="h-5 w-5 text-corp-primary" />
                      <h3 className="text-lg font-semibold text-corp-text-primary">
                        {strings.ContactDetails || 'Contact Details'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={control}
                        name="contactType"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.ContactType || 'Contact Type'}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 inline ml-1 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      The contact type cannot be changed once a document has been
                                      created for this contact.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <Select
                              onValueChange={value => field.onChange(parseInt(value, 10))}
                              value={field.value ? String(field.value) : ''}
                              disabled={childRecordsPresent}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'w-full corp-input',
                                    fieldState?.error && 'border-red-500'
                                  )}
                                >
                                  <SelectValue
                                    placeholder={`Select ${strings.ContactType || 'Contact Type'}`}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contact_type_list
                                  ?.filter(
                                    (type, index, self) =>
                                      type.value != null &&
                                      type.value !== '' &&
                                      self.findIndex(t => t.value === type.value) === index
                                  )
                                  .map((type, index) => (
                                    <SelectItem
                                      key={`contact-type-${type.value}-${index}`}
                                      value={String(type.value)}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{strings.OrganizationName || 'Organization Name'}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${strings.OrganizationName || 'Organization'}`}
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAddress.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                maxLength={100}
                                className="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.Email || 'Email'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={`Enter ${strings.Email || 'Email'}`}
                                {...field}
                                className="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="currencyCode"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>
                              <span className="text-red-500">* </span>
                              {strings.CurrencyCode || 'Currency'}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 inline ml-1 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      You cannot change the currency once a document is created for
                                      this contact.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <Select
                              onValueChange={value => field.onChange(parseInt(value, 10))}
                              value={field.value ? String(field.value) : ''}
                              disabled={childRecordsPresent}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'w-full corp-input',
                                    fieldState?.error && 'border-red-500'
                                  )}
                                >
                                  <SelectValue
                                    placeholder={`Select ${strings.Currency || 'Currency'}`}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currency_list_dropdown
                                  ?.filter(
                                    (currency, index, self) =>
                                      currency.value != null &&
                                      currency.value !== '' &&
                                      self.findIndex(c => c.value === currency.value) === index
                                  )
                                  .map((currency, index) => (
                                    <SelectItem
                                      key={`currency-${currency.value}-${index}`}
                                      value={String(currency.value)}
                                    >
                                      {currency.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="telephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{strings.Telephone || 'Telephone'}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${strings.Telephone || 'Telephone'}`}
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regEx.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                maxLength={15}
                                className="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{strings.MobileNumber || 'Mobile Number'}</FormLabel>
                            <FormControl>
                              <PhoneInput
                                country={'ae'}
                                enableSearch={true}
                                value={field.value}
                                placeholder={`Enter ${strings.MobileNumber || 'Mobile Number'}`}
                                onChange={value => {
                                  field.onChange(value);
                                }}
                                inputClass="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{strings.Website || 'Website'}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`Enter ${strings.Website || 'Website'}`}
                                {...field}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === '' || regExAddress.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                                maxLength={100}
                                className="corp-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="taxTreatmentId"
                        render={({ field, fieldState }) => {
                          const numericValue = field.value ? parseInt(field.value, 10) : null;
                          const isDisabled =
                            numericValue === 1 || numericValue === 3 || numericValue === 5;

                          return (
                            <FormItem>
                              <FormLabel>
                                <span className="text-red-500">* </span>
                                {strings.TaxTreatment || 'Tax Treatment'}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 inline ml-1 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        Once any document has been created for this contact, you
                                        cannot change the Tax treatment.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <Select
                                onValueChange={value => {
                                  const numValue = parseInt(value, 10);
                                  setValue('shippingAddress.countryId', '');
                                  setValue('billingAddress.countryId', '');
                                  setValue('shippingAddress.stateId', '');
                                  setValue('billingAddress.stateId', '');

                                  if (numValue) {
                                    resetCountryList(numValue);
                                    field.onChange(numValue);

                                    if (numValue === 1 || numValue === 3 || numValue === 5) {
                                      setIsRegisteredForVat(true);
                                    } else {
                                      setIsRegisteredForVat(false);
                                    }

                                    if (
                                      numValue === 1 ||
                                      numValue === 2 ||
                                      numValue === 3 ||
                                      numValue === 4
                                    ) {
                                      setDisableCountry(true);
                                      setValue('shippingAddress.countryId', 229);
                                      setValue('billingAddress.countryId', 229);
                                    } else {
                                      setDisableCountry(false);
                                    }
                                  } else {
                                    field.onChange('');
                                    setDisableCountry(false);
                                  }
                                  setValue('vatRegistrationNumber', '');
                                }}
                                value={field.value ? String(field.value) : ''}
                                disabled={isDisabled}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      'w-full corp-input',
                                      fieldState?.error && 'border-red-500'
                                    )}
                                  >
                                    <SelectValue
                                      placeholder={`Select ${strings.TaxTreatment || 'Tax Treatment'}`}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {taxTreatmentList
                                    ?.filter(
                                      (treatment, index, self) =>
                                        treatment.id != null &&
                                        treatment.id !== '' &&
                                        self.findIndex(t => t.id === treatment.id) === index
                                    )
                                    .map((treatment, index) => (
                                      <SelectItem
                                        key={`tax-treatment-${treatment.id}-${index}`}
                                        value={String(treatment.id)}
                                      >
                                        {treatment.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      {watchedValues.taxTreatmentId &&
                        (watchedValues.taxTreatmentId === 1 ||
                          watchedValues.taxTreatmentId === 3 ||
                          watchedValues.taxTreatmentId === 5) && (
                          <FormField
                            control={control}
                            name="vatRegistrationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  <span className="text-red-500">* </span>
                                  {strings.TaxRegistrationNumber || 'Tax Registration Number'}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={`Enter ${strings.TaxRegistrationNumber || 'Tax Registration Number'}`}
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '' || regEx.test(value)) {
                                        field.onChange(e);
                                        validationCheck(value);
                                      }
                                    }}
                                    maxLength={15}
                                    className="corp-input"
                                  />
                                </FormControl>
                                <FormMessage />
                                <p className="text-sm mt-2">
                                  <a
                                    href="https://tax.gov.ae/en/default.aspx"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-corp-primary hover:underline font-medium"
                                  >
                                    {strings.VerifyTRN || 'Verify TRN'}
                                  </a>
                                </p>
                              </FormItem>
                            )}
                          />
                        )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Address Details Section - IMPROVED LAYOUT */}
                <Card className="corp-card border-corp-border-light">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="h-5 w-5 text-corp-primary" />
                      <h3 className="text-lg font-semibold text-corp-text-primary">
                        {strings.ContactAddressDetails || 'Address Details'}
                      </h3>
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-4 mb-8">
                      <h4 className="text-base font-semibold text-corp-text-primary border-b pb-2 border-corp-border-light">
                        {strings.BillingDetails || 'Billing Address'}
                      </h4>
                      <AddressComponent
                        addressPrefix="billingAddress"
                        addressType={strings.Billing}
                        country_list={countryList}
                        disabled={{
                          email: false,
                          city: false,
                          countryId: disableCountry,
                          address: false,
                          postZipCode: false,
                          stateId: false,
                          telephone: false,
                          fax: false,
                        }}
                      />
                    </div>

                    <Separator className="my-8" />

                    {/* Shipping Address */}
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-corp-text-primary border-b pb-2 border-corp-border-light">
                        {strings.ShippingDetails || 'Shipping Address'}
                      </h4>
                      <div className="flex items-center gap-2 mb-4">
                        <Checkbox
                          id="same-address"
                          checked={isSame}
                          onCheckedChange={checked => {
                            const checkedValue = checked === true;
                            if (!checkedValue) {
                              setValue('shippingAddress', watchedValues.billingAddress);
                            } else {
                              setValue('shippingAddress', Lists.Address);
                              if (disableCountry) {
                                setValue('shippingAddress.countryId', 229);
                              }
                            }
                            setIsSame(checkedValue);
                          }}
                        />
                        <Label
                          htmlFor="same-address"
                          className="text-sm font-medium cursor-pointer"
                        >
                          {strings.ShippingAddressIsSameAsBillingAddress ||
                            'Same as Billing Address'}
                        </Label>
                      </div>
                      <AddressComponent
                        addressPrefix="shippingAddress"
                        addressType={strings.Shipping}
                        country_list={countryList}
                        disabled={{
                          email: false,
                          city: false,
                          countryId: disableCountry,
                          address: false,
                          postZipCode: false,
                          stateId: false,
                          telephone: false,
                          fax: false,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/master/contact')}
                    className="rounded-lg"
                  >
                    <Ban className="h-4 w-4" />
                    {strings.Cancel || 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={disabled}
                    className="rounded-lg corp-btn-primary"
                    style={{ background: theme.primary }}
                  >
                    <Save className="h-4 w-4" />
                    {disabled ? 'Updating...' : strings.Update || 'Update Contact'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditContact);
