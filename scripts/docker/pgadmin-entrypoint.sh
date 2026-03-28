#!/bin/sh
set -e

cat > /tmp/servers.json <<EOF
{
  "Servers": {
    "1": {
      "Name": "AssetFlow Local DB",
      "Group": "Servers",
      "Host": "db",
      "Port": 5432,
      "MaintenanceDB": "${POSTGRES_DB:-assetflow}",
      "Username": "${POSTGRES_USER:-assetflow}",
      "SSLMode": "prefer"
    }
  }
}
EOF

exec /entrypoint.sh
