import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Row, Col, FormGroup } from 'reactstrap';
import * as ImportActions from '../../actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

const strings = new LocalizedStrings(languageData);

const MigrateHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [language] = useState(window['localStorage'].getItem('language'));
  const [summaryList, setSummaryList] = useState([]);

  useEffect(() => {
    strings.setLanguage(language);
    initializeData();
  }, [language]);

  const initializeData = () => {
    dispatch(ImportActions.getMigrationSummary())
      .then(res => {
        if (res.status === 200) {
          setSummaryList(res.data);
        }
      })
      .catch(err => {
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  };

  const finishMigration = () => {
    const formData = new FormData();
    formData.append('name', location?.state?.name || 'zoho');
    formData.append('version', location?.state?.version || '3.4');

    dispatch(ImportActions.migrate(formData))
      .then(res => {
        if (res.status === 200) {
          toast.success('migration Done Successfully.');
          navigate('/admin/settings/migrateHistory');
        }
      })
      .catch(() => {
        toast.error('Something Went Wrong');
      });
  };

  const rollBackMigration = () => {
    dispatch(ImportActions.rollBackMigration())
      .then(res => {
        if (res.status === 200) {
          toast.success('Migration Rolled back Successfully.');
          navigate('/admin/settings/import');
        }
      })
      .catch(() => {
        toast.error('Something Went Wrong');
      });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'fileName',
        header: 'File Name',
      },
      {
        accessorKey: 'recordCount',
        header: 'Number of Record',
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
      },
      {
        accessorKey: 'recordsMigrated',
        header: 'Migrated Records',
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
      },
      {
        accessorKey: 'recordsRemoved',
        header: 'Rejected Records',
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
      },
    ],
    []
  );

  return (
    <div className="transactions-report-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <h5>Migrate</h5>
          </CardHeader>
          <CardBody style={{ margin: '0px 176px 0px 176px' }}>
            <div className="text-center mb-4 mt-2">
              <h1>Migration Summary</h1>
            </div>
            <div style={{ border: '1px solid grey' }}>
              <DataTable data={summaryList || []} columns={columns} manualPagination={false} />
            </div>
            <Row>
              <Col lg={12} className="mt-5">
                <div className="table-wrapper">
                  <FormGroup className="text-center">
                    <Button
                      color="secondary"
                      className="btn-square pull-left"
                      onClick={rollBackMigration}
                    >
                      <ArrowLeftCircle className="h-4 w-4" /> RollBack Migration
                    </Button>

                    <Button
                      name="button"
                      color="primary"
                      className="btn-square pull-right mr-3"
                      onClick={finishMigration}
                    >
                      Finish Migration <ArrowRightCircle className="h-4 w-4" />
                    </Button>
                  </FormGroup>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect()(MigrateHistory);
