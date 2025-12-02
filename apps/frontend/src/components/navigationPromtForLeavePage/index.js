import React from 'react';

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import NavigationPrompt from "react-router-navigation-prompt";
import { ConfirmDeleteModal, ConfirmLeavePageModal, Loader } from 'components';
import './style.scss';

class LeavePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {initState:{}};
	}

	//fucn for navigation promt
	onCancel() {
		const {initState} = this.state
		(this.props.beforeCancel || ((cb) => {
		 cb();
		}))(() => {
		  this._prevUserAction = 'CANCEL';
		  this.setState({...initState});
		});
	  }
	
	  onConfirm() {
		(this.props.beforeConfirm || ((cb) => {
		 cb();
		}))(() => {
		  this.navigateToNextLocation(this.props.afterConfirm);
		});
	  }

	leavePage =(isActive,onCancel,onConfirm) => {
		const message1 =<text><b>Do you want to switch to another page?
	   </b></text>
		const message = 'By doing so your current changes will get discarded.';
		
		var modal=isActive?
							<ConfirmLeavePageModal
									isOpen={isActive}
									okHandler={onConfirm}
									cancelHandler={onCancel}
									message={message}
									message1={message1}
							/>
						:"";

 return	modal
			
	};
	render() {
		const { isOpen, okHandler, cancelHandler, message,message1 } = this.props;

		return (
			<div >
				<div>
			    <NavigationPrompt			
					// allowGoBack = {true}
					// beforeConfirm={(clb)=>this.cleanup(clb)} //call the callback function when finished cleaning up
					// Children will be rendered even if props.when is falsey and isActive is false:
					// renderIfNotActive={true}
					// Confirm navigation if going to a path that does not start with current path:
					when={(crntLocation, nextLocation, _action) =>!nextLocation || !nextLocation.pathname.startsWith(crntLocation.pathname)}		
				>
				{({ isActive, onCancel, onConfirm }) => {
					return this.leavePage(isActive,onCancel,onConfirm)
				}}
				</NavigationPrompt>
				 </div>
			</div>
		);
	}
}

export default LeavePage;
