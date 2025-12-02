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

echo "Deploy SimpleAccounts $1 for $2:$3"

clusterIssuer="ae-simbiz-app-letsencrypt-prod"
nameserver="$2"
maindomain="ae.simbiz.app"
subdomain="$2"
secretName="$subdomain-frontend-ae-simbiz-app-tls"
helmDir="simpleaccounts-frontend"
SVrelease="$3"
database="sa_${subdomain//-/_}_db"
createDatabase="false"

echo "Test deployment script"

helm upgrade --install $subdomain-frontend simplevat-frontend-reactjs/$helmDir --values simplevat-frontend-reactjs/$helmDir/values.yaml \
--set simpleVatFrontendRelease=$SVrelease \
--set image.repository.frontend.tag=$SVrelease \
--set image.repository.frontend.imageName=simpleaccounts.azurecr.io/simpleaccounts-frontend \
--set maindomain=$subdomain.$maindomain \
--set simpleVatHost=https://$subdomain-api.$maindomain \
--set fullnameOverride=$subdomain-frontend \
--set serviceAccount.name=$subdomain-deploy-robot-frontend \
--set ingress.hosts[0].host=$subdomain.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set clusterIssuer=$clusterIssuer \
--set ingress.annotations."cert-manager\.io/clusterissuer"=ae-simbiz-app-letsencrypt-prod \
--set ingress.tls[0].secretName=$secretName \
--set ingress.tls[0].hosts[0]=$subdomain.$maindomain \
--dry-run --debug --namespace $nameserver --create-namespace --wait

echo "Deploying the scripts"

helm upgrade --install $subdomain-frontend simplevat-frontend-reactjs/$helmDir --values simplevat-frontend-reactjs/$helmDir/values.yaml \
--set simpleVatFrontendRelease=$SVrelease \
--set image.repository.frontend.tag=$SVrelease \
--set image.repository.frontend.imageName=simpleaccounts.azurecr.io/simpleaccounts-frontend \
--set maindomain=$subdomain.$maindomain \
--set simpleVatHost=https://$subdomain-api.$maindomain \
--set fullnameOverride=$subdomain-frontend \
--set serviceAccount.name=$subdomain-deploy-robot-frontend \
--set ingress.hosts[0].host=$subdomain.$maindomain \
--set ingress.hosts[0].paths[0]="/*" \
--set clusterIssuer=$clusterIssuer \
--set ingress.annotations."cert-manager\.io/clusterissuer"=ae-simbiz-app-letsencrypt-prod \
--set ingress.tls[0].secretName=$secretName \
--set ingress.tls[0].hosts[0]=$subdomain.$maindomain \
--namespace $nameserver --create-namespace --wait

echo "Deployment done"
