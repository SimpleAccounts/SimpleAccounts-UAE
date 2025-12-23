import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Input,
  ButtonGroup,
  Col,
} from 'components/migration';
import { toast } from 'sonner';
import { Loader } from 'components';
import * as TransactionActions from './actions';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Trash2 } from 'lucide-react';

const TransactionCategory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { transaction_list } = useSelector(state => ({
    transaction_list: state.transaction.transaction_list,
  }));

  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    getTransactionListData();
  }, []);

  const getTransactionListData = () => {
    setLoading(true);
    dispatch(TransactionActions.getTransactionList()).then(res => {
      if (res.status === 200) {
        setLoading(false);
      }
    });
  };

  const goToDetail = row => {
    navigate('/admin/settings/transaction-category/detail');
  };

  const getTransactionType = row => {
    return row.transactionType?.transactionTypeName || '';
  };

  const getparentTransactionCategory = row => {
    return row.parentTransactionCategory?.transactionCategoryDescription || '';
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'transactionCategoryCode',
        header: 'Category Code',
      },
      {
        accessorKey: 'transactionCategoryName',
        header: 'Category Name',
      },
      {
        accessorKey: 'transactionCategoryDescription',
        header: 'Category Description',
      },
      {
        id: 'parentCategory',
        header: 'Parent Transaction Category Name',
        cell: ({ row }) => getparentTransactionCategory(row.original),
      },
      {
        id: 'transactionType',
        header: 'Transaction Type',
        cell: ({ row }) => getTransactionType(row.original),
      },
    ],
    []
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="transaction-category-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon icon-graph" />
                <span className="ml-2">Transaction Category</span>
              </div>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <div className="d-flex justify-content-end">
                    <ButtonGroup className="toolbar" size="sm">
                      <Button color="success" className="btn-square">
                        <Download className="h-4 w-4 mr-1" />
                        Export to CSV
                      </Button>
                      <Button
                        color="primary"
                        className="btn-square"
                        onClick={() => navigate(`/admin/settings/transaction-category/create`)}
                      >
                        <Plus className="h-4 w-4" />
                        New Category
                      </Button>
                      <Button color="warning" className="btn-square">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Bulk Delete
                      </Button>
                    </ButtonGroup>
                  </div>
                  <div className="py-3">
                    <h5>Filter : </h5>
                    <Row>
                      <Col lg={2} className="mb-1">
                        <Input type="text" placeholder="Category Code" />
                      </Col>
                      <Col lg={2} className="mb-1">
                        <Input type="text" placeholder="Category Name" />
                      </Col>
                      <Col lg={2} className="mb-1">
                        <Input type="text" placeholder="Category Description" />
                      </Col>
                      <Col lg={2} className="mb-1">
                        <Input type="text" placeholder="Paret Transaction Category Name " />
                      </Col>
                      <Col lg={2} className="mb-1">
                        <Input type="text" placeholder="Transaction Type" />
                      </Col>
                    </Row>
                  </div>

                  <DataTable
                    data={transaction_list || []}
                    columns={columns}
                    manualPagination={false}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    onRowClick={goToDetail}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Modal isOpen={openDeleteModal} className="modal-danger">
            <ModalHeader>Delete</ModalHeader>
            <ModalBody>Are you sure want to delete this record?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => {}}>
                Yes
              </Button>
              &nbsp;
              <Button color="secondary" onClick={() => setOpenDeleteModal(false)}>
                No
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default connect()(TransactionCategory);
