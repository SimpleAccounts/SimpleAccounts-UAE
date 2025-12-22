import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Button, Row, Col } from 'components/migration';
import './style.scss';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import * as ProductActions from '../../actions';
import * as ImportActions from '../../actions';
import { CommonActions } from 'services/global';
import { DataTable } from '@/components/ui/data-table';
import dayjs from '@/utils/date';

const strings = new LocalizedStrings(languageData);

const MigrateHistory = () => {
  const dispatch = useDispatch();

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
        // error handling
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

  const data = summaryList && summaryList[0] ? summaryList[0] : {};
  const migrationBeginningDate = data.migrationBeginningDate || '-';
  const sourceApplication = 'Zoho Books';
  const executionDate = data.executionDate || '-';

  return (
    <div className="transactions-report-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <h5>Migrate History</h5>
          </CardHeader>
          <CardBody style={{ margin: '0px 176px 0px 176px' }}>
            <h1 className="text-center">Migration Summary</h1>
            <br />
            <Row className="mb-4 mt-2">
              <Col lg={4}>
                {' '}
                <b>Migration Beginning Date: </b>
                {dayjs(migrationBeginningDate).format('DD/MM/YYYY')}
              </Col>
              <Col lg={4} className="text-center">
                <b>Source Application: </b>
                {sourceApplication}{' '}
              </Col>
              <Col lg={4} className="text-right">
                <b>Execution Date: </b> {dayjs(executionDate).format('DD/MM/YYYY')}
              </Col>
            </Row>

            <div style={{ border: '1px solid grey' }}>
              <DataTable data={summaryList || []} columns={columns} manualPagination={false} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default connect()(MigrateHistory);
