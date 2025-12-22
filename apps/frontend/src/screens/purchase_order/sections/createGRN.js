import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

// Zod validation schema
const createGRNSchema = z.object({
  grnReceiveDate: z.date({
    required_error: 'GRN Receive Date is required',
  }),
  notes: z.string().optional(),
});

const CreateGoodsReceivedNote = ({
  openGRNModal,
  closeGRNModal,
  selectedData,
  prefixData,
  createGRN,
  totalAmount,
  getNextGrnNo,
  totalVatAmount,
  closeGoodsReceivedNotes,
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
        vatPercentage: item.vatPercentage || 0,
        subTotal: Number(item.subTotal) || 0,
        grnReceivedQuantity: Number(item.grnReceivedQuantity) || 0,
      }));
    }
    return [];
  }, [selectedData]);

  // Calculate totals
  const calculatedTotals = useMemo(() => {
    let totalNet = 0;
    let vatTotal = 0;

    lineItems.forEach(item => {
      totalNet += item.subTotal || 0;
    });

    return {
      subTotal: totalNet - (totalVatAmount || 0),
      vatAmount: totalVatAmount || 0,
      total: totalAmount || totalNet,
    };
  }, [lineItems, totalAmount, totalVatAmount]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGRNSchema),
    defaultValues: {
      grnReceiveDate: new Date(),
      notes: '',
    },
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (openGRNModal && selectedData) {
      reset({
        grnReceiveDate: new Date(),
        notes: '',
      });
    }
  }, [openGRNModal, selectedData, reset]);

  // Set language
  useEffect(() => {
    strings.setLanguage(language || 'en');
  }, [language]);

  const onSubmit = useCallback(
    async formData => {
      if (!prefixData) {
        toast.error('GRN Number prefix is required');
        return;
      }

      setDisabled(true);
      setLoading(true);

      try {
        const submitData = new FormData();
        submitData.append('poId', selectedData?.id || '');
        submitData.append('grnNumber', prefixData);
        submitData.append(
          'grnReceiveDate',
          formData.grnReceiveDate ? dayjs(formData.grnReceiveDate).format('DD/MM/YYYY') : ''
        );
        submitData.append('notes', formData.notes || '');
        submitData.append('type', 5);
        submitData.append(
          'lineItemsString',
          JSON.stringify(selectedData?.poQuatationLineItemRequestModelList || [])
        );
        submitData.append('totalAmount', totalAmount || 0);
        submitData.append('totalVatAmount', totalVatAmount || 0);
        submitData.append('supplierId', selectedData?.supplierId || '');
        submitData.append('currencyCode', selectedData?.currencyCode || '');
        submitData.append('supplierReferenceNumber', selectedData?.supplierReferenceNumber || '');

        const response = await createGRN(submitData);

        if (response.status === 200) {
          toast.success('Goods Received Note created successfully');
          reset();
          if (closeGoodsReceivedNotes) {
            closeGoodsReceivedNotes(true);
          } else if (closeGRNModal) {
            closeGRNModal();
          }
          if (getNextGrnNo) {
            getNextGrnNo();
          }
        } else {
          toast.error(response.data?.message || 'Failed to create Goods Received Note');
        }
      } catch (error) {
        console.error('Error creating GRN:', error);
        toast.error(error?.data || 'An error occurred while creating the Goods Received Note');
      } finally {
        setDisabled(false);
        setLoading(false);
      }
    },
    [
      prefixData,
      selectedData,
      totalAmount,
      totalVatAmount,
      createGRN,
      closeGRNModal,
      closeGoodsReceivedNotes,
      getNextGrnNo,
      reset,
    ]
  );

  const handleClose = () => {
    reset();
    if (closeGoodsReceivedNotes) {
      closeGoodsReceivedNotes(false);
    } else if (closeGRNModal) {
      closeGRNModal();
    }
  };

  return (
    <Modal isOpen={openGRNModal} className="modal-xl" backdrop="static">
      <ModalHeader toggle={handleClose}>
        {strings.CreateGoodsReceivedNote || 'Create Goods Received Note'}
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
                <Label>{strings.GRNNumber || 'GRN Number'}</Label>
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
                <Label>{strings.PONumber || 'PO Number'}</Label>
                <Input
                  type="text"
                  value={selectedData?.poNumber || selectedData?.referenceNumber || ''}
                  disabled
                />
              </FormGroup>
            </Col>
            <Col lg={3}>
              <FormGroup>
                <Label>{strings.ReceiveDate || 'Receive Date'} *</Label>
                <Controller
                  name="grnReceiveDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      className={`form-control ${errors.grnReceiveDate ? 'is-invalid' : ''}`}
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select Date"
                    />
                  )}
                />
                {errors.grnReceiveDate && (
                  <div className="invalid-feedback d-block">{errors.grnReceiveDate.message}</div>
                )}
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
                      <th style={{ width: '30%' }}>{strings.Description || 'Description'}</th>
                      <th style={{ width: '12%' }}>{strings.OrderedQty || 'Ordered Qty'}</th>
                      <th style={{ width: '12%' }}>{strings.ReceivedQty || 'Received Qty'}</th>
                      <th style={{ width: '12%' }}>{strings.UnitPrice || 'Unit Price'}</th>
                      <th style={{ width: '12%' }}>{strings.VAT || 'VAT'}</th>
                      <th style={{ width: '12%' }}>{strings.SubTotal || 'Sub Total'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length > 0 ? (
                      lineItems.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{index + 1}</td>
                          <td>{item.description || '-'}</td>
                          <td>{item.quantity}</td>
                          <td>{item.grnReceivedQuantity || item.quantity}</td>
                          <td>{Number(item.unitPrice).toFixed(2)}</td>
                          <td>{item.vatPercentage ? `${item.vatPercentage}%` : '-'}</td>
                          <td>{Number(item.subTotal).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
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
                    <td className="text-right">{Number(calculatedTotals.subTotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{strings.TotalVAT || 'Total VAT'}</strong>
                    </td>
                    <td className="text-right">{Number(calculatedTotals.vatAmount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{strings.TotalAmount || 'Total Amount'}</strong>
                    </td>
                    <td className="text-right">{Number(calculatedTotals.total).toFixed(2)}</td>
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

export default CreateGoodsReceivedNote;
