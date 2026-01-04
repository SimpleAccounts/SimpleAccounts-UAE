import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardBody, Button, Row, Col, ButtonGroup } from 'components/migration';
import { Loader } from 'components';
import * as SalaryStructureAction from './actions';
import './style.scss';
import { data as languageData } from '../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LayoutGrid, Plus } from '@/components/icons';

const strings = new LocalizedStrings(languageData);

const SalaryStructure = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { salaryStructure_list } = useSelector(state => ({
    salaryStructure_list: state.salaryStructure.salaryStructure_list,
  }));

  const [language] = useState(window['localStorage'].getItem('language'));
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);
  const [filterData, setFilterData] = useState({
    name: '',
    email: '',
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

    dispatch(SalaryStructureAction.getSalaryStructureList(postData))
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
    navigate('/admin/payroll/config/detailSalaryStructure', {
      state: { id: row.salaryStructureId },
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'salaryStructureType',
        header: strings.SalaryStructureType,
      },
      {
        accessorKey: 'salaryStructureName',
        header: strings.SalaryStructureName,
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
                    <span className="ml-2">{strings.SalaryStructure}</span>
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
                          onClick={() => navigate(`/admin/payroll/config/createSalaryStructure`)}
                        >
                          <Plus className="h-4 w-4" />
                          {strings.NewSalaryStructure}
                        </Button>
                      </div>
                    </ButtonGroup>
                  </div>

                  <div>
                    <DataTable
                      data={salaryStructure_list?.data || []}
                      columns={columns}
                      manualPagination={true}
                      pageCount={
                        salaryStructure_list?.count
                          ? Math.ceil(salaryStructure_list.count / pagination.pageSize)
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

export default SalaryStructure;
