import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import 'react-phone-input-2/lib/style.css'
import {data}  from '../../Language/index'
import LocalizedStrings from 'react-localization';
import  CreateContact from '../../contact/screens/create/screen';

let  strings = new LocalizedStrings(data);
class CustomerModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {
				showConfirmation: false, 
			},
			state_list: [],
		};
	}
	openConfirmation = () => {
        this.setState({ showConfirmation: true });
    };

    closeConfirmation = () => {
        this.setState({ showConfirmation: false });
    };

    
    confirmCancel = () => {
       
        this.props.closeCustomerModal();
        this.closeConfirmation(); 
    };

	render() {
		strings.setLanguage(window['localStorage'].getItem('language'));
		const {
			openCustomerModal,
			closeCustomerModal,
			currency_list,
			country_list,
		} = this.props;
		const { initValue, state_list, checkmobileNumberParam } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openCustomerModal}
					className="modal-success contact-modal"
				>
					<CreateContact
						getCurrentContactData={(contactData) =>{
								this.props.getCurrentUser(contactData);
							}}
						closeModal={(e) => {
							closeCustomerModal(e);
                        }}
                        confirmCancel={() => {
                            this.openConfirmation();
                        }}
						contactType={{label: "Customer",value: 2}} 	
						isParentComponentPresent={true}
					/>
				</Modal>
				<Modal isOpen={this.state.showConfirmation} toggle={this.closeConfirmation} centered>
                    <ModalHeader toggle={this.closeConfirmation}style={{ color: 'white' }}>
						<h4> Do you want to switch to another page? </h4>
					</ModalHeader>
                    <ModalBody>
                		<h5>By doing so your current changes will get discarded. </h5>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.confirmCancel}>Confirm</Button>
                        <Button color="secondary" onClick={this.closeConfirmation}>Cancel</Button>
                    </ModalFooter>
                </Modal>
			</div>
		);
	}
}

export default CustomerModal;