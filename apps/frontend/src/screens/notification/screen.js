  import React from 'react'
import {connect} from 'react-redux'
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Form,     
  FormGroup,
  Label
} from 'reactstrap'
import { ToastContainer } from 'react-toastify'
import { AppSwitch } from '@coreui/react'

import { Loader } from 'components'

import 'react-toastify/dist/ReactToastify.css'

import './style.scss'

const mapStateToProps = (state) => {
  return ({
    
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    
  })
}

class Notification extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  render() {
    const { loading } = this.state;
    const containerStyle = {
      zIndex: 1999,closeOnClick: true,
      draggable: true
      
    };

    return (
      <div className="notification-screen">
        <div className="animated fadeIn">
          <ToastContainer
          	closeOnClick
            draggable
            position="top-right"
            autoClose={1700}
            style={containerStyle}
          />

          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon fas fa-bell" />
                <span className="ml-2">Notifications</span>
              </div>
            </CardHeader>
            <CardBody>
            {
              loading ?
                <Loader></Loader>: 
                <Row>
                  <Col lg='10' className="mx-auto">
                    <Form name="simpleForm" className="mt-3">
                      <Row>
                        <Col>
                          <FormGroup row>
                            <Col md="4">
                              <Label htmlFor="name" style={{marginTop: 3}}>Email Notifications</Label>
                            </Col>
                            <Col xs="12" md="8">
                              <AppSwitch className={'mx-1'} 
                                style={{width: 65}}
                                variant={'3d'} 
                                outline={'alt'} 
                                color={'primary'}
                                size="lg"
                                defaultChecked 
                                label />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col>
                        <FormGroup row>
                            <Col md="5">
                              <Label htmlFor="name" style={{marginTop: 3}}>Reminder Notifications</Label>
                            </Col>
                            <Col xs="12" md="7">
                              <AppSwitch className={'mx-1'} 
                                variant={'3d'} 
                                outline={'alt'} 
                                color={'primary'}
                                size="lg"
                                defaultChecked 
                                label  />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </Row>
            }
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification)
