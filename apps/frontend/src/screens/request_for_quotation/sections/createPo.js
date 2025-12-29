import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
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
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
} from 'components/migration';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import dayjs from '@/utils/date';
import { CommonActions } from 'services/global';
import { toast } from 'sonner';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import 'react-datepicker/dist/react-datepicker.css';

const strings = new LocalizedStrings(data);

// Custom styles for react-select
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

// Zod validation schema
const lineItemSchema = z.object({
  id: z.any(),
  productId: z.any(),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be greater than 0'),
  vatCategoryId: z.any().optional(),
  subTotal: z.number().optional(),
});

const createPoSchema = z.object({
  poApproveDate: z.date({
    required_error: 'Order Date is required',
  }),
  poReceiveDate: z.date({
    required_error: 'Receive Date is required',
  }),
  supplierReferenceNumber: z.string().optional(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).optional(),
});

const CreatePurchaseOrder = ({
  openPurchaseOrder,
  closePurchaseOrder,
  updateParentAmount,
  id,
  selectedData,
  prefixData,
  createPO,
  totalAmount,
  getNextTemplateNo,
  totalVatAmount,
}) => {
  const dispatch = useDispatch();
  const commonActions = bindActionCreators(CommonActions, dispatch);

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [language] = useState(window.localStorage.getItem('language'));

  // Get line items from selectedData
  const lineItems = useMemo(() => {
    if (selectedData?.poQuatationLineItemRequestModelList) {
      return selectedData.poQuatationLineItemRequestModelList.map((item, index) => ({
        id: item.id || index,
        productId: item.productId || '',
        description: item.description || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        vatCategoryId: item.vatCategoryId || '',
        subTotal: Number(item.subTotal) || 0,
      }));
    }
    return [];
  }, [selectedData]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPoSchema),
    defaultValues: {
      poApproveDate: new Date(),
      poReceiveDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      supplierReferenceNumber: '',
      notes: '',
      lineItems: lineItems,
    },
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (openPurchaseOrder && selectedData) {
      reset({
        poApproveDate: new Date(),
        poReceiveDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        supplierReferenceNumber: '',
        notes: '',
        lineItems: lineItems,
      });
    }
  }, [openPurchaseOrder, selectedData, lineItems, reset]);

  // Set language
  useEffect(() => {
    strings.setLanguage(language || 'en');
  }, [language]);

  const onSubmit = useCallback(
    async formData => {
      if (!prefixData) {
        toast.error('PO Number prefix is required');
        return;
      }

      setDisabled(true);
      setLoading(true);

      try {
        const submitData = new FormData();
        submitData.append('rfqId', selectedData?.id || '');
        submitData.append('poNumber', prefixData);
        submitData.append(
          'poApproveDate',
          formData.poApproveDate ? dayjs(formData.poApproveDate).format('DD/MM/YYYY') : ''
        );
        submitData.append(
          'poReceiveDate',
          formData.poReceiveDate ? dayjs(formData.poReceiveDate).format('DD/MM/YYYY') : ''
        );
        submitData.append('notes', formData.notes || '');
        submitData.append('type', 4);
        submitData.append(
          'lineItemsString',
          JSON.stringify(selectedData?.poQuatationLineItemRequestModelList || [])
        );
        submitData.append('totalAmount', totalAmount || 0);
        submitData.append('totalVatAmount', totalVatAmount || 0);
        submitData.append('supplierId', selectedData?.supplierId || '');
        submitData.append('supplierReferenceNumber', formData.supplierReferenceNumber || '');

        const response = await createPO(submitData);

        if (response.status === 200) {
          toast.success('Purchase Order created successfully');
          closePurchaseOrder();
          reset();
        } else {
          toast.error(response.data?.message || 'Failed to create Purchase Order');
        }
      } catch (error) {
        console.error('Error creating PO:', error);
        toast.error('An error occurred while creating the Purchase Order');
      } finally {
        setDisabled(false);
        setLoading(false);
      }
    },
    [prefixData, selectedData, totalAmount, totalVatAmount, createPO, closePurchaseOrder, reset]
  );

  const handleClose = () => {
    reset();
    closePurchaseOrder();
  };

  return (
    <Modal isOpen={openPurchaseOrder} className="modal-xl" backdrop="static">
      <ModalHeader toggle={handleClose}>
        {strings.CreatePurchaseOrder || 'Create Purchase Order'}
      </ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {loading && (
            <div className="text-center p-3">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}

          <Row>
            <Col lg={3}>
              <FormGroup>
                <Label>{strings.PONumber || 'PO Number'}</Label>
                <Input type="text" value={prefixData || ''} disabled />
              </FormGroup>
            </Col>
            <Col lg={3}>
              <FormGroup>
                <Label>{strings.Supplier || 'Supplier'}</Label>
                <Input
                  type="text"
                  value={selectedData?.supplierName || selectedData?.contactName || ''}
                  disabled
                />
              </FormGroup>
            </Col>
            <Col lg={3}>
              <FormGroup>
                <Label>{strings.OrderDate || 'Order Date'} *</Label>
                <Controller
                  name="poApproveDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      className={`form-control ${errors.poApproveDate ? 'is-invalid' : ''}`}
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                    />
                  )}
                />
                {errors.poApproveDate && (
                  <div className="invalid-feedback d-block">{errors.poApproveDate.message}</div>
                )}
              </FormGroup>
            </Col>
            <Col lg={3}>
              <FormGroup>
                <Label>{strings.ReceiveDate || 'Receive Date'} *</Label>
                <Controller
                  name="poReceiveDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      className={`form-control ${errors.poReceiveDate ? 'is-invalid' : ''}`}
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                    />
                  )}
                />
                {errors.poReceiveDate && (
                  <div className="invalid-feedback d-block">{errors.poReceiveDate.message}</div>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <FormGroup>
                <Label>{strings.SupplierReference || 'Supplier Reference Number'}</Label>
                <Controller
                  name="supplierReferenceNumber"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" placeholder="Enter supplier reference" {...field} />
                  )}
                />
              </FormGroup>
            </Col>
          </Row>

          {/* Line Items Table */}
          <Row className="mt-3">
            <Col lg={12}>
              <h5>{strings.LineItems || 'Line Items'}</h5>
              <div className="table-responsive">
                <Table bordered hover>
                  <thead className="thead-light">
                    <tr>
                      <th style={{ width: '5%' }}>#</th>
                      <th style={{ width: '35%' }}>{strings.Description || 'Description'}</th>
                      <th style={{ width: '15%' }}>{strings.Quantity || 'Quantity'}</th>
                      <th style={{ width: '15%' }}>{strings.UnitPrice || 'Unit Price'}</th>
                      <th style={{ width: '15%' }}>{strings.VAT || 'VAT'}</th>
                      <th style={{ width: '15%' }}>{strings.SubTotal || 'Sub Total'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length > 0 ? (
                      lineItems.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{index + 1}</td>
                          <td>{item.description || '-'}</td>
                          <td>{item.quantity}</td>
                          <td>{Number(item.unitPrice).toFixed(2)}</td>
                          <td>{item.vatPercentage ? `${item.vatPercentage}%` : '-'}</td>
                          <td>{Number(item.subTotal).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No line items available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

          {/* Totals */}
          <Row className="mt-3">
            <Col lg={8}></Col>
            <Col lg={4}>
              <Table bordered>
                <tbody>
                  <tr>
                    <td>
                      <strong>{strings.SubTotal || 'Sub Total'}</strong>
                    </td>
                    <td className="text-right">
                      {Number(totalAmount - totalVatAmount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{strings.TotalVAT || 'Total VAT'}</strong>
                    </td>
                    <td className="text-right">{Number(totalVatAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{strings.TotalAmount || 'Total Amount'}</strong>
                    </td>
                    <td className="text-right">{Number(totalAmount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* Notes */}
          <Row className="mt-3">
            <Col lg={12}>
              <FormGroup>
                <Label>{strings.Notes || 'Notes'}</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input type="textarea" rows={3} placeholder="Enter notes..." {...field} />
                  )}
                />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit" disabled={disabled || loading}>
            {loading ? 'Creating...' : strings.Create || 'Create'}
          </Button>
          <Button color="secondary" onClick={handleClose} disabled={loading}>
            {strings.Cancel || 'Cancel'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CreatePurchaseOrder;
