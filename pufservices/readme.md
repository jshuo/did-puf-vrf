# PUF Services Setup Guide

This guide provides step-by-step instructions to set up and run the PUF services on an Ubuntu server.

## Prerequisites

- Ensure you have `VirtualBox` installed and have administrative rights to launch it.
- Transfer the entire PUF services folder to the Ubuntu server.

## Steps

1. **Launch VirtualBox with Admin Rights**
  ```sh
  sudo VirtualBox
  ```

2. **Run the Service Under Superuser Mode**
  ```sh
  sudo su
  ```

3. **Set the Library Path**
  Export the `LD_LIBRARY_PATH` to provide the path where the shared object libraries are located for `ffi-napi`.
  ```sh
  export LD_LIBRARY_PATH=/home/secux/pufservices/pufs_c_lib/fw/bin
  ```

4. **Configure Dynamic Linker Run-time Bindings**
  - Create a configuration file `pufsc.conf` under `/etc/ld.so.conf.d`.
  - Add the following line to `pufsc.conf`:
    ```sh
    /home/secux/pufservices/pufs_c_lib/fw/bin
    ```
  - Run `ldconfig` to update the bindings.
    ```sh
    sudo ldconfig
    ```

5. **Create a Systemd Service**
  - Open or create the service file:
    ```sh
      sudo nano /etc/systemd/system/start-pufs-express-server.service
    ```

    [Unit]
    Description=pufs Service App
    After=network.target

    [Service]
    ExecStart=/home/secux/pufservices/start-pufs-express-server.sh
    WorkingDirectory=/home/secux/pufservices
    Restart=always
    User=root
    Group=root
    [Install]
    WantedBy=multi-user.target

## Besu service: 

    sudo nano /etc/systemd/system/start-besu.service

    [Unit]
    Description=Hyperledger Besu App
    After=network.target

    [Service]
    ExecStart=/bin/bash /home/secux/besu/node1/launch.sh
    WorkingDirectory=/home/secux/besu/node1
    Restart=always
    User=secux
    Group=secux


    Environment="PATH=/home/secux/besu/besu-24.10.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"

    [Install]
    WantedBy=multi-user.target


6. **Make the Startup Script Executable**
  ```sh
  chmod +x /home/secux/pufservices/start-pufs-express-server.sh
  ```

7. **Enable and Start the Systemd Service**
  ```sh
  sudo systemctl enable start-pufs-express-server
  sudo systemctl start start-pufs-express-server
  ```

8. **Check the Status of the Service**
  ```sh
  sudo systemctl status start-pufs-express-server
  ```

9. **Manage Journal Logs**
  - Rotate the journal logs:
    ```sh
    sudo journalctl --rotate
    ```
  - Vacuum the journal logs to free up space:
    ```sh
    sudo journalctl --vacuum-time=1s
    ```
  - View the logs for the specific service:
    ```sh
    sudo journalctl -u start-pufs-express-server.service
    ```

By following these steps, you should be able to set up and run the PUF services on your Ubuntu server successfully.
