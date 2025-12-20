import React, { useState, useEffect, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardBody, Button, Row, Col } from 'reactstrap';
import { Loader, ConfirmDeleteModal } from 'components';
import * as DesignationActions from './actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const strings = new LocalizedStrings(languageData);

const Designation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { designation_list } = useSelector(state => ({
    designation_list: state.employeeDesignation.designation_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({
    id: '',
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
    const paginationData = {
      pageNo: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    const sortingData = {
      order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
      sortingCol: sorting.length > 0 ? sorting[0].id : '',
    };
    const postData = { ...filterData, ...paginationData, ...sortingData };

    dispatch(DesignationActions.getEmployeeDesignationList(postData))
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
    navigate('/admin/payroll/config/detailEmployeeDesignation', { state: { id: row.id } });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'designationId',
        header: strings.DESIGNATIONID,
      },
      {
        accessorKey: 'designationName',
        header: strings.DESIGNATIONNAME,
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
          {dialog}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="fas fa-object-group" />
                    <span className="ml-2">{strings.Designations}</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <div className="d-flex justify-content-end">
                    <div style={{ width: '1650px' }}>
                      <Button
                        color="primary"
                        className="btn-square pull-right mb-2 mr-2"
                        style={{ marginBottom: '10px' }}
                        onClick={() => navigate(`/admin/payroll/config/createEmployeeDesignation`)}
                      >
                        <i className="fas fa-plus mr-1" />
                        {strings.NewDesignation}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <DataTable
                      data={designation_list?.data || []}
                      columns={columns}
                      manualPagination={true}
                      pageCount={
                        designation_list?.count
                          ? Math.ceil(designation_list.count / pagination.pageSize)
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

export default Designation;
