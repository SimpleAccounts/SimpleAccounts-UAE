# SimpleAccounts UAE

[![CI](https://github.com/SimpleAccounts/SimpleAccounts-UAE/actions/workflows/build.yml/badge.svg)](https://github.com/SimpleAccounts/SimpleAccounts-UAE/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/SimpleAccounts/SimpleAccounts-UAE)](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues)
[![GitHub stars](https://img.shields.io/github/stars/SimpleAccounts/SimpleAccounts-UAE)](https://github.com/SimpleAccounts/SimpleAccounts-UAE/stargazers)
[![GitHub Discussions](https://img.shields.io/github/discussions/SimpleAccounts/SimpleAccounts-UAE)](https://github.com/SimpleAccounts/SimpleAccounts-UAE/discussions)

SimpleAccounts is an innovative accounting software that provides a comprehensive solution for businesses of all sizes. With its user-friendly interface and powerful features, it streamlines financial management and enables businesses to make informed decisions.

## Monorepo Structure

```
SimpleAccounts-UAE/
├── apps/
│   ├── frontend/          # Frontend application (JS/TS)
│   ├── backend/           # Backend application (Java/Spring Boot)
│   └── agents/            # Agent applications
├── packages/              # Shared packages
├── deploy/                # Deployment configurations
│   ├── docker/
│   ├── linux-os/
│   ├── mac-os/
│   └── windows-os/
├── package.json           # Root package.json (npm workspaces)
└── README.md
```

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Java** 11 (OpenJDK or Oracle JDK)
- **Maven** 3.6+ (or use included mvnw wrapper)
- **MySQL** 8.0+ or **MariaDB** 10.5+

## Quick Start

```bash
# Install dependencies
npm install

# Run frontend
npm run frontend

# Run backend
npm run backend:run

# Build all
npm run frontend:build
npm run backend:build
```

## Key Features

| Module | Features |
|--------|----------|
| **Customer Invoices** | Income Receipts, Quotations |
| **Expenses** | Expenses, Supplier Invoices, Purchase Receipts |
| **Banking** | Bank Accounts, Reconciliation |
| **Accountant** | Opening Balance, Journals |
| **Reports** | Profit & Loss, Balance Sheet, Trial Balance, VAT Reports, General Ledger |
| **Master Data** | Chart of Accounts, Contacts, Products, VAT Categories, Currency Rates |
| **Payroll** | Payroll Run, Payroll Configuration, Employee Management |

### Support

|                     | Community Support     | Basic Support                      | Premium Support                    |
|---------------------|-----------------------|------------------------------------|------------------------------------|
| Price               | FREE                  | AED 490 (Paid Yearly)              | AED 990 (Paid Yearly)              |
| Upgrades            | No Commitment         | Quarterly                          | Monthly                            |
| Response Time       | N/A                   | 24 hours                           | 4 hours                            |
| Channel             | Community             | Email + Chat                       | Email + Chat + Calls               |
| Accountants         | N/A                   | N/A                                | Pool                               |
| Training            | Community             | Online Material                    | Dedicated                          |
| Integration         | N/A                   | Documentation Support              | Technical Support                  |
| Addons              | N/A                   | Standard Addons                    | Customized Addons                  |
| Customization       | N/A                   | Scheduled                          | Prioritized                        |


## Installation

SimpleAccounts can be installed using the following methods:

1. [Docker](https://github.com/SimpleAccounts/SimpleAccounts-UAE/blob/develop/deploy/docker/README.md): Install SimpleAccounts as a Docker container.
2. Kubernetes: Deploy SimpleAccounts on a Kubernetes cluster. (Coming Soon...)
3. [Linux OS](https://github.com/SimpleAccounts/SimpleAccounts-UAE/blob/develop/deploy/linux-os/README.md): Install SimpleAccounts on a Linux operating system.
4. [Mac OS](https://github.com/SimpleAccounts/SimpleAccounts-UAE/blob/develop/deploy/mac-os/README.md): Install SimpleAccounts on a macOS.
5. [Windows OS](https://github.com/SimpleAccounts/SimpleAccounts-UAE/blob/develop/deploy/windows-os/README.md): Install SimpleAccounts on a Windows operating system.
6. Microsoft Azure Cloud: Deploy SimpleAccounts on Microsoft Azure Cloud. (Coming Soon...)
7. AWS Cloud: Deploy SimpleAccounts on Amazon Web Services (AWS) Cloud. (Coming Soon...)
8. Google Cloud: Deploy SimpleAccounts on Google Cloud. (Coming Soon...)
9. DigitalOcean Cloud: Deploy SimpleAccounts on DigitalOcean Cloud. (Coming Soon...)

## Support

If you have any questions or need assistance with SimpleAccounts, please reach out to our support team at [support@simpleaccounts.com](mailto:support@simpleaccounts.com).

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

Before contributing, please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*SimpleAccounts is a product of DataInn. For more information, visit our [website](https://www.datainn.io).*
