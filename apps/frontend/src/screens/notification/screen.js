import React from 'react';
import { connect } from 'react-redux';
import { Card, CardBody, CardHeader, Col, Form, FormGroup, Label, Row } from 'reactstrap';

import { CFormSwitch } from '@coreui/react';

import { Loader } from 'components';

import './style.scss';

const mapStateToProps = state => {
  return {};
};
const mapDispatchToProps = dispatch => {
  return {};
};

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  render() {
    const { loading } = this.state;
    const containerStyle = {
      zIndex: 1999,
      closeOnClick: true,
      draggable: true,
    };

    return (
      <div className="notification-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon fas fa-bell" />
                <span className="ml-2">Notifications</span>
              </div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Loader></Loader>
              ) : (
                <Row>
                  <Col lg="10" className="mx-auto">
                    <Form name="simpleForm" className="mt-3">
                      <Row>
                        <Col>
                          <FormGroup row>
                            <Col md="4">
                              <Label htmlFor="name" style={{ marginTop: 3 }}>
                                Email Notifications
                              </Label>
                            </Col>
                            <Col xs="12" md="8">
                              <CFormSwitch
                                className="mx-1"
                                style={{ width: 65 }}
                                size="lg"
                                defaultChecked
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col>
                          <FormGroup row>
                            <Col md="5">
                              <Label htmlFor="name" style={{ marginTop: 3 }}>
                                Reminder Notifications
                              </Label>
                            </Col>
                            <Col xs="12" md="7">
                              <CFormSwitch className="mx-1" size="lg" defaultChecked />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
