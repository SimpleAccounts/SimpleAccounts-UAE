# SimpleAccounts-UAE

SimpleAccounts-UAE is a web application for managing accounts. This README provides instructions for installing and running SimpleAccounts-UAE using Docker and Docker Compose.

## Prerequisites

Before proceeding with the installation, please make sure you have the following prerequisites installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

Here are detailed instructions to install Docker and Docker Compose on Windows OS:

## Installing Docker on Windows

1. Visit the Docker website: [https://www.docker.com/get-started](https://www.docker.com/get-started)

2. Click on the "Get Docker" button.

3. On the next page, select "Docker Desktop for Windows" to download the installer.

4. Once the download is complete, run the installer.

5. During the installation process, you may be prompted to enable Hyper-V and Windows containers features. Make sure to enable them if requested.

6. After the installation is complete, Docker Desktop will launch automatically.

7. Docker Desktop may take a few minutes to start up. Once it's ready, you'll see the Docker icon in the system tray.

8. Right-click on the Docker icon in the system tray and select "Settings".

9. In the settings window, you can customize various Docker configurations such as resources, network, and more. You can review and adjust these settings according to your needs.

10. Docker is now installed on your Windows machine. You can open a command prompt or PowerShell window and run `docker --version` to verify the installation. It should display the Docker version number.

## Installing Docker Compose on Windows

1. Open a web browser and go to the Docker Compose GitHub release page: [https://github.com/docker/compose/releases](https://github.com/docker/compose/releases)

2. Scroll down to the "Assets" section of the latest release.

3. Under the "Assets" section, find the Windows executable file with the filename `docker-compose-Windows-x86_64.exe` and click on it to download.

4. Rename the downloaded file to `docker-compose.exe`.

5. Move the `docker-compose.exe` file to a directory that is included in your system's PATH environment variable. This will allow you to run Docker Compose from any command prompt or PowerShell window.

6. Open a command prompt or PowerShell window and run `docker-compose --version` to verify the installation. It should display the Docker Compose version number.

Docker and Docker Compose are now successfully installed on your Windows machine. You can proceed with using them as described in your project's README.md file or other relevant documentation.

>Note: Make sure to restart your computer after installing Docker and Docker Compose to ensure that all changes take effect properly.

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

## Environment Variables

The following environment variables can be configured in the `docker/docker-compose.yml` file under the backend service section:

- `SIMPLEACCOUNTS_SMTP_USER`: SMTP username for sending emails.
- `SIMPLEACCOUNTS_SMTP_PASS`: SMTP password for authentication.
- `SIMPLEACCOUNTS_SMTP_HOST`: SMTP server hostname.
- `SIMPLEACCOUNTS_SMTP_PORT`: SMTP server port.
- `SIMPLEACCOUNTS_SMTP_AUTH`: SMTP authentication method.
- `SIMPLEACCOUNTS_SMTP_STARTTLS_ENABLE`: Enable STARTTLS for SMTP connection.
- `SIMPLEACCOUNTS_RELEASE`: Application release version.
- `SIMPLEACCOUNTS_HOST`: Application host URL.
- `SIMPLEACCOUNTS_DB_HOST`: Hostname of the PostgreSQL database.
- `SIMPLEACCOUNTS_DB`: Name of the PostgreSQL database.
- `SIMPLEACCOUNTS_DB_USER`: PostgreSQL database username.
- `SIMPLEACCOUNTS_DB_PASSWORD`: PostgreSQL database password.

It is recommended to review and update these variables according to your specific configuration.

> Note: Please ensure that sensitive information, such as passwords, are stored securely and not committed to version control.