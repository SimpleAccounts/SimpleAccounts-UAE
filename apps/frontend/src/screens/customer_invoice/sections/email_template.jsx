import React, { useState } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';

// Zod validation schema
const emailSchema = z.object({
	id: z.string().optional(),
	invoiceMailingBody: z.string().optional(),
	invoiceMailingSubject: z.string().optional(),
	invoiceMailingFrom: z.string().optional(),
	invoiceMailingTo: z.string().optional(),
});

const EmailModal = (props) => {
	const [editorState, setEditorState] = useState(EditorState.createEmpty());
	const [contentState, setContentState] = useState({});
	const [viewEditor, setViewEditor] = useState(false);
	const [message, setMessage] = useState('');

	const content = {
		entityMap: {},
		blocks: [
			{
				key: '637gr',
				text: message,
				type: 'unstyled',
				depth: 0,
				inlineStyleRanges: [],
				entityRanges: [],
				data: {},
			},
		],
	};

	const { control, handleSubmit, formState: { errors }, reset } = useForm({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			id: '',
			invoiceMailingBody: '',
			invoiceMailingSubject: '',
			invoiceMailingFrom: '',
			invoiceMailingTo: '',
		},
	});

	const onContentStateChange = (newContentState) => {
		setContentState(newContentState);
		setMessage(newContentState.blocks[0].text);
	};

	const onSubmit = (formData) => {
		props.sendEmail(props.id);
	};

	const { openEmailModal, closeEmailModal } = props;

	return (
		<div className="contact-modal-screen">
			<Modal isOpen={openEmailModal} className="modal-success contact-modal">
				<Form
					name="simpleForm"
					onSubmit={handleSubmit(onSubmit)}
					className="create-contact-screen"
				>
					<CardHeader>
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
									<Controller
										name="invoiceMailingFrom"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												id="invoiceMailingFrom"
												placeholder="From"
											/>
										)}
									/>
								</FormGroup>
								<FormGroup>
									<Label htmlFor="invoiceMailingTo">To</Label>
									<Controller
										name="invoiceMailingTo"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												id="invoiceMailingTo"
												placeholder="To"
											/>
										)}
									/>
								</FormGroup>
								<FormGroup>
									<Label htmlFor="invoiceMailingSubject">Subject</Label>
									<Controller
										name="invoiceMailingSubject"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												type="text"
												id="invoiceMailingSubject"
												placeholder="Enter the Subject"
											/>
										)}
									/>
								</FormGroup>
								<FormGroup>
									<Label htmlFor="text-input">Content</Label>
									<Editor
										initialContentState={content}
										editorContent={contentState}
										toolbarClassName="editor-toolbar"
										wrapperClassName="wrapperClassName"
										editorClassName="massage-editor"
										onContentStateChange={onContentStateChange}
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
			</Modal>
		</div>
	);
};

export default EmailModal;
