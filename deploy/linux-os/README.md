# SimpleAccounts-UAE

SimpleAccounts-UAE is a web application for managing accounts. This README provides instructions for installing and running SimpleAccounts-UAE using Docker and Docker Compose.

## Prerequisites

Before proceeding with the installation, please make sure you have the following prerequisites installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

Here are detailed instructions to install Docker and Docker Compose on different Linux distributions:

### Ubuntu and Debian-based Systems:

#### Installing Docker on Ubuntu and Debian-based Systems:

1. Open a terminal.

2. Update the package index:

   ```bash
   sudo apt update
   ```

3. Install the necessary packages to allow apt to use a repository over HTTPS:

   ```bash
   sudo apt install apt-transport-https ca-certificates curl software-properties-common
   ```

4. Add the official Docker GPG key:

   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```

5. Add the Docker repository:

   For Ubuntu:

   ```bash
   echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

   For Debian:

   ```bash
   echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

6. Update the package index again:

   ```bash
   sudo apt update
   ```

7. Install Docker:

   ```bash
   sudo apt install docker-ce docker-ce-cli containerd.io
   ```

8. Verify the installation by running `docker --version` in the terminal. It should display the Docker version number.

#### Installing Docker Compose on Ubuntu and Debian-based Systems:

1. Install Docker Compose using `curl`:

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   ```

2. Make the `docker-compose` binary executable:

   ```bash
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. Verify the installation by running `docker-compose --version` in the terminal. It should display the Docker Compose version number.

### CentOS:

#### Installing Docker on CentOS:

1. Open a terminal.

2. Install the required packages for Docker:

   ```bash
   sudo yum install -y yum-utils device-mapper-persistent-data lvm2
   ```

3. Add the Docker repository:

   ```bash
   sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   ```

4. Install Docker:

   ```bash
   sudo yum install -y docker-ce docker-ce-cli containerd.io
   ```

5. Start Docker:

   ```bash
   sudo systemctl start docker
   ```

6. Enable Docker to start on boot:

   ```bash
   sudo systemctl enable docker
   ```

7. Verify the installation by running `docker --version` in the terminal. It should display the Docker version number.

#### Installing Docker Compose on CentOS:

1. Install Docker Compose using `curl`:

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   ```

2. Make the `docker-compose` binary executable:

   ```bash
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. Verify the installation by running `

docker-compose --version` in the terminal. It should display the Docker Compose version number.

### Other Linux Distributions:

For other Linux distributions, the installation steps for Docker and Docker Compose may vary. It's recommended to refer to the official Docker documentation for instructions specific to your distribution:

- Docker installation: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
- Docker Compose installation: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

Make sure to follow the instructions provided for your specific Linux distribution to ensure a successful installation of Docker and Docker Compose.

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