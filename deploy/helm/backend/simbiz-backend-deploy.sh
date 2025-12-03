#!/bin/bash
#
# Prarameters
# 1 - install or upgrade operation
# 2 - subdomain name for SimpleAccounts installation
# 3 - SimpleAccounts docker image version (Backend)
# 4 - SimpleAccounts database password
# End of parameters
#
source set-env.sh
if [ "$1" != "install" ] && [ "$1" != "upgrade" ]
then
        echo "ERROR: Wrong operation $1"
        exit 1
#elif [ $# != 3 ] && [ $# != 4 ] && [ $# != 5 ]
#then
#        echo "ERROR: Wrong number of argumeents"
#        exit 1
fi

echo "Deploy SimpleAccounts $1 for $2:$3"

clusterIssuer="ae-simbiz-app-letsencrypt-prod"
nameserver="$2"
maindomain="ae.simbiz.app"
subdomain="$2"
secretName="$subdomain-backend-ae-simbiz-app-tls"
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

dbhost="$DB_SERVER"
username="${database}_user"
password="$4"
base64_dbhost=$(echo -n ${dbhost} | base64)
base64_username=$(echo -n ${username}'@sa-prod-db' | base64)
base64_password=$(echo -n ${password} | base64)

if [[ $1 = "install" ]]
then
        if [[ $# -eq 4 ]]
        then
                echo "Creating a database & User"
                createDatabase="true"
                kubectl run mysql-client --image=mysql:5.7 -it --rm --restart=Never -- mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "CREATE DATABASE ${database};"
                kubectl run mysql-client --image=mysql:5.7 -it --rm --restart=Never -- mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "CREATE USER ${username}@'%' IDENTIFIED BY '${password}';"
                kubectl run mysql-client --image=mysql:5.7 -it --rm --restart=Never -- mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "GRANT ALL PRIVILEGES ON ${database}.* TO ${username}@'%';"
                kubectl run mysql-client --image=mysql:5.7 -it --rm --restart=Never -- mysql -u "$ADMIN_USER" -p"$ADMIN_PASS" -h "$DB_SERVER" -e "FLUSH PRIVILEGES;"
                echo "Database & User created."

#                kubectl create secret generic db-credentials-$subdomain-backend \
#                --from-literal=db-host=simpleaccounts-db-prod.mysql.database.azure.com \
#                --from-literal=username=${username}@simpleaccounts-db-prod --from-literal=password=${password} \
#                -n $nameserver
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
--set image.repository.backend.imageName=simpleaccounts.azurecr.io/simpleaccounts-backend \
--set maindomain=$subdomain-api.$maindomain \
--set simpleAccountsHost=https://$subdomain-api.$maindomain \
--set database.simpleAccountsDB=$database \
--set fullnameOverride=$subdomain-backend \
--set serviceAccount.name=$subdomain-deploy-robot-backend \
--set ingress.hosts[0].host=$subdomain-api.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set clusterIssuer=$clusterIssuer \
--set ingress.annotations."cert-manager\.io/clusterissuer"=ae-simbiz-app-letsencrypt-prod \
--set ingress.tls[0].secretName=$secretName \
--set ingress.tls[0].hosts[0]=$subdomain-api.$maindomain \
--set data.dbhost=$base64_dbhost \
--set data.username=$base64_username \
--set data.password=$base64_password \
--dry-run --debug --namespace $nameserver --create-namespace --wait

echo "Deploying the scripts"

helm upgrade  --install $subdomain-backend simpleaccounts-backend-java/$helmDir --values simpleaccounts-backend-java/$helmDir/values.yaml \
--set simpleAccountsBackendRelease=$SVrelease \
--set image.repository.backend.tag=$SVrelease \
--set image.repository.backend.imageName=simpleaccounts.azurecr.io/simpleaccounts-backend \
--set maindomain=$subdomain-api.$maindomain \
--set simpleAccountsHost=https://$subdomain-api.$maindomain \
--set database.simpleAccountsDB=$database \
--set fullnameOverride=$subdomain-backend \
--set serviceAccount.name=$subdomain-deploy-robot-backend \
--set ingress.hosts[0].host=$subdomain-api.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set clusterIssuer=$clusterIssuer \
--set ingress.annotations."cert-manager\.io/clusterissuer"=ae-simbiz-app-letsencrypt-prod \
--set ingress.tls[0].secretName=$secretName \
--set ingress.tls[0].hosts[0]=$subdomain-api.$maindomain \
--set data.dbhost=$base64_dbhost \
--set data.username=$base64_username \
--set data.password=$base64_password \
--namespace $nameserver --create-namespace --wait

echo "Deployment done"
