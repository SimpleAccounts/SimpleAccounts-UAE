import React from 'react';

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import './style.scss';

class ConfirmLeavePageModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { isOpen, okHandler, cancelHandler, message,message1 } = this.props;

		return (
			<div className="confirm-modal-component">
				<Modal isOpen={isOpen} centered className="modal-primary">
					<ModalHeader toggle={cancelHandler} tag="h4">
					<h5 className="mb-0">{message1}</h5>
					</ModalHeader>
					<ModalBody>
						<h5 className="mb-0">{message}</h5>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" className="btn-square" onClick={okHandler}>
							Confirm
						</Button>{' '}
						<Button
							color="secondary"
							className="btn-square"
							onClick={cancelHandler}
						>
							Cancel
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default ConfirmLeavePageModal;
