import { useState, useEffect } from 'react';
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
import { IdCard, CircleDot, Ban } from '@/components/icons';

const customStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    boxShadow: state.isFocused ? null : null,
    '&:hover': {
      borderColor: state.isFocused ? '#1e6eff' : '#c7c7c7',
    },
  }),
};

const mapDispatchToProps = dispatch => {
  return {
    customerInvoiceActions: bindActionCreators(CustomerInvoiceActions, dispatch),
  };
};

// Zod validation schema
const invoiceNumberSchema = z.object({
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  type: z.string().optional(),
  id: z.string().optional(),
});

const InvoiceNumberModel = props => {
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const regEx = /^[0-9]+$/;
  const regExBoth = /[a-zA-Z0-9 ]+$/;
  const regExAlpha = /^[a-zA-Z0-9 -/"]+$/;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(invoiceNumberSchema),
    defaultValues: {
      prefix: '',
      suffix: '',
      type: '',
      id: '',
      disabled: false,
    },
  });

  useEffect(() => {
    if (props.prefix) {
      setValue('id', props.prefix.invoiceId);
      setValue('prefix', props.prefix.invoicePrefix);
      setValue('suffix', props.prefix.invoiceSuffix);
      setValue('type', props.prefix.invoiceType);
    }
  }, [props.prefix, setValue]);

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

  const onSubmit = formData => {
    setDisabled(true);
    const postData = getData(formData);
    props
      .updatePrefix(postData)
      .then(res => {
        if (res.status === 200) {
          reset();
          props.closeInvoiceNumberModel(true);
          props.getCurrentNumber(res.data);
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

  const { openInvoiceNumberModel, closeInvoiceNumberModel, prefix } = props;

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
                    Are you sure about changing this settings?{' '}
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
                  <Label htmlFor="productName">Prefix</Label>
                  <Controller
                    name="prefix"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        maxLength="70"
                        id="invoicePrefix"
                        onChange={option => {
                          if (option.target.value === '' || regExAlpha.test(option.target.value)) {
                            field.onChange(option);
                          }
                        }}
                        className={errors.prefix ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.invoicePrefix && (
                    <div className="invalid-feedback">{errors.invoicePrefix.message}</div>
                  )}
                </FormGroup>
              </Col>

              <Col lg={2}>
                <FormGroup className="mb-3">
                  <Label htmlFor="productName">Next Number</Label>
                  <Controller
                    name="suffix"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        maxLength="70"
                        id="invoiceSuffix"
                        onChange={option => {
                          if (option.target.value === '' || regEx.test(option.target.value)) {
                            field.onChange(option);
                          }
                        }}
                        className={errors.suffix ? 'is-invalid' : ''}
                      />
                    )}
                  />
                  {errors.invoiceSuffix && (
                    <div className="invalid-feedback">{errors.invoiceSuffix.message}</div>
                  )}
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

export default connect(null, mapDispatchToProps)(InvoiceNumberModel);
