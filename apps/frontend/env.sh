#!/bin/bash

# Determine output directory (public for Vite dev server, current dir for production)
OUTPUT_DIR="${OUTPUT_DIR:-public}"
OUTPUT_FILE="${OUTPUT_DIR}/env-config.js"

# Recreate config file
rm -rf "${OUTPUT_FILE}"
mkdir -p "${OUTPUT_DIR}"
touch "${OUTPUT_FILE}"

# Add assignment
echo "window._env_ = {" >> "${OUTPUT_FILE}"

# Read each line in .env file (if it exists)
if [ -f .env ]; then
  while read -r line || [[ -n "$line" ]];
  do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Split env variables by character `=`
    if printf '%s\n' "$line" | grep -q -e '='; then
      varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
      varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
    fi

    # Read value of current variable if exists as Environment variable
    if [ -n "$varname" ]; then
      value=$(eval echo "\$$varname" 2>/dev/null)
    fi
    # Otherwise use value from .env file
    [[ -z $value ]] && value=${varvalue}

    # Append configuration property to JS file
    echo "  $varname: \"$value\"," >> "${OUTPUT_FILE}"
  done < .env
else
  # If no .env file, create empty config with default values
  echo "  SIMPLEACCOUNTS_HOST: \"\"," >> "${OUTPUT_FILE}"
  echo "  SIMPLEACCOUNTS_RELEASE: \"\"," >> "${OUTPUT_FILE}"
  echo "  SIMPLE_SERVICES_HOST: \"\"," >> "${OUTPUT_FILE}"
  echo "  SIMPLE_SERVICES_GET_SUBSCRIPTION_KEY: \"\"," >> "${OUTPUT_FILE}"
fi

echo "}" >> "${OUTPUT_FILE}"
