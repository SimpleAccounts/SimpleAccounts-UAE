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
import moment from 'moment'
import API_ROOT_URL from '../../../../../constants/config'


const mapStateToProps = (state) => {
    return ({

    })
}
const mapDispatchToProps = (dispatch) => {
    return ({

    })
}

class ViewExpenseDetails extends React.Component {
    render() {

        const {
            initialVals
        } = this.props
        return (
            <Card className="view_details">
                <CardHeader>
                    <Row>
                        <Col lg={11}>
                            <div className="h4 mb-0 d-flex align-items-center">
                                <i className="fas fa-university" />
                                <span className="ml-2">View Expense Details {
                                    // current_bank_account ? ` - ${current_bank_account.bankAccountName}` : ''
                                }
                                </span>
                            </div>
                        </Col>
                        <Col lg={1} style={{ textAlign: 'right' }}>
                            <i className="fas fa-edit" onClick={() => { this.props.editDetails() }} />
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
                                            <Label className="label" htmlFor="account_name" >Expense Category </Label>
                                            <p>{initialVals.expenseCategory ? initialVals.expenseCategory : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="payee">Payee</Label>
                                            <p>{initialVals.payee ? initialVals.payee : '-' }</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="currency">Expense Date :</Label>
                                            <p> {initialVals.expenseDate ? moment(initialVals.expenseDate).format('DD/MM/YYYY') : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="bank_name">Currency</Label>
                                            <p>{initialVals.currency ? initialVals.currency : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="account_number">Employee</Label>
                                            <p>{initialVals.employee ? initialVals.employee : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="account_number">Project</Label>
                                            <p>{initialVals.projectId ? initialVals.projectId : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="bank_name">Amount</Label>
                                            <p>{initialVals.expenseAmount ? (initialVals.expenseAmount).toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="account_number">Tax</Label>
                                            <p>{initialVals.vatCategoryId ? initialVals.vatCategoryId : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="account_number">Pay Through</Label>
                                            <p>{initialVals.payMode ? initialVals.payMode : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                               {initialVals.bankAccountId && <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="bank_name">Bank Account</Label>
                                            <p>{initialVals.bankAccountId}</p>
                                        </FormGroup>
                                    </Col>}
                                    <Col lg={8}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="bank_name">Description</Label>
                                            <p>{initialVals.expenseDescription}</p>
                                        </FormGroup>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="iban_number">Reciept Number</Label>
                                            <p>{initialVals.receiptNumber ? initialVals.receiptNumber : '-'}</p>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="country">Reciept Attachment</Label>
                                          {initialVals.fileName ?  <NavLink download={initialVals.fileName} href={`${API_ROOT_URL.API_ROOT_URL}${initialVals.filePath}`} style={{ fontSize: '0.875rem' }} target="_blank" >{initialVals.fileName}</NavLink> : <p>-</p>}
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="mb-3">
                                            <Label className="label" htmlFor="swift_code">Attachment Description</Label>
                                            <p>{initialVals.attachementDescription ? initialVals.attachementDescription : '-'}</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewExpenseDetails)
