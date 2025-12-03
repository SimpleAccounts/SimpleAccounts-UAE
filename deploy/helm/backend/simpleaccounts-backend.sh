#!/bin/bash
#
# Prarameters
# 1 - install or upgrade operation
# 2 - subdomain name for SimpleAccounts installation
# 3 - SimpleAccounts docker image version (Backend)
# 4 - SimpleAccounts database password (Optional: Required when operation is install)
# End of parameters
#
if [ "$1" != "install" ] && [ "$1" != "upgrade" ]
then
        echo "ERROR: Wrong operation $1"
        exit 1
elif [ $# != 3 ] && [ $# != 4 ] && [ $# != 5 ]
then
        echo "ERROR: Wrong number of argumeents"
        exit 1
fi

echo "Start SimpleAccounts $1 for $2:$3"

nameserver="simpleaccounts-app"
maindomain="app.simpleaccounts.io"
subdomain="$2"
helmDir="simpleaccounts-backend"
SVrelease="$3"
database="sa_${subdomain//-/_}_db"
createDatabase="true"
if [ $# -eq 5 ] && [ "$5" = "--no-database" ]
then
	createDatabase="false"
elif [ $# -eq 5 ]
then
	echo "ERROR: Wrong operation $5"
	exit 1
fi

dbhost=$DB_SERVER
username="${database}_user"
password="$4"
base64_dbhost=$(echo -n ${dbhost} | base64)
base64_username=$(echo -n ${username}'@simpleaccounts-db-prod' | base64)
base64_password=$(echo -n ${password} | base64)

if [[ $1 = "install" ]]
then
        if [[ $# -eq 4 ]]
        then
                echo "Creating a database & User"
                source set-env.sh
                createDatabase="true"
                mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "CREATE DATABASE ${database}"
                mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "CREATE USER ${username}@'%' IDENTIFIED BY '${password}'"
                mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "GRANT ALL PRIVILEGES ON ${database}.* TO ${username}@'%'"
                mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "FLUSH PRIVILEGES"
                echo "Database & User created."

                kubectl create secret generic db-credentials-$subdomain-backend \
                --from-literal=db-host=simpleaccounts-db-prod.mysql.database.azure.com \
                --from-literal=username=${username}@simpleaccounts-db-prod --from-literal=password=${password} \
                -n $nameserver
        elif [[ $# -eq 5 ]]
        then
								echo "INFO: Skip Database creation"
        else
                echo "ERROR: Database credentials are needed for install operation"
                exit 1
        fi
fi

echo "Test deployment script"
createDatabase="false"

helm upgrade  --install $subdomain-backend simpleaccounts-backend-java/$helmDir --values simpleaccounts-backend-java/$helmDir/values.yaml \
--set simpleAccountsBackendRelease=$SVrelease \
--set image.repository.backend.tag=$SVrelease \
--set simpleAccountsHost=https://$subdomain-api.$maindomain \
--set database.simpleAccountsDB=$database \
--set fullnameOverride=$subdomain-backend \
--set serviceAccount.name=$subdomain-deploy-robot-backend \
--set ports.containerPort.backendPort=8080 \
--set service.port=80 \
--set ingress.hosts[0].host=$subdomain-api.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set ingress.tls[0].hosts[0]=$subdomain-api.$maindomain \
--set ingress.tls[0].secretName=wildcard-app-simpleaccounts-io-tls \
--set database.enabled=$createDatabase \
--set data.dbhost=$base64_dbhost \
--set data.username=$base64_username \
--set data.password=$base64_password \
-n $nameserver \
--dry-run --debug --wait

echo "Deploying the scripts"

helm upgrade  --install $subdomain-backend simpleaccounts-backend-java/$helmDir --values simpleaccounts-backend-java/$helmDir/values.yaml \
--set simpleAccountsBackendRelease=$SVrelease \
--set image.repository.backend.tag=$SVrelease \
--set simpleAccountsHost=https://$subdomain-api.$maindomain \
--set database.simpleAccountsDB=${database//-/_} \
--set fullnameOverride=$subdomain-backend \
--set serviceAccount.name=$subdomain-deploy-robot-backend \
--set ports.containerPort.backendPort=8080 \
--set service.port=80 \
--set ingress.hosts[0].host=$subdomain-api.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set ingress.tls[0].hosts[0]=$subdomain-api.$maindomain \
--set ingress.tls[0].secretName=wildcard-app-simpleaccounts-io-tls \
--set database.enabled=$createDatabase \
--set data.dbhost=$base64_dbhost \
--set data.username=$base64_username \
--set data.password=$base64_password \
-n $nameserver \
--wait --debug

echo "Deployment done"
