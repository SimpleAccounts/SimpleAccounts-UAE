#!/bin/bash
#
# Prarameters
# 1 - install or upgrade operation
# 2 - subdomain name for SimpleAccounts installation
# 3 - SimpleAccounts docker image version (Frontend)
# End of parameters
#
if [ "$1" != "install" ] && [ "$1" != "upgrade" ]
then
        echo "ERROR: Wrong operation"
        exit 1
elif [[ $# != 3 ]]
then
        echo "ERROR: Wrong number of argumeents"
        exit 1
fi

echo "Start SimpleAccounts $1 for $2:$3"

nameserver="simpleaccounts-app"
maindomain="app.simpleaccounts.io"
subdomain="$2"
helmDir="simpleaccounts-frontend"
SVrelease="$3"
database="sa_${subdomain//-/_}_db"
createDatabase="false"

echo "Test deployment script"

helm upgrade --install $subdomain-frontend simplevat-frontend-reactjs/$helmDir --values simplevat-frontend-reactjs/$helmDir/values.yaml \
--set simpleVatFrontendRelease=$SVrelease \
--set image.repository.frontend.tag=$SVrelease \
--set simpleVatHost=https://$subdomain-api.$maindomain \
--set fullnameOverride=$subdomain-frontend \
--set serviceAccount.name=$subdomain-deploy-robot-frontend \
--set ports.containerPort.frontendPort=80 \
--set service.port=80 \
--set ingress.hosts[0].host=$subdomain.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set ingress.tls[0].hosts[0]=$subdomain-api.$maindomain \
--set ingress.tls[0].hosts[1]=$subdomain.$maindomain \
--set ingress.tls[0].secretName=wildcard-app-simpleaccounts-io-tls \
--set database.enabled=$createDatabase \
-n $nameserver \
--dry-run --debug --wait

echo "Deploying the scripts"

helm upgrade --install $subdomain-frontend simplevat-frontend-reactjs/$helmDir --values simplevat-frontend-reactjs/$helmDir/values.yaml \
--set simpleVatFrontendRelease=$SVrelease \
--set image.repository.frontend.tag=$SVrelease \
--set simpleVatHost=https://$subdomain-api.$maindomain \
--set fullnameOverride=$subdomain-frontend \
--set serviceAccount.name=$subdomain-deploy-robot-frontend \
--set ports.containerPort.frontendPort=80 \
--set service.port=80 \
--set ingress.hosts[0].host=$subdomain.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set ingress.tls[0].hosts[0]=$subdomain-api.$maindomain \
--set ingress.tls[0].hosts[1]=$subdomain.$maindomain \
--set ingress.tls[0].secretName=wildcard-app-simpleaccounts-io-tls \
--set database.enabled=$createDatabase \
-n $nameserver \
--wait --debug

echo "Deployment done"
