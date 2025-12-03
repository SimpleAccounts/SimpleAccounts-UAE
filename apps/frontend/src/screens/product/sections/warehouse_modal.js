import React from 'react'
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalHeader, 
  ModalBody,
  ModalFooter,
} from 'reactstrap'


import { Formik } from 'formik';
import * as Yup from "yup";

import * as ProductActions from '../actions'


class WareHouseModal extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      loading: false,

      initWareHouseValue: {
        warehouseName: '',
      },
    }
  }

  // Create or Contact
  wareHouseHandleSubmit = (data) => {
    ProductActions.createWarehouse(data).then((res) => {
      if (res.status === 200) {
      // this.success()
        this.props.closeWarehouseModal()
      }
    })
  }

  render() {
    const { openModal, closeWarehouseModal } = this.props

    return (
      <div className="warehouse-modal-screen">
        <Modal isOpen={openModal}
          className="modal-success"
          >
          <Formik
            initialValues={this.state.initWareHouseValue}
            onSubmit={(values, {resetForm}) => {
              this.wareHouseHandleSubmit(values)
              resetForm(this.state.initWareHouseValue)
            }}
            validationSchema={Yup.object().shape({
                warehouseName: Yup.string()
                    .required('Warehouse Name is a required field'),
            })}>
            {(props) => (
              <Form name="simpleForm" onSubmit={props.handleSubmit}>
                <ModalHeader toggle={this.toggleDanger}>New Warehouse</ModalHeader>
                  <ModalBody>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label htmlFor="warehouseName"><span className="text-danger">* </span>Warehouse Name</Label>
                            <Input
                              type="text"
                              id="warehouseName"
                              name="warehouseName"
                              onChange={props.handleChange}
                              placeholder="Enter warehouseName "
                              value={props.values.warehouseName }
                              className={
                                props.errors.warehouseName  && props.touched.warehouseName 
                                ? "is-invalid"
                                : ""
                              }
                            />
                          {props.errors.warehouseName  && props.touched.warehouseName  && (
                            <div className="invalid-feedback">{props.errors.warehouseName }</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>

                  </ModalBody>
                  <ModalFooter>
                    <Button color="success" type="submit" className="btn-square">Save</Button>&nbsp;
                    <Button color="secondary" className="btn-square" onClick={closeWarehouseModal}>Cancel</Button>
                  </ModalFooter>
              </Form>
              )}
            </Formik>
          </Modal>
        </div>
    )
  }
}

export default WareHouseModal