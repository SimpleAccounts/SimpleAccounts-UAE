import React from 'react';
import { connect } from 'react-redux';
import { Card, CardBody, CardHeader, Col, Form, FormGroup, Label, Row } from 'components/migration';

import { Switch } from '@/components/ui/switch';

import { Loader } from 'components';

import './style.scss';
import { Bell } from 'lucide-react';

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
      emailNotifications: true,
      reminderNotifications: true,
    };
  }

  render() {
    const { loading, emailNotifications, reminderNotifications } = this.state;
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
                <Bell className="h-4 w-4" />
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
                              <Label htmlFor="email-notifications" style={{ marginTop: 3 }}>
                                Email Notifications
                              </Label>
                            </Col>
                            <Col xs="12" md="8">
                              <Switch
                                id="email-notifications"
                                checked={emailNotifications}
                                onCheckedChange={checked =>
                                  this.setState({ emailNotifications: checked })
                                }
                                className="scale-125"
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col>
                          <FormGroup row>
                            <Col md="5">
                              <Label htmlFor="reminder-notifications" style={{ marginTop: 3 }}>
                                Reminder Notifications
                              </Label>
                            </Col>
                            <Col xs="12" md="7">
                              <Switch
                                id="reminder-notifications"
                                checked={reminderNotifications}
                                onCheckedChange={checked =>
                                  this.setState({ reminderNotifications: checked })
                                }
                                className="scale-125"
                              />
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
