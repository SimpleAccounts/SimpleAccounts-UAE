import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ExpenseReport, CustomerReport, AccountBalances } from './sections';

import './style.scss';

/**
 * Modern Transactions Report Screen
 * Uses functional components and shadcn/ui Tabs
 */
function TransactionsReport() {
  const [activeTab, setActiveTab] = useState('account-balances');

  return (
    <div className="transactions-report-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Transactions Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="account-balances">Account Balances</TabsTrigger>
                {/* <TabsTrigger value="customer-report">Customer Invoice Report</TabsTrigger>
                <TabsTrigger value="expense-report">Expenses</TabsTrigger> */}
              </TabsList>
              <TabsContent value="account-balances">
                <div className="table-wrapper">
                  <AccountBalances />
                </div>
              </TabsContent>
              <TabsContent value="customer-report">
                <div className="table-wrapper">
                  <CustomerReport />
                </div>
              </TabsContent>
              <TabsContent value="expense-report">
                <div className="table-wrapper">
                  <ExpenseReport />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TransactionsReport;
