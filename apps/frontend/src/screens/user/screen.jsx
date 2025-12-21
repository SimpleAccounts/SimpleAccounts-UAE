import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Row, Col, ButtonGroup, Input } from 'reactstrap';
import Select from 'react-select';
import { Loader, ConfirmDeleteModal } from 'components';
import * as UserActions from './actions';
import { CommonActions } from 'services/global';
import { selectOptionsFactory, selectStyles } from 'utils';
import dayjs from '@/utils/date';
import './style.scss';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, Search, RefreshCw, Plus } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const User = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user_list, role_list } = useSelector(state => ({
    user_list: state.user.user_list,
    role_list: state.user.role_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({
    name: '',
    active: '',
    roleId: '',
  });

  const statusOption = [
    { label: 'Select Status', value: '' },
    { label: 'Active', value: '1' },
    { label: 'InActive', value: '0' },
  ];

  useEffect(() => {
    strings.setLanguage(language);
    dispatch(UserActions.getRoleList());
    initializeData();
  }, [language]);

  useEffect(() => {
    initializeData();
  }, [pagination, sorting]);

  const initializeData = () => {
    setLoading(true);
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    dispatch(UserActions.getUserList(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  };

  const goToDetail = row => {
    navigate('/admin/settings/user/detail', { state: { id: row.id } });
  };

  const handleFilterChange = (val, name) => {
    setFilterData(prev => ({ ...prev, [name]: val }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    initializeData();
  };

  const clearAll = () => {
    setFilterData({ name: '', active: '', roleId: '' });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const renderDate = value => {
    return value ? dayjs(value, 'DD-MM-YYYY').format('DD-MM-YYYY') : '';
  };

  const renderStatus = isActive => {
    let classname = isActive === true ? 'label-success' : 'label-due';
    return (
      <span className={`badge ${classname} mb-0`} style={{ color: 'white' }}>
        {isActive === true ? 'Active' : 'InActive'}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: strings.UserName,
      },
      {
        accessorKey: 'dob',
        header: strings.DOB,
        cell: ({ getValue }) => renderDate(getValue()),
      },
      {
        accessorKey: 'roleName',
        header: strings.RoleName,
      },
      {
        accessorKey: 'active',
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
    <div className="user-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <div className="h4 mb-0 d-flex align-items-center">
              <Users className="h-4 w-4" />
              <span className="ml-2"> {strings.User} </span>
            </div>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={12}>
                <div className="py-3">
                  <h5>{strings.Filter}: </h5>
                  <Row>
                    <Col lg={2} className="mb-1">
                      <Input
                        type="text"
                        value={filterData.name}
                        placeholder={strings.Enter + strings.UserName}
                        onChange={e => handleFilterChange(e.target.value, 'name')}
                      />
                    </Col>
                    <Col lg={2} className="mb-1">
                      <Select
                        styles={selectStyles}
                        placeholder={strings.Select + strings.Status}
                        options={statusOption}
                        value={filterData.active}
                        onChange={option => handleFilterChange(option, 'active')}
                      />
                    </Col>
                    <Col lg={3} className="pl-0 pr-0">
                      <Button
                        type="button"
                        color="primary"
                        className="btn-square mr-1"
                        onClick={handleSearch}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        color="primary"
                        className="btn-square"
                        onClick={clearAll}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </Col>
                  </Row>
                </div>
                <Button
                  color="primary"
                  style={{ marginBottom: '10px' }}
                  className="btn-square pull-right mb-2"
                  onClick={() => navigate(`/admin/settings/user/create`)}
                >
                  <Plus className="h-4 w-4" />
                  {strings.AddNewUsers}
                </Button>

                <div>
                  <DataTable
                    data={user_list?.data || []}
                    columns={columns}
                    manualPagination={true}
                    pageCount={
                      user_list?.count ? Math.ceil(user_list.count / pagination.pageSize) : 0
                    }
                    onPaginationChange={setPagination}
                    pagination={pagination}
                    manualSorting={true}
                    onSortingChange={setSorting}
                    sorting={sorting}
                    onRowClick={goToDetail}
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect()(User);
