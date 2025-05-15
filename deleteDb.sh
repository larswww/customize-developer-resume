#!/bin/bash

# Check if a database name was provided
if [ $# -eq 0 ]; then
  echo "Error: No database name provided"
  echo "Usage: $0 <database_name> [path]"
  exit 1
fi

DB_NAME="$1"
DB_PATH="${2:-./db-data}"

# Full path to the database files
XT="${DB_PATH}/${DB_NAME}"
DB_FILE="${DB_PATH}/${DB_NAME}.db"
DB_SHM="${DB_PATH}/${DB_NAME}.db-shm"
DB_WAL="${DB_PATH}/${DB_NAME}.db-wal"

if [ ! -d "$XT" ]; then
    rm "$XT"
    echo "Database at $XT deleted."
else 
    echo "Database at $XT does not exist."
fi

# Delete the main database file if it exists
if [ -f "$DB_FILE" ]; then
  rm "$DB_FILE"
  echo "Database file at $DB_FILE deleted."
else
  echo "Database file at $DB_FILE does not exist."
fi

# Delete the SHM file if it exists
if [ -f "$DB_SHM" ]; then
  rm "$DB_SHM"
  echo "SHM file at $DB_SHM deleted."
fi

# Delete the WAL file if it exists
if [ -f "$DB_WAL" ]; then
  rm "$DB_WAL"
  echo "WAL file at $DB_WAL deleted."
fi

echo "Database cleanup completed for $DB_NAME." 