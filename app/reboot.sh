#!/bin/bash 
# à créer une 2 ème ligne s'il y a un 2ème routeur et changer l'ip
sshpass -f /home/monitor/monitor/.pass ssh -o StrictHostKeyChecking=no admin@192.168.88.180 "system reboot"
