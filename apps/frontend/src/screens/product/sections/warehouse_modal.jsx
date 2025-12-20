import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from 'reactstrap';
import * as ProductActions from '../actions';

// Zod validation schema
const warehouseSchema = z.object({
  warehouseName: z.string().min(1, 'Warehouse Name is a required field'),
});

const WareHouseModal = ({ openModal, closeWarehouseModal }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      warehouseName: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
  } = form;

  const wareHouseHandleSubmit = data => {
    setLoading(true);
    ProductActions.createWarehouse(data)
      .then(res => {
        setLoading(false);
        if (res.status === 200) {
          reset({
            warehouseName: '',
          });
          closeWarehouseModal();
        }
      })
      .catch(err => {
        setLoading(false);
      });
  };

  return (
    <div className="warehouse-modal-screen">
      <Modal isOpen={openModal} className="modal-success">
        <Form name="simpleForm" onSubmit={handleSubmit(wareHouseHandleSubmit)}>
          <ModalHeader toggle={closeWarehouseModal}>New Warehouse</ModalHeader>
          <ModalBody>
            <Row>
              <Col>
                <FormGroup>
                  <Label htmlFor="warehouseName">
                    <span className="text-danger">* </span>Warehouse Name
                  </Label>
                  <Controller
                    name="warehouseName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="warehouseName"
                        placeholder="Enter warehouseName"
                        className={
                          errors.warehouseName && touchedFields.warehouseName ? 'is-invalid' : ''
                        }
                      />
                    )}
                  />
                  {errors.warehouseName && touchedFields.warehouseName && (
                    <div className="invalid-feedback">{errors.warehouseName.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="success" type="submit" className="btn-square" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            &nbsp;
            <Button color="secondary" className="btn-square" onClick={closeWarehouseModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default WareHouseModal;
