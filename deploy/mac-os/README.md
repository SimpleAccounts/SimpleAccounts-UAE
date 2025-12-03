# SimpleAccounts-UAE

SimpleAccounts-UAE is a web application for managing accounts. This README provides instructions for installing and running SimpleAccounts-UAE using Docker and Docker Compose.

## Prerequisites

Before proceeding with the installation, please make sure you have the following prerequisites installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

Here are detailed instructions to install Docker and Docker Compose on Mac OS:

## Installing Docker on macOS

1. Visit the Docker website: [https://www.docker.com/get-started](https://www.docker.com/get-started)

2. Click on the "Get Docker" button.

3. On the next page, select "Docker Desktop for Mac" to download the installer.

4. Once the download is complete, open the installer package (`.dmg` file).

5. Drag and drop the Docker.app icon into the Applications folder to install Docker.

6. Launch Docker by clicking on the Docker icon in the Applications folder.

7. Docker may prompt you for system-level permissions. Enter your macOS user password to authorize Docker.

8. Docker Desktop will start up, and you'll see the Docker icon appear in the macOS menu bar.

9. Docker may take a few minutes to initialize. Once it's ready, you'll see the Docker status as "Docker is running" in the menu bar.

10. Click on the Docker icon in the menu bar and select "Preferences" to access Docker settings. From there, you can customize various configurations such as resources, network, and more. You can review and adjust these settings according to your needs.

11. Docker is now installed on your macOS machine. You can open a terminal window and run `docker --version` to verify the installation. It should display the Docker version number.

## Installing Docker Compose on macOS

1. Open a terminal window.

2. Run the following command to download the Docker Compose binary:

   ```bash
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   ```

   This command retrieves the latest release of Docker Compose and saves it to the `/usr/local/bin/docker-compose` location.

3. After the download completes, run the following command to make the `docker-compose` binary executable:

   ```bash
   chmod +x /usr/local/bin/docker-compose
   ```

4. Verify the installation by running `docker-compose --version` in the terminal. It should display the Docker Compose version number.

Docker and Docker Compose are now successfully installed on your macOS machine. You can proceed with using them as described in your project's README.md file or other relevant documentation.

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