import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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
  Col
} from 'reactstrap'
import { Loader, LeavePage} from 'components'
import Select from 'react-select';
import { selectOptionsFactory } from 'utils';
import DatePicker from 'react-datepicker';
import { CommonActions,AuthActions } from 'services/global'
import 'react-toastify/dist/ReactToastify.css'
import './style.scss'
import * as DetailOpeningBalancesAction from './actions'
import * as OpeningBalanceActions from '../../actions';
import { Formik } from 'formik';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';

const mapStateToProps = (state) => {
  return ({
    transaction_category_list: state.opening_balance.transaction_category_list,
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailOpeningBalancesAction: bindActionCreators(DetailOpeningBalancesAction, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    openingBalanceActions: bindActionCreators(OpeningBalanceActions, dispatch),
  })
}
let strings = new LocalizedStrings(data);
class DetailOpeningBalance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
      initValue: {
      },
      loading: true,
      dialog: null,
      current_opening_balance_id: null,
      loadingMsg:"Loading...",
      disableLeavePage:false, 
    }
    this.regExAlpha = /^[a-zA-Z ]+$/;
    this.regExBoth = /[a-zA-Z0-9]+$/;
    this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;

  }

  componentDidMount = () => {
    if (this.props.location.state && this.props.location.state.id) {
    	this.props.openingBalanceActions.getTransactionCategoryList();
    //  this.getCompanyCurrency();
      this.props.detailOpeningBalancesAction.getOpeningBalanceById(this.props.location.state.id).then((res) => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            current_opening_balance_id: this.props.location.state.id,
            initValue: {
              id:res.data.current_opening_balance_id ? res.data.current_opening_balance_id : '',
            //  effectiveDate: res.data.effectiveDate ? res.data.effectiveDate : '',
              transactionCategoryId: res.data.transactionCategoryId ? res.data.transactionCategoryId : '',
              openingBalance: res.data.openingBalance ? res.data.openingBalance : '',

            }
          })
          
        }
      }).catch((err) => {
        this.setState({loading: false})
        this.props.history.push('/admin/accountant/opening-balance')
      })
    } else {
      this.props.history.push('/admin/accountant/opening-balance')
    }

  }

  getData = (data) => {
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

  // Create or Edit Currency
  handleSubmit = (data, resetForm) => {
  	const { current_opening_balance_id } = this.state;
		let postData = this.getData(data);

		postData = { ...postData, ...{ id: current_opening_balance_id } };
    this.setState({ loading:true,  disableLeavePage:true,loadingMsg:"Updating Opening Balance..."});
      this.props.detailOpeningBalancesAction.updateOpeningBalance(postData).then((res) => {
      if (res.status === 200) {
        resetForm();
        this.props.commonActions.tostifyAlert(
          'success',
          res.data ? res.data.message : 'Opening Balance Updated Successfully!')
        this.props.history.push('/admin/accountant/opening-balance')
        this.setState({ loading:false,});
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error',
        err.data ? err.data.message : 'Opening Balance Updated Unsuccessfully'
        )
    })
  }

  getTransactionCatogery = () => {
    
  }
  


  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

  render() {
    strings.setLanguage(this.state.language);
    const { loading, initValue,dialog,loadingMsg} = this.state

    const{transaction_category_list} =this.props;

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
    return (
    	loading ==true? <Loader loadingMsg={loadingMsg}/> :
<div>
      <div className="detail-vat-code-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-briefcase" />
                    <span className="ml-2">{strings.Update+" "+strings.OpeningBalance}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Loader></Loader>
                  ) : (
                      <Row>
                        <Col lg={10}>
                          <Formik
                            initialValues={initValue}
                            onSubmit={(values, { resetForm }) => {
                              this.handleSubmit(values, resetForm);
                            }}
                          //   validationSchema={Yup.object().shape({
                          //     exchangeRate: Yup.string().required(
                          //       'Exchange Rate is Required',
                          //     ),
                          // })}
                          >
                            {(props) => (
                              
                              <Form onSubmit={props.handleSubmit} name="simpleForm">
                               <Row>
																<Col lg={3}>
																<FormGroup className="mb-3">
																<Label htmlFor="transactionCategoryBalanceId">
																 {strings.ChartofAccounts}
																</Label>
																		<Select
																		styles={customStyles}
																		id="transactionCategoryId"
																		name="transactionCategoryId"
																		placeholder={strings.Select+strings.TransactionCategory}
																		options={
																			transaction_category_list
																				? selectOptionsFactory.renderOptions(
																								'transactionCategoryName',
																								'transactionCategoryId',
																								transaction_category_list,
																									'Chart of Account',
																											  )
																									: []
																						}
																		value={props.values.transactionCategoryId}
																		className={
																			props.errors.transactionCategoryId &&
																			props.touched.transactionCategoryId
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) =>
																			props.handleChange('transactionCategoryId')(
																				option,
																			)
																		}
																	/>
																	{props.errors.transactionCategoryId &&
																		props.touched.transactionCategoryId && (
																			<div className="invalid-feedback">
																				{props.errors.transactionCategoryId}
																			</div>
																		)}
																			</FormGroup>
																				</Col>
                                        <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="effectiveDate">
																		<span className="text-danger">* </span>
																  {strings.EffectiveDate}
																	</Label>
                                  <DatePicker
																		id="date"
																		name="effectiveDate"
																		className={`form-control ${
																			props.errors.effectiveDate &&
																			props.touched.effectiveDate
																				? 'is-invalid'
																				: ''
																		}`}
																		placeholderText={strings.EffectiveDate}
																		selected={props.values.effectiveDate}
																		showMonthDropdown
																		showYearDropdown
																		dropdownMode="select"
																		dateFormat="dd-MM-yyyy"
																		maxDate={new Date()}
																		onChange={(value) => {
																			props.handleChange('effectiveDate')(value);
																		}}
																	/>
																	{props.errors.effectiveDate &&
																		props.touched.effectiveDate && (
																			<div className="invalid-feedback">
																				{props.errors.effectiveDate}
																			</div>
																		)}
																</FormGroup>
															</Col>
															</Row>
                              <Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="openingBalance">
																		<span className="text-danger">* </span>{strings.Amount}
																	</Label>
																	<Input
																		type="text"
                                    min="0"
																		maxLength="14,2"
																		name="openingBalance"
																		id="openingBalance"
																		rows="5"
																		className={
																			props.errors.openingBalance &&
																			props.touched.openingBalance
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regDecimal.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('openingBalance')(
																					option,
																				);
																			}
																		}}
																		value={props.values.openingBalance}
																		placeholder={strings.Enter+strings.Amount}
																	/>
																	{props.errors.openingBalance &&
																		props.touched.openingBalance && (
																			<div className="invalid-feedback">
																				{props.errors.openingBalance}
																			</div>
																		)}
																</FormGroup>
															</Col>
															</Row>
                                <Row>
                                  <Col lg={10} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                                                                      <FormGroup className="text-right">
                                      <Button type="submit" name="submit" color="primary" className="btn-square mr-3">
                                        <i className="fa fa-dot-circle-o"></i> {strings.Update}
                                      </Button>
                                      <Button type="submit" color="secondary" className="btn-square"
                                        onClick={() => { this.props.history.push('/admin/accountant/opening-balance') }}>
                                        <i className="fa fa-ban"></i>  {strings.Cancel}
                                      </Button>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </Form>
                            )}
                          </Formik>
                        </Col>
                      </Row>
                    )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {this.state.disableLeavePage ?"":<LeavePage/>}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailOpeningBalance)
