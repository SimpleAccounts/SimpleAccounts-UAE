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