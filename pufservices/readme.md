. lanuch admin right via "sudo Virtualbox" from command line
. to transfer the entire folder to ubuntu server 
. to run the service under superuser mode e.g. sudo su 
. export LD_LIBRARY_PATH=/home/secux/pufservices/pufs_c_lib/fw/bin .. this is to provide the path where the so library are located to be loaded for ffi-napi 

. cd pufservices 
add LD_LIBARAY_PATH to so at root  .bashrc
. sudo nano /etc/systemd/system/start-pufs-express-server.service
sudo systemctl enable start-pufs-express-server
sudo systemctl start start-pufs-express-server
sudo systemctl status start-pufs-express-server
sudo journalctl --rotate
sudo journalctl --vacuum-time=1s
sudo journalctl -u start-pufs-express-server.service