#!/bin/bash
export LD_LIBRARY_PATH=/home/secux/pufservices/pufs_c_lib/fw/bin

# Start the ts-node application
/usr/bin/ts-node /home/secux/pufservices/pufs_express_server.ts >> /home/secux/ts-node-app.log 2>&1

