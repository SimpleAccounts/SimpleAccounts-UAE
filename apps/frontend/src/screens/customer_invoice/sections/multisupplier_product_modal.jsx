import React, { useState, useMemo } from 'react';
import {
  Button,
  Row,
  Col,
  Form,
  Input,
  Modal,
  CardHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from '@/components/ui/data-table';

// Zod validation schema
const supplierModalSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  vatRegistrationNumber: z.string().min(1, 'Tax registration number is required'),
});

const SupplierModal = props => {
  const [selectedRows, setSelectedRows] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(supplierModalSchema),
    defaultValues: {},
  });

  const onSubmit = formData => {
    // Handle form submission
    // Need to get selected rows and quantities?
    // Original code didn't seem to have full implementation of onSubmit either.
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'supplierName',
        header: 'Supplier Name',
      },
      {
        accessorKey: 'stockInHand',
        header: 'Stock in hand',
      },
      {
        accessorKey: 'reOrderLevel',
        header: 'Reorder Level',
        // Original used renderInvoiceStatus which just returned cell
      },
      {
        accessorKey: 'invoiceDate',
        header: 'Quantity',
        cell: ({ row }) => (
          <div>
            <Input
              type="text"
              placeholder="Quantity"
              // onChange logic missing in original
            />
          </div>
        ),
      },
    ],
    []
  );

  const { openMultiSupplierProductModal, closeMultiSupplierProductModal, inventory_list } = props;

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openMultiSupplierProductModal} className="modal-success contact-modal">
        <Form name="simpleForm" onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <i className="nav-icon fas fa-id-card-alt" />
                  <span className="ml-2">Quantity</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <ModalBody>
            <h4 className="mb-3 mt-3">Quantity</h4>
            <div style={{ overflowX: 'auto' }}>
              <DataTable
                data={inventory_list || []}
                columns={columns}
                enableRowSelection={true}
                rowSelection={selectedRows}
                onRowSelectionChange={setSelectedRows}
                manualPagination={false}
                getRowId={row => row.id}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" className="btn-square">
              <i className="fa fa-dot-circle-o"></i> Save
            </Button>
            &nbsp;
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closeMultiSupplierProductModal(false);
              }}
            >
              <i className="fa fa-ban"></i> Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierModal;
