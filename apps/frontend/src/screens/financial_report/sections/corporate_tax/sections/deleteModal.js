import React from 'react';
import { connect } from 'react-redux';
import logo from 'assets/images/brand/datainnLogo.png';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
	UncontrolledTooltip,
	CardBody,
	Table,
	Card,
	ButtonGroup,
	ModalHeader,
} from 'reactstrap';
import { toInteger, upperCase, upperFirst } from 'lodash';
import { Formik, Field } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import { selectOptionsFactory } from 'utils';
import DatePicker from 'react-datepicker';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';

import { toast } from 'react-toastify';
import { data } from '../../../../Language/index'
import LocalizedStrings from 'react-localization';

import '../style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import ReactToPrint from 'react-to-print';
import { Loader } from 'components';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions'
import * as CTReportActions from '../actions';

const mapStateToProps = (state) => {
	return {
		contact_list: state.request_for_quotation.contact_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		commonActions: bindActionCreators(CommonActions, dispatch),
		payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
		ctReportActions: bindActionCreators(CTReportActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class DeleteModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			loading: false,
		};
	}
	static getDerivedStateFromProps(nextProps, prevState) {
	}

	deleteById = (current_report_id) => {

		this.props.ctReportActions
			.deleteReportById(current_report_id)
			.then((res) => {
				if (res.status === 200) {
					this.props.commonActions.tostifyAlert(
						'success',
						'Report Deleted Successfully!'
					);
					console.log(res.data);
					this.props.closeModal(false);
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err.data ? err.data.message : 'Report Deleted Unsuccessfully'
				);
				this.props.closeModal(false);
			});
	};

	render() {
		strings.setLanguage(this.state.language);
		const { openModal, closeModal, current_report_id } = this.props;
		const { initValue, loading } = this.state;
		const message1 =
			<text>
				<b>Delete CT Report File ?</b>
			</text>
		const message = 'This CT report file will be deleted permanently and cannot be recovered. ';
		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openModal} className="modal-success contact-modal" style={{ width: "fit-content" }}>
					<ModalHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">

									<span className="ml-2">{message1}</span>
								</div>
							</Col>
						</Row>
					</ModalHeader>
					<ModalBody style={{ padding: "15px 0px 0px 0px" }}>
						<div style={{ padding: " 0px 1px" }}>
							<div >
								<CardBody>
									<h5>{message}</h5>
								</CardBody>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							className="btn-square pull-left"
							onClick={() => {
								this.deleteById(current_report_id)

							}}
						>
							<i className="fas fa-check-double mr-1"></i>	Yes
						</Button>
						<Button
							color="secondary"
							className="btn-square  pull-right"
							onClick={() => {
								closeModal(false);
							}}
						>
							<i className="fa fa-ban  mr-1"></i> No
						</Button>
					</ModalFooter>
				</Modal>

			</div>
		);
	}
}


export default connect(
	mapStateToProps
	, mapDispatchToProps
)(DeleteModal);