import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Plus, Coins, Download, Trash2 } from 'lucide-react';
import Select from 'react-select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Loader } from 'components';
import { selectStyles } from 'utils';

import * as currenciesActions from './actions';

import './style.scss';

/**
 * Modern Currency Screen
 * Uses functional components, shadcn/ui, and TanStack Table
 */
function Currency() {
  const dispatch = useDispatch();

  // Redux state
  const currency_list = useSelector((state) => state.currency.currency_list);

  // Actions
  const actions = useMemo(() => bindActionCreators(currenciesActions, dispatch), [dispatch]);

  // Local state
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState({
    currencyCode: '',
    currencyName: '',
    currencySymbol: '',
  });

  // Initialize data
  useEffect(() => {
    actions.getCurrencyList().then((res) => {
      if (res.status === 200) {
        setLoading(false);
      }
    });
  }, [actions]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Currency Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
      },
    ],
    []
  );

  // Transform data for table
  const tableData = useMemo(() => {
    if (!currency_list || currency_list.length === 0) return [];
    return currency_list.map((item) => ({
      id: item.id || item.currencyCode,
      name: item.currencyName || '',
      symbol: item.currencySymbol || '',
    }));
  }, [currency_list]);

  // Handle row click
  const handleRowClick = () => {
    setOpenModal(true);
  };

  // Handle form change
  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save
  const handleSave = () => {
    // Save logic would go here
    setOpenModal(false);
    setFormData({
      currencyCode: '',
      currencyName: '',
      currencySymbol: '',
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="currency-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coins className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Currencies</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
                <Button onClick={() => setOpenModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Currency
                </Button>
                <Button variant="destructive" disabled={selectedRows.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Bulk Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={tableData}
              onRowClick={handleRowClick}
            />
          </CardContent>
        </Card>

        {/* Currency Modal */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create & Update Currency</DialogTitle>
              <DialogDescription>
                Add or update currency information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Currency Code</Label>
                <Select
                  styles={selectStyles}
                  placeholder="Select Currency Code"
                  options={[]}
                  onChange={(option) => handleFormChange('currencyCode', option?.value || '')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencyName">
                  <span className="text-destructive">* </span>Currency Name
                </Label>
                <Input
                  id="currencyName"
                  placeholder="Enter Name"
                  value={formData.currencyName}
                  onChange={(e) => handleFormChange('currencyName', e.target.value)}
                  className="input-transition"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencySymbol">
                  <span className="text-destructive">* </span>Symbol
                </Label>
                <Input
                  id="currencySymbol"
                  placeholder="Enter Symbol"
                  value={formData.currencySymbol}
                  onChange={(e) => handleFormChange('currencySymbol', e.target.value)}
                  className="input-transition"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="secondary" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Currency;
