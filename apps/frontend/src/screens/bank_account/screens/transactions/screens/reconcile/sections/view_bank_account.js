import React from 'react'
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  NavLink
} from 'reactstrap'


// import './style.scss'
import  moment  from 'moment'
import API_ROOT_URL from '../../../../../../../constants/config'
import {data}  from '../../../../../../Language/index'
import LocalizedStrings from 'react-localization';


const mapStateToProps = (state) => {
  return ({

  })
}
const mapDispatchToProps = (dispatch) => {
  return ({

  })
}
let strings = new LocalizedStrings(data);
class ViewBankAccount extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
    language: window['localStorage'].getItem('language'),
  };
}
  render() {
    strings.setLanguage(this.state.language);
    const {
      chartOfAccountId,transactionDate,transactionAmount,transactionCategoryId,projectId,description,receiptNumber,attachementDescription,fileName,filePath
    } = this.props.initialVals
    return (
      <Card className="view_details">
            <CardHeader>
              <Row>
                <Col lg={11}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="fas fa-university" />
                    <span className="ml-2">{strings.View+" "+strings.BankAccount+" "+strings.Details} {
                      // current_bank_account ? ` - ${current_bank_account.bankAccountName}` : ''
                    }
                    </span>
                  </div>
                </Col>
                <Col lg={1} style={{textAlign: 'right'}}>
                    <i className="fas fa-edit" onClick={() => {this.props.editDetails()}}/>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <div>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="account_name">{strings.TransactionType} </Label>
                          <p> {chartOfAccountId}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="currency">{strings.TransactionDate} </Label>
                          <p>{moment(transactionDate).format('DD/MM/YYYY')}</p> 
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="opening_balance">{strings.Total+" "+strings.Amount}</Label>
                          <p>{(transactionAmount).toLocaleString(navigator.language, { minimumFractionDigits: 2 })}</p>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="">
                          <Label className="label" htmlFor="account_type">{strings.Category}</Label>
                          <p>{transactionCategoryId}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="account_number">{strings.Project}</Label>
                          <p>{projectId}</p>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="bank_name">{strings.Description}</Label>
                          <p>{description}</p>
                        </FormGroup>
                      </Col>

                    </Row>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="iban_number">{strings.ReceiptNumber}</Label>
                          <p>{receiptNumber}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="swift_code">{strings.AttachmentDescription}</Label>
                          <p>{attachementDescription}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="country">{strings.ReceiptAttachment}</Label>
                          <NavLink download={fileName} href={`${API_ROOT_URL.API_ROOT_URL}${filePath}`} style={{ fontSize: '0.875rem' }} target="_blank" >{fileName}</NavLink>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewBankAccount)
