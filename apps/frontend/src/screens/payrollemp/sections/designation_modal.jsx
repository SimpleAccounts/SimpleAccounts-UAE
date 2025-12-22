import React, { useState } from 'react';
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
  UncontrolledTooltip,
} from 'components/migration';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import { selectOptionsFactory } from 'utils';
import { toast } from 'sonner';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import { Ban, CircleDot, HelpCircle, IdCard } from 'lucide-react';

let strings = new LocalizedStrings(data);

const DesignationModal = ({
  openDesignationModal,
  closeDesignationModal,
  createDesignation,
  getCurrentUser,
  nameDesigExist,
  idDesigExist,
  validateinfo,
  validateid,
  designationType_list,
}) => {
  const [language] = useState(window['localStorage'].getItem('language'));
  const [disabled, setDisabled] = useState(false);

  const regEx = /^[0-9]+$/;
  const regExAlpha = /^[a-zA-Z ]+$/;

  strings.setLanguage(language);

  // Zod schema
  const schema = z.object({
    designationName: z
      .string()
      .min(1, strings.DesignationName + ' is required')
      .refine(() => !nameDesigExist, {
        message: 'Designation Name already exist',
      }),
    designationType: z.object(
      {
        label: z.string(),
        value: z.any(),
      },
      { required_error: strings.DesignationTypeIsRequired }
    ),
    designationId: z
      .string()
      .min(1, 'Designation ID is required')
      .refine(val => parseInt(val) !== 0, {
        message: 'Enter valid designation ID',
      })
      .refine(() => !idDesigExist, {
        message: 'Designation ID already exist',
      })
      .refine(
        val => {
          const id = parseInt(val);
          return id !== 1 && id !== 2 && id !== 3 && id !== 4;
        },
        {
          message: 'Designation ID already exist',
        }
      ),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      designationName: '',
      designationId: '',
      designationType: '',
    },
  });

  const onSubmit = data => {
    setDisabled(true);
    const { designationName, designationId, designationType } = data;
    const formData = new FormData();

    formData.append('designationId', designationId != null ? designationId : '');
    formData.append('designationName', designationName != null ? designationName : '');
    formData.append(
      'parentId',
      designationType ? (designationType.value ? designationType.value : designationType) : ''
    );

    createDesignation(formData)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          reset();
          closeDesignationModal(true);
          getCurrentUser(res.data);
          toast.success('Designation Created Successfully');
        }
      })
      .catch(err => {
        setDisabled(false);
        toast.error(`${err.data}`, {
          position: 'top-right',
        });
      });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openDesignationModal} className="modal-success designation-model">
        <Form name="simpleForm" onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <IdCard className="h-4 w-4" />
                  <span className="ml-2"> {strings.CreateDesignation} </span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <ModalBody>
            <Row className="row-wrapper">
              <Col lg={5}>
                <FormGroup>
                  <Label htmlFor="designationId">
                    <span className="text-danger">* </span>
                    {strings.DESIGNATIONID}
                  </Label>
                  <Controller
                    name="designationId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="designationId"
                        maxLength="9"
                        placeholder={strings.Enter + strings.DESIGNATIONID}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || regEx.test(value)) {
                            field.onChange(value);
                            validateid(value);
                          }
                        }}
                        className={errors.designationId ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.designationId && (
                    <div className="invalid-feedback">{errors.designationId.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={5}>
                <FormGroup>
                  <Label htmlFor="designationName">
                    <span className="text-danger">* </span>
                    {strings.DesignationName}
                  </Label>
                  <Controller
                    name="designationName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="designationName"
                        placeholder={strings.Enter + strings.DesignationName}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '' || regExAlpha.test(value)) {
                            field.onChange(value);
                            validateinfo(value);
                          }
                        }}
                        className={errors.designationName ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.designationName && (
                    <div className="invalid-feedback">{errors.designationName.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={5}>
                <FormGroup className="mb-3">
                  <Label htmlFor="designationType">
                    <span className="text-danger">* </span>
                    {strings.DesignationType}
                    <HelpCircle id="designationTypeTooltip" className="h-4 w-4 inline" />
                    <UncontrolledTooltip placement="right" target="designationTypeTooltip">
                      Based on the designation type selected, the chart of accounts will be created
                      for the employee. This field will be locked once the designation has been
                      assigned to an employee.
                    </UncontrolledTooltip>
                  </Label>
                  <Controller
                    name="designationType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={
                          designationType_list
                            ? selectOptionsFactory.renderOptions(
                                'label',
                                'value',
                                designationType_list,
                                strings.DesignationType
                              )
                            : []
                        }
                        value={
                          field.value?.value
                            ? field.value
                            : designationType_list &&
                              selectOptionsFactory
                                .renderOptions(
                                  'label',
                                  'value',
                                  designationType_list,
                                  strings.DesignationType
                                )
                                .find(obj => obj.value === field.value)
                        }
                        onChange={option => {
                          field.onChange(option || '');
                        }}
                        placeholder={strings.Select + strings.DesignationType}
                        id="designationType"
                        className={errors.designationType ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.designationType && (
                    <div className="invalid-feedback">{errors.designationType.message}</div>
                  )}
                </FormGroup>
              </Col>
              <Col lg={12}>
                <p>
                  <strong>Note:</strong> If the designation is assigned to an employee, it cannot be
                  deleted.
                </p>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" color="primary" className="btn-square mr-3" disabled={disabled}>
              <CircleDot className="h-4 w-4" /> {disabled ? 'Creating...' : strings.Create}
            </Button>
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closeDesignationModal(false);
              }}
            >
              <Ban className="h-4 w-4" /> {strings.Cancel}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default DesignationModal;
