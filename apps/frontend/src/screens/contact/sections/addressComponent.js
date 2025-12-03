import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    Row,
    Col,
    FormGroup,
    Input,
    Label,
} from 'reactstrap';
import Select from 'react-select';
import { ZipCodeInput } from 'components';
import { upperFirst } from 'lodash-es';
import { selectOptionsFactory, DropdownLists } from 'utils';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';
import * as ContactActions from 'screens/contact/actions';
import 'react-phone-input-2/lib/style.css'

const mapStateToProps = (state) => {
    return {
        country_list: DropdownLists.getCountryDropdown(state.contact.country_list),
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        contactActions: bindActionCreators(ContactActions, dispatch),
    };
};


let strings = new LocalizedStrings(data);
class AddressComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            state_list: [],
        };
        this.regEx = /^[0-9\d]+$/;
        this.regExTelephone = /^[0-9-]+$/;
        this.regExBoth = /[a-zA-Z0-9]+$/;
        this.regExAlpha = /^[a-zA-Z ]+$/;
        this.regExAddress = /^[a-zA-Z0-9\s\D,'-/]+$/;
    }

    componentDidMount = () => {
        this.props.contactActions.getCountryList();
    };

    componentDidUpdate(prevProps) {
        const { values } = this.props;
        if ((prevProps.values.countryId !== values?.countryId) || (this.state.state_list.length === 0)) {
            if (values?.countryId) {
                this.props.contactActions.getStateList(values?.countryId).then((res) => {
                    if (res.status === 200) {
                        this.setState({
                            state_list: DropdownLists.getStateDropdown(res.data, values?.countryId)
                        })
                    }
                });
            }
        }
    }

    render() {
        strings.setLanguage(this.state.language);
        const {
            values,
            touched,
            errors,
            country_list,
            onChange,
            addressType,
            disabled,
        } = this.props;
        const { state_list } = this.state;
        //console.log(this.props, addressType);
        return (
            <>
                <Col md="4">
                    <FormGroup>
                        <Label htmlFor="address"><span className="text-danger">* </span>
                            {addressType} {strings.Address}
                        </Label>
                        <Input
                            type="text"
                            maxLength="100"
                            id="address"
                            name="address"
                            autoComplete="Off"
                            placeholder={strings.Enter + addressType + strings.Address}
                            onChange={(option) => {
                                if (
                                    option.target?.value === '' ||
                                    this.regExAddress.test(
                                        option.target?.value,
                                    )
                                ) {
                                    option = upperFirst(option.target?.value)
                                    onChange('address', option,);
                                }
                            }}
                            value={values?.address}
                            className={
                                errors?.address &&
                                    touched?.address
                                    ? 'is-invalid'
                                    : ''
                            }
                        />
                        {errors?.address &&
                            touched?.address && (
                                <div className="invalid-feedback">
                                    {addressType} {errors?.address}
                                </div>
                            )}
                    </FormGroup>
                </Col>

                <Col md="4">
                    <FormGroup>
                        <Label htmlFor="countryId"><span className="text-danger">* </span>{strings.Country}</Label>
                        <Select
                            options={country_list}
                            value={values?.countryId?.value ? values?.countryId : country_list.find((option) => option?.value === values?.countryId)}
                            isDisabled={disabled.countryId}
                            onChange={(option) => {
                                if (option && option?.value) {
                                    onChange('countryId', option?.value);
                                } else {
                                    onChange('countryId', '');
                                }
                                onChange('stateId', '');
                            }}
                            placeholder={strings.Select + strings.Country}
                            id="countryId"
                            name="countryId"
                            className={
                                errors?.countryId &&
                                    touched?.countryId
                                    ? 'is-invalid'
                                    : ''
                            }
                        />
                        {errors?.countryId &&
                            touched?.countryId && (
                                <div className="invalid-feedback">
                                    {errors?.countryId}
                                </div>
                            )}
                    </FormGroup>
                </Col>
                <Col md="4">
                    <FormGroup>
                        <Label htmlFor="stateId"><span className="text-danger">* </span>
                            {values?.countryId === 229 ? strings.Emirate : strings.StateRegion}
                        </Label>
                        <Select
                            options={state_list}
                            value={values?.stateId?.value ? values?.stateId : state_list.find((option) => option?.value === values?.stateId)}
                            onChange={(option) => {
                                if (option && option?.value) {
                                    onChange('stateId', option.value);
                                } else {
                                    onChange('stateId', '');
                                }
                            }}
                            placeholder={values?.countryId === 229 ? strings.Select + strings.Emirate : strings.Select + strings.StateRegion}
                            id="stateId"
                            name="stateId"
                            className={
                                errors?.stateId &&
                                    touched?.stateId
                                    ? 'is-invalid'
                                    : ''
                            }
                        />
                        {errors?.stateId &&
                            touched?.stateId && (
                                <div className="invalid-feedback">
                                    {errors?.stateId}
                                </div>
                            )}
                    </FormGroup>
                </Col>
                {addressType === strings.Billing &&
                    <Col md="4">
                        <FormGroup>
                            <Label htmlFor="email">
                                {addressType} {strings.Email}
                            </Label>
                            <Input
                                type="text"
                                maxLength="80"
                                id="email"
                                name="email"
                                placeholder={strings.Enter + addressType + strings.Email + " " + strings.Address}
                                onChange={(value) => {
                                    onChange('email', value);

                                }}
                                value={values?.email}
                                className={
                                    errors?.email &&
                                        touched?.email
                                        ? 'is-invalid'
                                        : ''
                                }
                            />
                            {errors?.email &&
                                touched?.email && (
                                    <div className="invalid-feedback">
                                        {errors?.email}
                                    </div>
                                )}
                        </FormGroup>
                    </Col>
                }
                <Col md="4">
                    <FormGroup>
                        <Label htmlFor="city"><span className="text-danger"></span>{strings.City}</Label>
                        <Input
                            autoComplete="Off"
                            value={values?.city}
                            onChange={(option) => {
                                if (
                                    option.target?.value === '' ||
                                    this.regExAlpha.test(
                                        option.target?.value,
                                    )
                                ) {
                                    option = upperFirst(option.target?.value)
                                    onChange('city', option);
                                }
                            }}
                            placeholder={strings.Location}
                            id="city"
                            name="city"
                            type="text"
                            maxLength="100"
                            className={
                                errors?.city && touched?.city
                                    ? 'is-invalid'
                                    : ''
                            }
                        />
                        {errors?.city && touched?.city && (
                            <div className="invalid-feedback">
                                {errors?.city}
                            </div>
                        )}
                    </FormGroup>
                </Col>
                <Col md="4" >
                    <ZipCodeInput
                        onChange={(field, value) => {
                            onChange(field, value);
                        }}
                        zipCodeName={'postZipCode'}
                        zipCodeValue={values?.postZipCode}
                        countryId={values?.countryId}
                        zipCodeError={errors?.postZipCode}
                        zipCodeTouched={touched?.postZipCode}
                        required={true}
                    />
                </Col>
                <Col md="4">
                    <FormGroup>
                        <Label htmlFor="telephone">{strings.Telephone}</Label>
                        <Input
                            maxLength="15"
                            type="text"
                            id="telephone"
                            name="telephone"
                            autoComplete="Off"
                            placeholder={strings.Enter + strings.TelephoneNumber}
                            onChange={(option) => {
                                if (
                                    option.target?.value === '' ||
                                    this.regExTelephone.test(option.target?.value)
                                ) {
                                    onChange('telephone', option);
                                }
                            }}
                            value={values?.telephone}
                            className={
                                errors?.telephone &&
                                    touched?.telephone
                                    ? 'is-invalid'
                                    : ''
                            }
                        />
                        {errors?.telephone &&
                            touched?.telephone && (
                                <div className="invalid-feedback">
                                    {errors?.telephone}
                                </div>
                            )}
                    </FormGroup>
                </Col>

                <Col md="4">
                    <FormGroup>
                        <Label htmlFor="fax">
                            {strings.Fax}
                        </Label>
                        <Input
                            type="text"
                            maxLength="15"
                            id="fax"
                            name="fax"
                            autoComplete="Off"
                            placeholder={strings.Enter + strings.Fax}
                            onChange={(option) => {
                                if (
                                    option.target?.value === '' ||
                                    this.regEx.test(option.target?.value)
                                ) {
                                    onChange('fax', option,);
                                }


                            }}
                            value={values?.fax}
                            className={
                                errors?.fax &&
                                    touched?.fax
                                    ? 'is-invalid'
                                    : ''
                            }
                        />
                        {errors?.fax &&
                            touched?.fax && (
                                <div className="invalid-feedback">
                                    {errors?.fax}
                                </div>
                            )}
                    </FormGroup>
                </Col>
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddressComponent);
