import React from 'react';
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
} from 'reactstrap';

import { Formik } from 'formik';
import * as Yup from 'yup';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';

class EmailModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			state_list: [],
			initValue: {
				id: '',
				invoiceMailingBody: '',
				invoiceMailingSubject: '',
				invoiceMailingFrom: '',
			},
			editorState: EditorState.createEmpty(),
			contentState: {},
			viewEditor: false,
			message: '',
		};
		this.formikRef = React.createRef();
		this.regEx = /^[0-9\d]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regExAlpha = /^[a-zA-Z ]+$/;
		this.content = {
			entityMap: {},
			blocks: [
				{
					key: '637gr',
					text: this.state.message,
					type: 'unstyled',
					depth: 0,
					inlineStyleRanges: [],
					entityRanges: [],
					data: {},
				},
			],
		};
	}

	onContentStateChange = (contentState) => {
		this.setState(
			{
				contentState,
			},
			() => {
				this.setState({
					message: this.state.contentState.blocks[0].text,
				});
			},
		);
	};

	handleSubmit = (data, resetForm, setSubmitting) => {
		this.props.sendEmail(this.props.id);
	};

	render() {
		const { openEmailModal, closeEmailModal,} = this.props;
		const { initValue, contentState } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal isOpen={openEmailModal} className="modal-success contact-modal">
					<Formik
						ref={this.formikRef}
						initialValues={initValue}
						onSubmit={(values, { resetForm }) => {
							this.handleSubmit(values, resetForm);
						}}
						validationSchema={Yup.object().shape({})}
					>
						{(props) => {
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
													<span className="ml-2">Email Invoice</span>
												</div>
											</Col>
										</Row>
									</CardHeader>
									<ModalBody>
										<Row className="row-rapper">
											<Col sm="8">
												<FormGroup>
													<Label htmlFor="invoiceMailingFrom">From</Label>
													<Input
														type="text"
														id="invoiceMailingFrom"
														name="invoiceMailingFrom"
														placeholder="From"
														value={props.values.invoiceMailingFrom}
														onChange={(value) => {
															props.handleChange('invoiceMailingFrom')(value);
														}}
													/>
												</FormGroup>
												<FormGroup>
													<Label htmlFor="invoiceMailingTo">To</Label>
													<Input
														type="text"
														id="invoiceMailingTo"
														name="invoiceMailingTo"
														placeholder="To"
														value={props.values.invoiceMailingTo}
														onChange={(value) => {
															props.handleChange('invoiceMailingTo')(value);
														}}
													/>
												</FormGroup>
												<FormGroup>
													<Label htmlFor="invoiceMailingSubject">Subject</Label>
													<Input
														type="text"
														id="invoiceMailingSubject"
														name="invoiceMailingSubject"
														placeholder="Enter the Subject"
														value={props.values.invoiceMailingSubject}
														onChange={(value) => {
															props.handleChange('invoiceMailingSubject')(
																value,
															);
														}}
													/>
												</FormGroup>
												<FormGroup>
													<Label htmlFor="text-input">Content</Label>
													<Editor
														initialContentState={this.content}
														editorContent={contentState}
														toolbarClassName="editor-toolbar"
														wrapperClassName="wrapperClassName"
														editorClassName="massage-editor"
														// onEditorStateChange={this.onEditorStateChange}
														onContentStateChange={this.onContentStateChange}
													/>
												</FormGroup>
											</Col>
										</Row>
									</ModalBody>
									<ModalFooter>
										<Button
											color="primary"
											type="submit"
											className="btn-square"
										>
											<i className="fa fa-dot-circle-o"></i> Send Email
										</Button>
										&nbsp;
										<Button
											color="secondary"
											className="btn-square"
											onClick={() => {
												closeEmailModal(false);
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

export default EmailModal;
