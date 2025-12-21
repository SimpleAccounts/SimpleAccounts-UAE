import React, { useState, useEffect } from 'react';
import {
  Button,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  CardHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import dayjs from '@/utils/date';
import { IdCard, CircleDot, Ban } from 'lucide-react';

// Zod validation schema
const employeeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  email: z.string().optional(),
  dob: z.date().optional(),
});

const regExAlpha = /^[a-zA-Z ]+$/;

const EmployeeModal = ({
  openEmployeeModal,
  closeEmployeeModal,
  createEmployee,
  getCurrentUser,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      dob: new Date(),
    },
    mode: 'onChange',
  });

  const displayMsg = err => {
    toast.error(`${err.data}`, {
      position: 'top-right',
    });
  };

  const onSubmit = data => {
    const { firstName, lastName, middleName, email, dob } = data;

    let formData = new FormData();
    formData.append('firstName', firstName ? firstName : '');
    formData.append('lastName', lastName ? lastName : '');
    formData.append('middleName', middleName ? middleName : '');
    formData.append('email', email ? email : '');
    formData.append('dob', dob ? dob : '');

    createEmployee(formData)
      .then(res => {
        if (res.status === 200) {
          reset();
          closeEmployeeModal(true);
          getCurrentUser(res.formData);
        }
      })
      .catch(err => {
        displayMsg(err);
      });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openEmployeeModal} className="modal-success contact-modal">
        <Form name="simpleForm" onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <IdCard className="h-4 w-4" />
                  <span className="ml-2">Create Employee</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <ModalBody>
            <h4 className="mb-3 mt-3">Employee Details</h4>
            <Row className="row-wrapper">
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="firstName">
                    <span className="text-danger">* </span>First Name
                  </Label>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        maxLength="26"
                        id="firstName"
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        value={value}
                        className={errors.firstName ? 'is-invalid' : ''}
                        placeholder="Enter First Name"
                      />
                    )}
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Controller
                    name="middleName"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        maxLength="26"
                        id="middleName"
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        value={value}
                        className={errors.middleName ? 'is-invalid' : ''}
                        placeholder="Enter Middle Name"
                      />
                    )}
                  />
                  {errors.middleName && (
                    <div className="invalid-feedback">{errors.middleName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="text"
                        maxLength="26"
                        id="lastName"
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            onChange(e.target.value);
                          }
                        }}
                        value={value}
                        className={errors.lastName ? 'is-invalid' : ''}
                        placeholder="Enter Last Name"
                      />
                    )}
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName.message}</div>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row className="row-wrapper">
              <Col md="4">
                <FormGroup>
                  <Label htmlFor="email">
                    <span className="text-danger">* </span>Email
                  </Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="email"
                        maxLength="80"
                        id="email"
                        onChange={e => onChange(e.target.value)}
                        value={value}
                        className={errors.email ? 'is-invalid' : ''}
                        placeholder="Enter Email"
                      />
                    )}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </FormGroup>
              </Col>

              <Col md="4">
                <FormGroup className="mb-3">
                  <Label htmlFor="date">
                    <span className="text-danger">* </span>Date Of Birth
                  </Label>
                  <Controller
                    name="dob"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        id="dob"
                        showMonthDropdown
                        showYearDropdown
                        dateFormat="dd-MM-yyyy"
                        dropdownMode="select"
                        placeholderText="Enter Date of Birth"
                        maxDate={new Date()}
                        selected={value}
                        onChange={onChange}
                        className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                      />
                    )}
                  />
                  {errors.dob && <div className="invalid-feedback">{errors.dob.message}</div>}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              color="primary"
              className="btn-square mr-3"
              disabled={isSubmitting}
            >
              <CircleDot className="h-4 w-4" /> Create
            </Button>
            &nbsp;
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closeEmployeeModal(false);
              }}
            >
              <Ban className="h-4 w-4" /> Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeModal;
