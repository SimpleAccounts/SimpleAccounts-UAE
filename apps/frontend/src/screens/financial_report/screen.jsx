import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Receipt,
  BookOpen,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileSpreadsheet,
  Users,
  Package,
  DollarSign,
  FileCheck,
  Clock,
  Banknote,
  ChevronRight,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import config from 'constants/config';
import { data } from '../Language/index';
import LocalizedStrings from 'react-localization';
import './style.scss';

const strings = new LocalizedStrings(data);

/**
 * Report Section Card Component
 */
function ReportSection({ icon: Icon, title, links, iconColor = 'text-primary' }) {
  const navigate = useNavigate();

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-primary/10 ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index}>
              <button
                onClick={() => navigate(link.path)}
                className="flex items-center w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="group-hover:translate-x-1 transition-transform">
                  {link.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Modern Financial Reports Hub Screen
 * Uses functional components and shadcn/ui
 */
function FinancialReport() {
  const navigate = useNavigate();
  const companyDetails = useSelector((state) => state.common.company_details);
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  const { isRegisteredVat } = companyDetails || {};

  // Report sections configuration
  const reportSections = [
    // Financial Reports
    config.REPORTS_HEAD_FI && {
      icon: FileText,
      title: strings.FinancialReports,
      iconColor: 'text-blue-600',
      links: [
        config.REPORTS_PAL && { label: strings.ProfitandLoss, path: '/admin/report/profitandloss' },
        config.REPORTS_BS && { label: strings.BalanceSheet, path: '/admin/report/balancesheet' },
        config.REPORTS_HBS && { label: strings.HorizontalBalanceSheet, path: '/admin/report/horizontalbalancesheet' },
        config.REPORTS_TB && { label: strings.TrailBalances, path: '/admin/report/trailbalances' },
        config.REPORTS_CF && { label: strings.Cash_flow, path: '/admin/report/cash-flow' },
      ].filter(Boolean),
    },
    // VAT Reports
    config.REPORTS_HEAD_VAT && {
      icon: Receipt,
      title: strings.VatReports,
      iconColor: 'text-purple-600',
      links: [
        config.REPORTS_VAT_REPORTS && isRegisteredVat && { label: strings.VatReports, path: '/admin/report/vatreports' },
        config.REPORTS_FTA_AUDIT && isRegisteredVat && { label: strings.FTA_Audit_Report, path: '/admin/report/ftaAuditReports' },
        config.REPORTS_EXCISE_TAX && { label: strings.Excise_Tax_Report, path: '/admin/report/exciseTaxAuditReports' },
      ].filter(Boolean),
    },
    // Detailed General Ledger
    config.REPORT_DGL && {
      icon: BookOpen,
      title: strings.Detailed,
      iconColor: 'text-indigo-600',
      links: [
        { label: strings.DetailedGeneralLedger, path: '/admin/report/detailed-general-ledger' },
      ],
    },
    // Sales Reports
    config.REPORTS_HEAD_SALES && {
      icon: TrendingUp,
      title: strings.Sales,
      iconColor: 'text-green-600',
      links: [
        { label: strings.SalesByCustomer, path: '/admin/report/salesbycustomer' },
        { label: strings.SalesByProduct, path: '/admin/report/salesbyproduct' },
      ],
    },
    // Corporate Tax
    {
      icon: FileSpreadsheet,
      title: strings.CorporateTax,
      iconColor: 'text-orange-600',
      links: [
        { label: strings.CorporateTax, path: '/admin/report/corporate-tax' },
      ],
    },
    // Expense Reports
    config.REPORTS_HEAD_EXPENSE && {
      icon: DollarSign,
      title: strings.Expense,
      iconColor: 'text-red-600',
      links: [
        { label: `${strings.Expense} ${strings.Details}`, path: '/admin/report/expense-details' },
        { label: `${strings.Expense} ${strings.By} ${strings.Category}`, path: '/admin/report/expense-by-category' },
      ],
    },
    // Receivables
    config.REPORTS_HEAD_RECEIVABLE && {
      icon: TrendingUp,
      title: strings.Receivables,
      iconColor: 'text-emerald-600',
      links: [
        { label: strings.ReceivableInvoiceSummary, path: '/admin/report/receivable-invoice-summary' },
        { label: `${strings.Receivable} ${strings.Invoice} ${strings.Details}`, path: '/admin/report/receivable-invoice-details' },
      ],
    },
    // Purchase Reports
    config.REPORTS_HEAD_PURCHASE && {
      icon: Package,
      title: strings.Purchase,
      iconColor: 'text-cyan-600',
      links: [
        { label: strings.PurhaseByVendor, path: '/admin/report/purchasebyvendor' },
        { label: strings.PurhaseByProduct, path: '/admin/report/purchasebyitem' },
      ],
    },
    // Credit Notes
    config.REPORTS_HEAD_PR && {
      icon: CreditCard,
      title: strings.CreditNote,
      iconColor: 'text-teal-600',
      links: [
        { label: strings.CreditNoteDetails, path: '/admin/report/credit-note-details' },
      ],
    },
    // Invoices
    config.REPORTS_HEAD_INVOICES && {
      icon: FileCheck,
      title: strings.Invoices,
      iconColor: 'text-sky-600',
      links: [
        { label: strings.InvoiceDetails, path: '/admin/report/invoice-details' },
      ],
    },
    // Payables
    config.REPORTS_PAYABLE && {
      icon: TrendingDown,
      title: strings.Payables,
      iconColor: 'text-amber-600',
      links: [
        { label: strings.PayablesInvoiceSummary, path: '/admin/report/payable-invoice-summary' },
        { label: strings.PayableInvoiceDetails, path: '/admin/report/payable-invoice-details' },
      ],
    },
    // Debit Notes
    config.REPORTS_HEAD_DN && {
      icon: FileText,
      title: strings.DebitNotes,
      iconColor: 'text-rose-600',
      links: [
        { label: strings.DebitNoteDetails, path: '/admin/report/debit-note-details' },
      ],
    },
    // AR Aging Report
    config.REPORTS_ARAGINGREPORT && {
      icon: Clock,
      title: strings.ARAgingReport,
      iconColor: 'text-violet-600',
      links: [
        { label: strings.ARAgingReport, path: '/admin/report/arAgingReport' },
      ],
    },
    // Payroll Reports
    config.REPORTS_PAYROLLSSUMMARY && {
      icon: Users,
      title: `${strings.Payroll}s`,
      iconColor: 'text-fuchsia-600',
      links: [
        { label: `${strings.Payroll}s ${strings.Summary}`, path: '/admin/report/payroll-summary' },
      ],
    },
    // Account Statement
    config.REPORTS_HEAD_DN && {
      icon: Banknote,
      title: 'Account Statement',
      iconColor: 'text-lime-600',
      links: [
        { label: 'Customer Account Statement', path: '/admin/report/customer-account-statement' },
      ],
    },
  ].filter(Boolean);

  // Filter out sections with no links
  const validSections = reportSections.filter(
    (section) => section && section.links && section.links.length > 0
  );

  return (
    <div className="financial-report-screen">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">{strings.Reports}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validSections.map((section, index) => (
                <ReportSection
                  key={index}
                  icon={section.icon}
                  title={section.title}
                  links={section.links}
                  iconColor={section.iconColor}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FinancialReport;
