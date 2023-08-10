# SimpleAccounts-UAE

SimpleAccounts-UAE is a web application for managing accounts. This README provides instructions for installing and running SimpleAccounts-UAE using Docker and Docker Compose.

## Prerequisites

Before proceeding with the installation, please make sure you have the following prerequisites installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

To verify if Docker and Docker Compose are installed correctly, run the following commands:

```shell
docker --version
docker-compose --version
```

Make sure you see the version numbers for both commands.

## Installation

1. Clone the SimpleAccounts-UAE repository:

```shell
git clone https://github.com/SimpleAccounts/SimpleAccounts-UAE.git
cd SimpleAccounts-UAE
```

2. Open the `docker/docker-compose.yml` file and review the environment variables defined under the backend service section. These variables control various aspects of the application, including SMTP configuration and database settings. It is recommended to change the default values, especially for sensitive information such as passwords.

3. Start the application using Docker Compose:

```shell
docker-compose up -d
```

This command will download the required Docker images and start the containers in the background.

Access the SimpleAccounts-UAE application by opening your web browser and navigating to http://localhost:80.

## SMTP Settings 

Following are the SMTP settings for every type of Gmail Account there is:
To use the SMTP server of your Gmail address, you will need a combination of details. The SMTP Gmail settings you need are listed below.

## Gmail SMTP Settings

The default Gmail SMTP server name is smtp.gmail.com and if you use it, you can configure any external email application to send out messages.
The secure SMTP Gmail ports are 465 and 587.
•	Outgoing Mail (SMTP) Server Address: smtp.gmail.com
•	Username: Your Gmail Address (e.g. user@gmail.com)
•	Authentication: Yes
•	Password: Your Gmail Password
•	Gmail SMTP Port: 465 (SSL required) or 587 (TLS required)

{Example: The following details of SMTP User}
```shell
•	SMTP_USER: (e.g. user@gmail.com)
•	SMTP_PASS: (e.g. 12345)
•	SMTP_HOST: smtp.mailgun.org
•	SMTP_PORT: 587
•	SMTP_AUTH: true
```


## Environment Variables

The following environment variables can be configured in the `docker/docker-compose.yml` file under the backend service section:

- `SIMPLEVAT_SMTP_USER`: SMTP username for sending emails.
- `SIMPLEVAT_SMTP_PASS`: SMTP password for authentication.
- `SIMPLEVAT_SMTP_HOST`: SMTP server hostname.
- `SIMPLEVAT_SMTP_PORT`: SMTP server port.
- `SIMPLEVAT_SMTP_AUTH`: SMTP authentication method.
- `SIMPLEVAT_SMTP_STARTTLS_ENABLE`: Enable STARTTLS for SMTP connection.
- `SIMPLEVAT_RELEASE`: Application release version.
- `SIMPLEVAT_HOST`: Application host URL.
- `SIMPLEVAT_DB_HOST`: Hostname of the PostgreSQL database.
- `SIMPLEVAT_DB`: Name of the PostgreSQL database.
- `SIMPLEVAT_DB_USER`: PostgreSQL database username.
- `SIMPLEVAT_DB_PASSWORD`: PostgreSQL database password.

It is recommended to review and update these variables according to your specific configuration.

> Note: Please ensure that sensitive information, such as passwords, are stored securely and not committed to version control.


## Steps on creating a free SMTP account

## Mailgun SMTP 

Mailgun is a third-party email service that is used to send outgoing emails through SMTP on the server. Those outgoing emails are maybe part of the email marketing campaigns or transactional emails such as password reset emails, order confirmation emails, user registration emails, etc.

Setup Mailgun as SMTP

`Important`

Please be advised that you need to have an account with Mailgun to integrate SMTP.
Follow the guide below to configure a custom SMTP server in your account:
`SMTP Configuration for Mailgun`
    •	Log in to your Mailgun account with your login credentials. First, enter your email address and hit Next.
    •	Proceed to Mailgun Sending > Domains, and add your custom domain. Only verified domains allowed.
    •	Next proceed to Mailgun Settings > API Keys. Your API key was created when you signed up for your account; copy it from Private API Key.
    •	Enter smtp.mailgun.org as your host and username as your mailgun email address.
    •	The port number can be saved as 587.The password is the API key saved from the previous step.

`Test SMTP`
    •	Once the SMTP is set, you can enter a test email and click on Test Configuration to be able to verify if the SMTP flow is working or not.

Above details can be used to setup the `Environment Variables` from the above section.
