import { useState, useEffect } from 'react';
import { Warehouse } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { InventoryDashboard, InventorySummary } from './sections';

import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Modern Inventory Screen
 * Uses functional components, shadcn/ui Tabs
 */
function Inventory() {
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  return (
    <div className="inventory-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Warehouse className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">{strings.Inventory || 'Inventory'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="dashboard">{strings.Dashboard || 'Dashboard'}</TabsTrigger>
                <TabsTrigger value="summary">{strings.Summary || 'Summary'}</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <div className="table-wrapper">
                  <InventoryDashboard />
                </div>
              </TabsContent>
              <TabsContent value="summary">
                <div className="table-wrapper">
                  <InventorySummary />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Inventory;
