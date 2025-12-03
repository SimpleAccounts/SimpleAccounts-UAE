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
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Formik } from 'formik';
import * as Yup from 'yup';



class SupplierModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		};
		
	}

	

	// Create or Contact
	renderQuantity = (cell, row) =>  {
		return (

		<div>
			{/* <TextField></TextField> */}
			<Input
				type="text"
				
				placeholder="Quantity" >
			</Input>
		</div>
		)
	}
	
	render() {
		const {
			openMultiSupplierProductModal,
			closeMultiSupplierProductModal,
			inventory_list,
			// currency_list,
			// country_list,
		} = this.props;
		//console.log("inventoryList", inventory_list)
		const { initValue } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openMultiSupplierProductModal}
					className="modal-success contact-modal"
				>
					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm, setSubmitting }) => {
							this.handleSubmit(values, resetForm);
						}}
						validationSchema={Yup.object().shape({
							firstName: Yup.string().required('First name is required'),
							vatRegistrationNumber: Yup.string().required(' Tax registration number is required'),
							// lastName: Yup.string().required('Last Name is required'),
							// middleName: Yup.string().required('Middle Name is required'),
							// contactType: Yup.string()
							// .required("Please Select Contact Type"),
							//       organization: Yup.string()
							//       .required("Organization Name is required"),
							//     poBoxNumber: Yup.number()
							//       .required("PO Box Number is required"),
						
							//     addressLine1: Yup.string()
							//       .required("Address is required"),
							// countryId: Yup.string()
							// 	.required('Country is required')
							// 	.nullable(),
							// stateId: Yup.string().when('countryId', {
							// 	is: (val) => (val ? true : false),
							// 	then: Yup.string().required('State is required'),
							// }),
							//     city: Yup.string()
							//       .required("City is required"),
							//postZipCode: Yup.string().required('Postal Code is required'),
							//     billingEmail: Yup.string()
							//       .required("Billing Email is required")
							//       .email('Invalid Email'),
							//     contractPoNumber: Yup.number()
							//       .required("Contract PoNumber is required"),
							// vatRegistrationNumber: Yup.string().required(
							// 	'Tax Registration Number is required',
							// ),
							//       .nullable(),
						})}
					>
						{(props) => {
							const { isSubmitting } = props;
							return (
								<Form
									name="simpleForm"
									onSubmit={props.handleSubmit}
									className="create-contact-screen"
								>
									<CardHeader toggle={this.toggleDanger}>
										<Row>
											<Col lg={12}>
												<div className="h4 mb-0 d-flex align-items-center">
													<i className="nav-icon fas fa-id-card-alt" />
													<span className="ml-2">Quantity</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
									<h4 className="mb-3 mt-3">Quantity</h4>
									<div style={{overflowX:'auto'}}>
										<BootstrapTable
											selectRow={this.selectRowProp}
											search={false}
											options={this.options}
											data={inventory_list ? inventory_list : []}
											version="4"
											hover
											keyField="id"
											pagination={
												inventory_list &&
												inventory_list > 0
													? true
													: false
											}
											remote
											fetchInfo={{
												dataTotalSize: inventory_list.count
													? inventory_list.count
													: 0,
											}}
											className="supplier-invoice-table"
											ref={(node) => (this.table = node)}
										>
											<TableHeaderColumn
												dataField="supplierName"
												// dataFormat={this.renderInvoiceNumber}
												dataSort
											//	width="10%"
												className="table-header-bg"
											>
												Supplier Name
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="stockInHand"
												dataSort
											//	width="12%"
												className="table-header-bg"
											>
												Stock in hand
											</TableHeaderColumn>
											<TableHeaderColumn
											//	width="10%"
												dataField="reOrderLevel"
												dataFormat={this.renderInvoiceStatus}
												dataSort
												className="table-header-bg"
											>
												Reorder Level
											</TableHeaderColumn>
											<TableHeaderColumn
												dataField="invoiceDate"
												dataSort
											//	width="7%"
												dataFormat={this.renderQuantity}
												className="table-header-bg"
											>
												Quantity
											</TableHeaderColumn>
											
										</BootstrapTable>
									</div>
										
									</ModalBody>
									<ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
											disabled={isSubmitting}
										>
											<i className="fa fa-dot-circle-o"></i> Save
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeMultiSupplierProductModal(false);
											}}
										>
											<i className="fa fa-ban"></i> Cancel
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

export default SupplierModal;
