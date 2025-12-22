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
  Col,
  Form,
  FormGroup,
  Label,
} from 'components/migration';
import Select from 'react-select';
import { Loader } from 'components';
import { DataTable } from '@/components/ui/data-table';
import config from '../../constants/config';
import './style.scss';
import * as RolesActions from './actions';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { CommonActions } from 'services/global';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, Plus } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const UsersRoles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { role_list } = useSelector(state => ({
    role_list: state.user.role_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [openInviteUserModal, setOpenInviteUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  useEffect(() => {
    // initializeData(); // Infinite loop if not careful, original used didMount and sort changes
  }, [sorting]);

  const initializeData = () => {
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    // const postData = {...sortingData };
    dispatch(RolesActions.getRoleList());
  };

  const showInviteUserModal = () => {
    setOpenInviteUserModal(true);
  };

  const closeInviteUserModal = () => {
    setOpenInviteUserModal(false);
  };

  const goToDetail = row => {
    if (
      row.roleCode === 1 ||
      row.roleCode === 2 ||
      row.roleCode === 3 ||
      row.roleCode === 104 ||
      row.roleCode === 105
    ) {
      toast.error('You Cannot Edit ' + row.roleName + ' Role');
    } else {
      navigate('/admin/settings/user-role/update', {
        state: { id: row.roleCode },
      });
    }
  };

  const getUserName = value => {
    return (
      <div className="d-flex">
        <div className="ml-2">
          <div>{value}</div>
        </div>
      </div>
    );
  };

  const renderStatus = isActive => {
    let classname = '';
    if (isActive === true) {
      classname = 'label-success';
    } else {
      classname = 'label-due';
    }
    return (
      <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
        {isActive === true ? 'Active' : 'InActive'}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'roleNameDetail', // custom key for User Detail column
        header: strings.UserDetail,
        cell: ({ row }) => getUserName(row.original.roleName),
      },
      {
        accessorKey: 'roleName',
        header: strings.Role,
      },
      {
        accessorKey: 'isActive',
        header: strings.Status,
        cell: ({ getValue }) => renderStatus(getValue()),
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
                <Users className="h-4 w-4" />
                <span className="ml-2">{strings.Role}</span>
              </div>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg="12">
                  <div className="d-flex justify-content-end"></div>
                  {config.ADD_ROLES && (
                    <Button
                      color="primary"
                      style={{ marginBottom: '10px' }}
                      className="btn-square pull-right"
                      onClick={() => navigate('/admin/settings/user-role/create')}
                    >
                      <Plus className="h-4 w-4" />
                      {strings.AddNewRole}
                    </Button>
                  )}

                  <DataTable
                    data={role_list || []}
                    columns={columns}
                    manualPagination={false}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    manualSorting={false} // Client side sorting for small list usually
                    onRowClick={goToDetail}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Modal isOpen={openInviteUserModal} className={'modal-success'}>
            <ModalHeader toggle={closeInviteUserModal}> {strings.InviteUser} </ModalHeader>
            <ModalBody>
              <Form onSubmit={e => e.preventDefault()} name="simpleForm">
                <FormGroup>
                  <Label htmlFor="categoryName">*{strings.CompanyName}</Label>
                  <Input
                    type="text"
                    id="categoryName"
                    name="categoryName"
                    placeholder={strings.Enter + strings.UserName}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="categoryCode">*{strings.Email}</Label>
                  <Input
                    type="text"
                    id="categoryCode"
                    name="categoryCode"
                    placeholder={strings.Enter + strings.Email}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="categoryCode"> {strings.Position}</Label>
                  <Select
                    className="select-min-width"
                    options={[]}
                    placeholder={strings.Position}
                  />
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="success" className="btn-square" onClick={closeInviteUserModal}>
                {strings.Send}
              </Button>
              &nbsp;
              <Button color="secondary" className="btn-square" onClick={closeInviteUserModal}>
                {strings.No}
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default UsersRoles;
