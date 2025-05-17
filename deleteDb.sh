#!/bin/bash

if [ $# -eq 0 ]; then
  echo "Error: No database name provided"
  echo "Usage: $0 <database_folder_name> [path]"
  exit 1
fi

DB_FOLDER="$1"
if [ -z "$(echo "$DB_FOLDER" | tr -d '[:space:]')" ]; then
  echo "Error: Database folder name cannot be empty"
  echo "Usage: $0 <database_folder_name> [path]"
  exit 1
fi

DB_PATH="${2:-./db-data}"

DB_FOLDER_PATH="${DB_PATH}/${DB_FOLDER}"

if [ -d "$DB_FOLDER_PATH" ]; then
  rm -rf "$DB_FOLDER_PATH"
  echo "Database folder at $DB_FOLDER_PATH deleted."
else
  echo "Database folder at $DB_FOLDER_PATH does not exist."
fi

echo "Database cleanup completed for $DB_FOLDER." 