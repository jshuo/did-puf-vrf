#!/bin/bash

# need to chmod +x /home/secux/pufservices/start-pufs-express-server.sh

# Start the ts-node application
/usr/bin/ts-node /home/secux/pufservices/pufs_express_server.ts >> /home/secux/ts-node-app.log 2>&1

