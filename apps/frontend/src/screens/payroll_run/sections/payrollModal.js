import React from 'react';
import {
	Button,
	Row,
	Col,
	Form,
	Input,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
    Table,
} from 'reactstrap';

import { Formik } from 'formik';
import * as Yup from 'yup';


import { toast } from 'react-toastify';
 
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);
class PayrollModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			showDetails : false,
			loading: false,
			initValue: {
                noOfDays:'',
                lop:0
			},
           state_list: [],
          
		};
		this.formikRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.regExAddress = /^[a-zA-Z0-9\s,'-]+$/;


        this.columnHeader1 = [
            { label: '(+) EARNINGS', value: '(+) EARNINGS', sort: false },
            { label: 'AMOUNT', value: 'AMOUNT', sort: false },
      
        ];
        this.columnHeader2 = [
            { label: '(-) DEDUCTIONS', value: '(-) DEDUCTIONS', sort: false },
            { label: 'AMOUNT', value: 'AMOUNT', sort: false },
      
        ];
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

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.selectedData !== nextProps.selectedData || prevState.employeename !== nextProps.employeename ||
			prevState.salaryDetailAsNoOfDaysMap !== nextProps.salaryDetailAsNoOfDaysMap || prevState.netPay !== nextProps.netPay
            || prevState.noOfDays !== nextProps.noOfDays  || prevState.current_employee !== nextProps.current_employee
            || prevState.lop !== nextProps.lop  )
            
            
            {
		           return {
		 	selectedData :nextProps.selectedData,
			 employeename :nextProps.employeename,
             noOfDays :nextProps.noOfDays,
             netPay :nextProps.netPay,
             current_employee: nextProps.current_employee,
             lop: nextProps.lop,
			 salaryDetailAsNoOfDaysMap :nextProps.salaryDetailAsNoOfDaysMap,
            
            };
           
        }
		
    }

    handleSubmit = (data, resetForm) => {
        this.setState({ disabled: true });
            // const {
            //     // id
            // } = data;
    
    
            const formData = new FormData();
    
       formData.append('id',this.state.current_employee)
        formData.append(
          'noOfDays',
          this.state.noOfDays ,
        )
       
        this.props
        .updateEmployeeSalary(formData)
        .then((res) => {
            //  let resConfig = JSON.parse(res.config.data);
            
            if (res.status === 200) {
                this.props.closePayrollModal(true);
           
            }
        })
        .catch((err) => {
            this.displayMsg(err);
            this.formikRef.current.setSubmitting(false);
        });
      }
    
	

	displayMsg = (err) => {
		toast.error(`${err.data}`, {
			position: toast.POSITION.TOP_RIGHT,
		});
	};
	_showDetails = (bool) => {
		this.setState({
		  showDetails: bool
		});
	  }
      handleLopChange = (option) => {

        let noOfDays = 0;
        noOfDays = 30-option;
        this.props.updateParentLop(option,noOfDays)
      }

  updateDays = (lop1) => {
      const noOfDay = 30 - lop1

      this.setState(
        {  
                    noOfDays: noOfDay,
        })
  }
	render() {
		strings.setLanguage(this.state.language);
		const {
			openPayrollModal,
			closePayrollModal,
		} = this.props;
		const { initValue} = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openPayrollModal}
					className="modal-success payroll-modal"
				>
					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm, setSubmitting }) => {
							this.handleSubmit(values, resetForm);
						}}
						validationSchema={Yup.object().shape({
						//	firstName: Yup.string().required('First Name is Required'),
						
							//currrencyCode: Yup.string().required('Currency is Required'),
							// contactType: Yup.string()
							// .required("Please Select Contact Type"),
							//       organization: Yup.string()
							//       .required("Organization Name is Required"),
							//     poBoxNumber: Yup.number()
							//       .required("PO Box Number is Required"),
							// email: Yup.string()
							// 	.required('Email is Required')
							// 	.email('Invalid Email'),
							// mobileNumber: Yup.string()
							// 	.required('Mobile Number is required')
							// 	.test('quantity', 'Invalid Mobile Number', (value) => {
							// 		if (isValidPhoneNumber(value)) {
							// 			return true;
							// 		} else {
							// 			return false;
							// 		}
							// 	}),
							//     addressLine1: Yup.string()
							//       .required("Address is required"),
							//     city: Yup.string()
							//       .required("City is Required"),
							//     billingEmail: Yup.string()
							//       .required("Billing Email is Required")
							//       .email('Invalid Email'),
							//     contractPoNumber: Yup.number()
							//       .required("Contract PoNumber is Required"),
							
							//       currencyCode: Yup.string()
							//       .required("Please Select Currency")
							//       .nullable(),
							// currencyCode: Yup.string().required('Please Select Currency'),
						})}
					>
						{(props) => {
							// const {
							// 	//  handleBlur
							// 	 } = props;
							return (
								<Form
									name="simpleForm"
									onSubmit={props.handleSubmit}
									className="create-contact-screen"
								>
									<CardHeader>
										<Row>
											<Col >
												<div >
													
													<span className="ml-2">{strings.EmployeeName}:</span>
                                                    <h4>{this.state.employeename}</h4>
												</div>
                                                </Col>
                                               
										</Row>
									</CardHeader>
									<ModalBody>
                                                                             <Row>
																				<Col>
																					<h5 className="mb-2 text-left">
																					 {strings.PayableDays}
																					</h5>
																				</Col>
																				<Col className="text-left">
																					<label className="mb-2">
																				
																						30
																					</label>
																				</Col>
																			</Row>
									
                                                                            <Row>
																				<Col>
																					<h5 className="mt-2 text-left">
                                                                                    {strings.LOPDays}
																					</h5>
																				</Col>
																				<Col  className="text-left">
																				<Input
																		type="number"
min="0"
																		maxLength="3"
																		name="lop"
																		id="lop"
																		className={
																			props.errors.lop &&
																			props.touched.lop
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																			if (
																				option.target.value === '' ||
																				this.regEx.test(
																					option.target.value,
																				)
																			) {
																				props.handleChange('lop')(
																					option,
																				);
																			}
                                                                            this.handleLopChange(option.target.value);
																		}}
                                                                        
                                                                        // onChange={(value) => {
																		// 	props.handleChange('lop')(value);
                                                                        //     this.handleLopChange(value);
																		// }}
																		value={this.state.lop}
																		
																	/>
																				</Col>
																			</Row>
                                                                            <hr></hr>
                                                                            <Row>
																				<Col>
																					<h5 className="mt-2 text-left">
																					{strings.ActualPayableDays}	
																					</h5>
																				</Col>
																				<Col className="text-left">
																					<label className="mt-2">
																				
																						{this.state.noOfDays}
																					</label>
																				</Col>
																			</Row>

                                                                           < hr></hr>   
                                                                    <Table >
                                                                <thead style={{backgroundColor:'#dfe9f7'}}>
                                                                    <tr >
                                                                        {this.columnHeader1.map((column, index) => {
                                                                            return (
                                                                                <th>
                                                                                    {column.label}
                                                                                </th>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                </thead>
                                                                {Object.values(
                                                                        this.state.selectedData.salaryDetailAsNoOfDaysMap.Earnings,
                                                                    ).map((item) => ( 
                                                                        <tr>
                                                                            <td>{item.name}</td>
                                                                            <td>{item.value.toLocaleString(undefined, {maximumFractionDigits:2}) ? (
                                                                                item.value.toFixed (2)) : (" ")
                                                                            }</td>
                                                                        </tr>

                                                                    ))}
                                                                    
                                                                <tbody>
                                                                    </tbody>
                                                                    </Table>
																	{this.state.selectedData.salaryDetailAsNoOfDaysMap.Deductions ? (
                                                                    <Table >
                                                                    <thead style={{backgroundColor:'#dfe9f7'}}>
                                                                    <tr >
                                                                        {this.columnHeader2.map((column, index) => {
                                                                            return (
                                                                                <th>
                                                                                    {column.label}
                                                                                </th>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                </thead>
                                                                    <tbody>
                                                                    {this.state.selectedData.salaryDetailAsNoOfDaysMap.Deductions ? (
																	Object.values(
                                                                        this.state.selectedData.salaryDetailAsNoOfDaysMap.Deductions,
                                                                    ).map((item) => ( 
                                                                        <tr>
                                                                            <td>{item.name}</td>
                                                                            <td>{item.value ? (
                                                                                item.value.toFixed (2)) : (" ")
                                                                            }</td>
                                                                        </tr>

                                                                    )) ):(   <tr></tr>)}
                                                                    </tbody>
                                                                    </Table>):( '')}
<hr></hr>                                                                    <Row style={{backgroundColor:'#dfe9f7'}}>
																				<Col lg={6}>
																					<h5 className="mt-2 text-left">
																					{strings.NetPay}
																					</h5>
																				</Col>
																				<Col lg={6} className="text-left">
																					<h4 className="mt-2">
																				
																						{this.state.netPay.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																					</h4>
																				</Col>
																			</Row>
                                  	
									</ModalBody>
									<ModalFooter>
									<Button
											type="button"
											color="primary"
											className="btn-square mr-3"
											onClick={() => {
												this.setState( () => {
													props.handleSubmit();
												});
											}}
										>
											<i className="fa fa-dot-circle-o"></i>  {strings.Save}
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closePayrollModal(false);
											}}
										>
											<i className="fa fa-ban"></i> {strings.Cancel}
										</Button>
									</ModalFooter>
								</Form>
							);
						}}
					</Formik>
				</Modal>
				
			</div>
		);
	}
}

export default PayrollModal ;
