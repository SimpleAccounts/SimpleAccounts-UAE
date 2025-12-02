#!/bin/bash

new_release=$1
echo "Executing $0 to upgrade helm releases with version $new_release"
helm list -n simpleaccounts-app | grep '\-backend' > rc.txt

i=0
while read line
do
	rc=($line)

	domain="$(sed 's/\(-backend$\)//' <<< "$rc")"
	echo "Upgrading Helm Release $domain with version $new_release"

	simplevat-backend-java/simpleaccounts-backend/simpleaccounts-backend.sh upgrade $domain $new_release
	echo "Helm Release $domain upgraded"

  i=$((i+1))
done < rc.txt

#rm rc.txt
echo "All Helm Release Successfully Upgraded to Version $new_release."
