import React from 'react'
import {connect} from 'react-redux'
// import { bindActionCreators } from 'redux'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  Table
} from 'reactstrap'
import { ToastContainer } from 'react-toastify'
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

class DataBackup extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  render() {
    const { loading } = this.state;
    const containerStyle = {
      zIndex: 1999
    };

    return (
      <div className="data-backup-screen">
        <div className="animated fadeIn">
          <ToastContainer
            position="top-right"
            autoClose={1700}
            style={containerStyle}
            closeOnClick
            draggable
          />

          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon fas fa-hdd-o" />
                <span className="ml-2">Data Backup</span>
              </div>
            </CardHeader>
            <CardBody>
            {
              loading ?
                <Loader></Loader>: 
                <Row>
                  <Col lg='12' className="mx-auto">
                    <p>Backup entire data and download emails</p>
                    <Button color='danger' className="btn-square">Backup Your Data</Button>
                    <div className="mt-5">
                      <h4>Backup History</h4>
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>
                              Backup Time
                            </th>
                            <th>
                              User Name
                            </th>
                            <th>
                              File Type
                            </th>
                            <th>
                              Export Status
                            </th>
                            <th>
                              Download
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>10/31/2019</td>
                            <td>admin</td>
                            <td>CSV</td>
                            <td>Completed</td>
                            <td><button className="btn"><i className="cui-cloud-download icons mr-2" />Download</button></td>
                          </tr>
                          <tr>
                            <td>10/01/2019</td>
                            <td>admin</td>
                            <td>CSV</td>
                            <td>Completed</td>
                            <td><button className="btn"><i className="cui-cloud-download icons mr-2" />Download</button></td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DataBackup)
