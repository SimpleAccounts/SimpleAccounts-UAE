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


const mapStateToProps = (state) => {
  return ({

  })
}
const mapDispatchToProps = (dispatch) => {
  return ({

  })
}

class ViewBankAccount extends React.Component {
  render() {
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
                    <span className="ml-2">View Bank Account Details {
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
                          <Label className="label" htmlFor="account_name">Transaction Type </Label>
                          <p> {chartOfAccountId}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="currency">Transaction Date </Label>
                          <p>{moment(transactionDate).format('DD/MM/YYYY')}</p> 
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="opening_balance">Total Amount</Label>
                          <p>{(transactionAmount).toLocaleString(navigator.language, { minimumFractionDigits: 2 })}</p>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="">
                          <Label className="label" htmlFor="account_type">Category</Label>
                          <p>{transactionCategoryId}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="account_number">Project</Label>
                          <p>{projectId}</p>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="bank_name">Description</Label>
                          <p>{description}</p>
                        </FormGroup>
                      </Col>

                    </Row>
                    <Row>
                      <Col lg={4}>
                        <FormGroup className="mb-3">
                          <Label className="label" htmlFor="iban_number">Reciept Number</Label>
                          <p>{receiptNumber}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3 hideAttachment">
                          <Label className="label" htmlFor="swift_code">Attachment Description</Label>
                          <p>{attachementDescription}</p>
                        </FormGroup>
                      </Col>
                      <Col lg={4}>
                        <FormGroup className="mb-3 hideAttachment">
                          <Label className="label" htmlFor="country">Reciept Attachment</Label>
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
