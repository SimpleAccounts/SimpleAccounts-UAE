import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
} from 'components/migration';
import * as CustomerInvoiceActions from '../../customer_invoice/actions';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import '../../product/screens/create/style.scss';
import { toast } from 'sonner';
import { IdCard, CircleDot, Ban } from 'lucide-react';

// Validation schema
const invoiceNumberSchema = z.object({
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  type: z.string().optional(),
  id: z.string().optional(),
});

const InvoiceNumberModel = ({
  openInvoiceNumberModel,
  closeInvoiceNumberModel,
  prefix,
  updatePrefix,
  getCurrentNumber,
}) => {
  const [disabled, setDisabled] = useState(false);
  const regEx = /^[0-9]+$/;
  const regExAlpha = /^[a-zA-Z0-9 -/"]+$/;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceNumberSchema),
    defaultValues: {
      prefix: '',
      suffix: '',
      type: '',
      id: '',
    },
  });

  useEffect(() => {
    if (prefix) {
      setValue('id', prefix.invoiceId || '');
      setValue('prefix', prefix.invoicePrefix || '');
      setValue('suffix', prefix.invoiceSuffix || '');
      setValue('type', prefix.invoiceType || '');
    }
  }, [prefix, setValue]);

  const getData = data => {
    let temp = {};
    for (let item in data) {
      if (typeof data[`${item}`] !== 'object') {
        temp[`${item}`] = data[`${item}`];
      } else {
        temp[`${item}`] = data[`${item}`].value;
      }
    }
    return temp;
  };

  const onSubmit = data => {
    setDisabled(true);
    const postData = getData(data);
    updatePrefix(postData)
      .then(res => {
        if (res.status === 200) {
          reset();
          closeInvoiceNumberModel(true);
          getCurrentNumber(res.data);
        }
      })
      .catch(err => {
        displayMsg(err);
        setDisabled(false);
      });
  };

  const displayMsg = err => {
    toast.error(`${err.data}`, {
      position: 'top-right',
    });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openInvoiceNumberModel} className="modal-success contact-modal">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <Row>
              <Col lg={8}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <IdCard className="h-4 w-4" />
                  <span className="ml-2">Invoice Number</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <ModalBody>
            <Row>
              <Col lg={8}>
                <FormGroup check inline className="mb-3">
                  <Label className="productlabel mb-0 mr-1">
                    Your Invoice Numbers are set on auto-generate mode to save your time.
                  </Label>
                  <Label className="productlabel mb-0 mr-1">
                    Are you sure about changing this settings?
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col lg={2}>
                <Label>Continue auto generated invoice Number</Label>
              </Col>
              <Col lg={2}>
                <FormGroup className="mb-3">
                  <Label htmlFor="prefix">Prefix</Label>
                  <Controller
                    name="prefix"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        maxLength="70"
                        id="invoicePrefix"
                        onChange={e => {
                          if (e.target.value === '' || regExAlpha.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.prefix ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.prefix && <div className="invalid-feedback">{errors.prefix.message}</div>}
                </FormGroup>
              </Col>

              <Col lg={2}>
                <FormGroup className="mb-3">
                  <Label htmlFor="suffix">Next Number</Label>
                  <Controller
                    name="suffix"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        maxLength="70"
                        id="invoiceSuffix"
                        onChange={e => {
                          if (e.target.value === '' || regEx.test(e.target.value)) {
                            field.onChange(e);
                          }
                        }}
                        className={errors.suffix ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.suffix && <div className="invalid-feedback">{errors.suffix.message}</div>}
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" color="primary" className="btn-square mr-3" disabled={disabled}>
              <CircleDot className="h-4 w-4" /> Update
            </Button>
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closeInvoiceNumberModel(false);
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

const mapDispatchToProps = dispatch => {
  return {
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(InvoiceNumberModel);
