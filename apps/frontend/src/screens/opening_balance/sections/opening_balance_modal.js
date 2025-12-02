import React from 'react'
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from 'reactstrap'

import { Formik } from 'formik';
import * as Yup from "yup";

import Select from 'react-select'
import { selectOptionsFactory } from "utils";
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);
class OpeningBalanceModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      language: window['localStorage'].getItem('language'),
      initValue: {
        accountName: '',
        openingBalance: '',
        currency: ''
      }
    }
    this.regEx = /^[0-9\d]+$/;
    this.formRef = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedRowData !== prevProps.selectedRowData) {
      const { selectedRowData } = this.props
      if (selectedRowData !== '') {
        this.setState({
          initValue: {
            accountName: { label: selectedRowData.accountName, value: selectedRowData.accountId },
            openingBalance: selectedRowData.openingBalance,
            currency: selectedRowData.currency
          }
        })
      } else {
        this.setState({
          initValue: {
            accountName: '',
            openingBalance: '',
            currency: ''
          }
        })
      }
    }
  }

  handleSubmit = (data) => {
    const postData = {
      accountName: data.accountName ? data.accountName.value : '',
      openingBalance: data.openingBalance,
      currency: data.currency

    }
    this.props.createOpeningBalance(postData).then((res) => {
      if (res.status === 200) {
      this.props.closeOpeningBalanceModal()
      }
    })
  }

  render() {
    strings.setLanguage(this.state.language);
    const { showOpeningBalanceModal, bankAccountList, closeOpeningBalanceModal , selectedRowData } = this.props
    const { initValue } = this.state
    return (
      <div className="opening-balance-screen">
        <div className="animated fadeIn">
          <Modal isOpen={showOpeningBalanceModal}
            className={"modal-primary " + this.props.className}
          >
            <ModalHeader toggle={this.toggleDanger}><i className="nav-icon fas fa-area-chart" /> {selectedRowData ? 'Update' : 'Add'} {strings.OpeningBalance}</ModalHeader>
            <ModalBody>
              <Formik
                initialValues={initValue}
                ref={this.formRef}
                onSubmit={(values, { resetForm }) => {
                  this.handleSubmit(values, resetForm)
                }}
                validationSchema={
                  Yup.object().shape({
                    accountName: Yup.string()
                      .required("Account name is required"),
                    openingBalance: Yup.string()
                      .required("Opening balance is required"),
                  })
                }
              >
                {(props) => (
                  <Form onSubmit={props.handleSubmit}>
                    <FormGroup>
                      <Label htmlFor="categoryCode"><span className="text-danger">* </span>{strings.Account}</Label>
                      <Select
                      styles={customStyles}
                        options={bankAccountList ? selectOptionsFactory.renderOptions('name', 'bankAccountId', bankAccountList, 'Account') : []}
                        placeholder={strings.Select+strings.Account}
                        onChange={(option) => {
                          if (option && option.value) {
                            props.handleChange('accountName')(option)
                          } else {
                            props.handleChange('accountName')('')
                          }
                        }}
                        value={props.values.accountName ? props.values.accountName : ''}
                        className={
                          props.errors.accountName && props.touched.accountName
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {props.errors.accountName && props.touched.accountName && (
                        <div className="invalid-feedback">{props.errors.accountName}</div>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="openingBalance"><span className="text-danger">* </span>{strings.OpeningBalance}</Label>
                      <Input
                        type="text"
                        id="openingBalance"
                        name="openingBalance"
                        placeholder={strings.Enter+strings.OpeningBalance}
                        onChange={(option) => { if (option.target.value === '' || this.regEx.test(option.target.value)) { props.handleChange('openingBalance')(option) } }}
                        value={props.values.openingBalance}
                        autoComplete="off"
                        className={
                          props.errors.openingBalance && props.touched.openingBalance
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {props.errors.openingBalance && props.touched.openingBalance && (
                        <div className="invalid-feedback">{props.errors.openingBalance}</div>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="categoryCode">{strings.Currency}</Label>
                      <Input
                        type="text"
                        id="categoryCode"
                        name="categoryCode"
                        placeholder={strings.Select+strings.Currency}
                        disabled
                        value={props.values.currency}
                      />
                    </FormGroup>
                  </Form>
                )}
              </Formik>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="button" className="btn-square" onClick={() => { this.formRef.current.handleSubmit() }}>{strings.Save}</Button>&nbsp;
                <Button color="secondary" className="btn-square" onClick={closeOpeningBalanceModal}>{strings.Cancel}</Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    )
  }
}

export default OpeningBalanceModal
