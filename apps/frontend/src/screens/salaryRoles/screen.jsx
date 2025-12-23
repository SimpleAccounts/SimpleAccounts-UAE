import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Row, Col, ButtonGroup } from 'components/migration';
import { Loader, ConfirmDeleteModal } from 'components';
import * as EmployeeActions from './actions';
import { CommonActions } from 'services/global';
import './style.scss';
import LocalizedStrings from 'react-localization';
import { data as languageData } from '../Language/index';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LayoutGrid, Plus } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const SalaryRoles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { salaryRole_list } = useSelector(state => ({
    salaryRole_list: state.salaryRoles.salaryRole_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({
    salaryRoleId: '',
    salaryRoleName: '',
  });

  useEffect(() => {
    strings.setLanguage(language);
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

    dispatch(EmployeeActions.getSalaryRoleList(postData))
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
    navigate('/admin/payroll/config/detailSalaryRoles', { state: { id: row.salaryRoleId } });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'salaryRoleId',
        header: strings.SALARYROLEID,
      },
      {
        accessorKey: 'salaryRoleName',
        header: strings.SALARYROLENAME,
      },
    ],
    []
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="employee-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <LayoutGrid className="h-4 w-4" />
                    <span className="ml-2"> {strings.SalaryRole}</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <div className="d-flex justify-content-end">
                    <ButtonGroup size="sm">
                      <div style={{ width: '1650px' }}>
                        <Button
                          color="primary"
                          className="btn-square pull-right mb-2 mr-2"
                          style={{ marginBottom: '10px' }}
                          onClick={() => navigate(`/admin/payroll/config/createSalaryRoles`)}
                        >
                          <Plus className="h-4 w-4" />
                          {strings.NewSalaryRoles}
                        </Button>
                      </div>
                    </ButtonGroup>
                  </div>

                  <div>
                    <DataTable
                      data={salaryRole_list?.data || []}
                      columns={columns}
                      manualPagination={true}
                      pageCount={
                        salaryRole_list?.count
                          ? Math.ceil(salaryRole_list.count / pagination.pageSize)
                          : 0
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
    </div>
  );
};

export default SalaryRoles;
