#!/bin/bash
# wait-for-services.sh

set -e

services="$@"
until nc -z $services; do
  >&2 echo "Service is unavailable - sleeping"
  sleep 1
done

>&2 echo "Service is up - executing command"
exec $cmd