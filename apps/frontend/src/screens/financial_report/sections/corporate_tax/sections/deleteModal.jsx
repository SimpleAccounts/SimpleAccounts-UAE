import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Modal, ModalBody, ModalFooter, CardBody, ModalHeader } from 'reactstrap';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import * as CTReportActions from '../actions';

const mapStateToProps = state => {
  return {
    contact_list: state.request_for_quotation.contact_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
    ctReportActions: bindActionCreators(CTReportActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);

const DeleteModal = props => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);

  const deleteById = current_report_id => {
    props.ctReportActions
      .deleteReportById(current_report_id)
      .then(res => {
        if (res.status === 200) {
          props.commonActions.tostifyAlert('success', 'Report Deleted Successfully!');
          console.log(res.data);
          props.closeModal(false);
        }
      })
      .catch(err => {
        props.commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'Report Deleted Unsuccessfully'
        );
        props.closeModal(false);
      });
  };

  strings.setLanguage(language);
  const { openModal, closeModal, current_report_id } = props;

  const message1 = (
    <text>
      <b>Delete CT Report File ?</b>
    </text>
  );
  const message = 'This CT report file will be deleted permanently and cannot be recovered. ';

  return (
    <div className="contact-modal-screen">
      <Modal
        isOpen={openModal}
        className="modal-success contact-modal"
        style={{ width: 'fit-content' }}
      >
        <ModalHeader>
          <Row>
            <Col lg={12}>
              <div className="h4 mb-0 d-flex align-items-center">
                <span className="ml-2">{message1}</span>
              </div>
            </Col>
          </Row>
        </ModalHeader>
        <ModalBody style={{ padding: '15px 0px 0px 0px' }}>
          <div style={{ padding: ' 0px 1px' }}>
            <div>
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
              deleteById(current_report_id);
            }}
          >
            <i className="fas fa-check-double mr-1"></i> Yes
          </Button>
          <Button
            color="secondary"
            className="btn-square pull-right"
            onClick={() => {
              closeModal(false);
            }}
          >
            <i className="fa fa-ban mr-1"></i> No
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModal);
