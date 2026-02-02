import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'components';
import './style.scss';
import { CommonActions } from 'services/global';
import * as ContactActions from '../../actions';
import * as DetailContactActions from '../detail/actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import {
  IdCard,
  User,
  Building2,
  MapPin,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Hash,
  Edit,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const mapStateToProps = state => {
  return {
    country_list: state.contact.country_list,
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

// Corporate theme constants
const theme = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  primary: '#2064d8',
  primaryHover: '#1a56b8',
  success: '#10b981',
  danger: '#ef4444',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
};

const ViewContact = ({ contactActions, detailContactActions, commonActions, country_list }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading');
  const [contactData, setContactData] = useState(null);
  const [currentContactId, setCurrentContactId] = useState(null);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  useEffect(() => {
    if (location?.state?.id) {
      setCurrentContactId(location.state.id);
      contactActions.getCountryList();
      detailContactActions
        .getContactById(location.state.id)
        .then(res => {
          setContactData(res.data);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          commonActions.tostifyAlert('error', err);
        });
    } else {
      navigate('/admin/master/contact');
    }
  }, []);

  const getCountryName = countryId => {
    const country = country_list.find(c => c.countryCode === countryId);
    return country ? country.countryName : '';
  };

  if (loading) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  if (!contactData) {
    return null;
  }

  const InfoField = ({ label, value, icon: Icon }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-3">
        <div className="mt-0.5">
          {Icon && <Icon className="h-5 w-5" style={{ color: theme.textMuted }} />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
            {label}
          </p>
          <p className="text-base" style={{ color: theme.textPrimary }}>
            {value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="view-contact-screen"
      style={{ background: theme.bg, minHeight: '100vh', padding: '24px' }}
    >
      <div className="animated fadeIn max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm mb-2" style={{ color: theme.textMuted }}>
          <a
            href="/admin"
            className="hover:text-corp-primary transition-colors"
            style={{ color: theme.textMuted }}
          >
            {strings.Home || 'Home'}
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <a
            href="/admin/master/contact"
            className="hover:text-corp-primary transition-colors"
            style={{ color: theme.textMuted }}
          >
            {strings.Contact || 'Contacts'}
          </a>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span style={{ color: theme.textPrimary }} className="font-medium">
            {strings.ViewContact || 'View Contact'}
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
              <h1
                className="text-2xl font-semibold flex items-center gap-2"
                style={{ color: theme.textPrimary }}
              >
                <IdCard className="h-6 w-6" style={{ color: theme.primary }} />
                {contactData.fullName || 'Contact Details'}
              </h1>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                View contact information and details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() =>
                navigate('/admin/master/contact/edit', {
                  state: { id: currentContactId },
                })
              }
              className="rounded-lg"
              style={{ background: theme.primary }}
            >
              <Edit className="h-4 w-4" />
              {strings.Edit || 'Edit'}
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge
            variant={contactData.isActive ? 'success' : 'destructive'}
            className="text-sm px-4 py-2 rounded-lg"
            style={{
              background: contactData.isActive ? '#ecfdf5' : '#fef2f2',
              color: contactData.isActive ? theme.success : theme.danger,
            }}
          >
            {contactData.isActive ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 inline" />
                {strings.Active || 'Active'}
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2 inline" />
                {strings.Inactive || 'Inactive'}
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Name Card */}
            <Card
              className="rounded-xl overflow-hidden"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5" style={{ color: theme.primary }} />
                  <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                    {strings.ContactName || 'Contact Name'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoField
                    label={strings.FirstName || 'First Name'}
                    value={contactData.firstName}
                  />
                  <InfoField
                    label={strings.MiddleName || 'Middle Name'}
                    value={contactData.middleName}
                  />
                  <InfoField label={strings.LastName || 'Last Name'} value={contactData.lastName} />
                </div>
              </CardContent>
            </Card>

            {/* Contact Details Card */}
            <Card
              className="rounded-xl overflow-hidden"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="h-5 w-5" style={{ color: theme.primary }} />
                  <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                    {strings.ContactDetails || 'Contact Details'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label={strings.ContactType || 'Contact Type'}
                    value={contactData.contactTypeString}
                  />
                  <InfoField
                    label={strings.OrganizationName || 'Organization'}
                    value={contactData.organization}
                  />
                  <InfoField
                    label={strings.Email || 'Email'}
                    value={contactData.email}
                    icon={Mail}
                  />
                  <InfoField
                    label={strings.CurrencyCode || 'Currency'}
                    value={contactData.currencyName}
                  />
                  <InfoField
                    label={strings.Telephone || 'Telephone'}
                    value={contactData.telephone}
                    icon={Phone}
                  />
                  <InfoField
                    label={strings.MobileNumber || 'Mobile Number'}
                    value={contactData.mobileNumber ? `+${contactData.mobileNumber}` : ''}
                    icon={Phone}
                  />
                  <InfoField
                    label={strings.Website || 'Website'}
                    value={contactData.website}
                    icon={Globe}
                  />
                  <InfoField
                    label={strings.TaxTreatment || 'Tax Treatment'}
                    value={contactData.taxTreatmentName}
                  />
                  {contactData.vatRegistrationNumber && (
                    <InfoField
                      label={strings.TaxRegistrationNumber || 'Tax Registration Number'}
                      value={contactData.vatRegistrationNumber}
                      icon={Hash}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Addresses */}
          <div className="space-y-6">
            {/* Billing Address Card */}
            <Card
              className="rounded-xl overflow-hidden"
              style={{
                background: theme.bgWhite,
                border: `1px solid ${theme.border}`,
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5" style={{ color: theme.primary }} />
                  <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                    {strings.BillingDetails || 'Billing Address'}
                  </h3>
                </div>
                <div className="space-y-4">
                  {contactData.addressLine1 && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        {strings.Address || 'Address'}
                      </p>
                      <p className="text-base" style={{ color: theme.textPrimary }}>
                        {contactData.addressLine1}
                      </p>
                    </div>
                  )}
                  {contactData.city && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        {strings.City || 'City'}
                      </p>
                      <p className="text-base" style={{ color: theme.textPrimary }}>
                        {contactData.city}
                      </p>
                    </div>
                  )}
                  {contactData.countryId && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        {strings.Country || 'Country'}
                      </p>
                      <p className="text-base" style={{ color: theme.textPrimary }}>
                        {getCountryName(contactData.countryId)}
                      </p>
                    </div>
                  )}
                  {contactData.postZipCode && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        {strings.PostalCode || 'Postal Code'}
                      </p>
                      <p className="text-base" style={{ color: theme.textPrimary }}>
                        {contactData.postZipCode}
                      </p>
                    </div>
                  )}
                  {contactData.billingTelephone && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        {strings.Telephone || 'Telephone'}
                      </p>
                      <p className="text-base" style={{ color: theme.textPrimary }}>
                        {contactData.billingTelephone}
                      </p>
                    </div>
                  )}
                  {contactData.billingEmail && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                        {strings.Email || 'Email'}
                      </p>
                      <p className="text-base" style={{ color: theme.textPrimary }}>
                        {contactData.billingEmail}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address Card */}
            {!contactData.isBillingAndShippingAddressSame && (
              <Card
                className="rounded-xl overflow-hidden"
                style={{
                  background: theme.bgWhite,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="h-5 w-5" style={{ color: theme.primary }} />
                    <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                      {strings.ShippingDetails || 'Shipping Address'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {contactData.addressLine2 && (
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                          {strings.Address || 'Address'}
                        </p>
                        <p className="text-base" style={{ color: theme.textPrimary }}>
                          {contactData.addressLine2}
                        </p>
                      </div>
                    )}
                    {contactData.shippingCity && (
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                          {strings.City || 'City'}
                        </p>
                        <p className="text-base" style={{ color: theme.textPrimary }}>
                          {contactData.shippingCity}
                        </p>
                      </div>
                    )}
                    {contactData.shippingCountryId && (
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                          {strings.Country || 'Country'}
                        </p>
                        <p className="text-base" style={{ color: theme.textPrimary }}>
                          {getCountryName(contactData.shippingCountryId)}
                        </p>
                      </div>
                    )}
                    {contactData.shippingPostZipCode && (
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                          {strings.PostalCode || 'Postal Code'}
                        </p>
                        <p className="text-base" style={{ color: theme.textPrimary }}>
                          {contactData.shippingPostZipCode}
                        </p>
                      </div>
                    )}
                    {contactData.shippingTelephone && (
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>
                          {strings.Telephone || 'Telephone'}
                        </p>
                        <p className="text-base" style={{ color: theme.textPrimary }}>
                          {contactData.shippingTelephone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
