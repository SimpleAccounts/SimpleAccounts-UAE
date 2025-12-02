import React from "react";
import { Modal } from "reactstrap";
import "react-phone-input-2/lib/style.css";
import CreateEmployee from "screens/payrollemp/screens/create/screen";

class EmployeeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { openModal, closeModal } = this.props;
    console.log("kdjslkdjlks");
    return (
      <div className="contact-modal-screen">
        <Modal isOpen={openModal} className="modal-success contact-modal" style={{maxWidth:'95%'}}>
          <CreateEmployee
            closeModal={(e) => {
              closeModal(e);
            }}
          />
        </Modal>
      </div>
    );
  }
}

export default EmployeeModal;
