import React from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Modal, ModalBody, ModalFooter, CardBody, ModalHeader } from 'reactstrap';
import { bindActionCreators } from 'redux';
import { CommonActions } from 'services/global';
import * as PayrollEmployeeActions from '../../../../payrollemp/actions';
import * as VatReportActions from '../actions';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import { CheckCheck, Ban } from 'lucide-react';

const mapStateToProps = state => {
  return {
    contact_list: state.request_for_quotation.contact_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    payrollEmployeeActions: bindActionCreators(PayrollEmployeeActions, dispatch),
    vatReportActions: bindActionCreators(VatReportActions, dispatch),
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
    return null;
  }

  deleteById = current_report_id => {
    this.props.vatReportActions
      .deleteReportById(current_report_id)
      .then(res => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert(
            'success',
            res.data && res.data.message ? res.data.message : 'VAT Report File Deleted Successfully'
          );
          this.props.closeModal(false);
        }
      })
      .catch(err => {
        this.props.commonActions.tostifyAlert(
          'error',
          err.data ? err.data.message : 'VAT Report File Deleted Unsuccessfully'
        );
        this.props.closeModal(false);
      });
  };

  render() {
    strings.setLanguage(this.state.language);
    const { openModal, closeModal, current_report_id } = this.props;
    const { loading } = this.state;

    const message1 = (
      <text>
        <b>Delete VAT Report File ?</b>
      </text>
    );
    const message = 'This vat report file will be deleted permanently and cannot be recovered. ';

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
                this.deleteById(current_report_id);
              }}
            >
              <CheckCheck className="h-4 w-4" /> Yes
            </Button>
            <Button
              color="secondary"
              className="btn-square  pull-right"
              onClick={() => {
                closeModal(false);
              }}
            >
              <Ban className="h-4 w-4" /> No
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModal);
