#!/bin/bash

#params
application_log_path=/home/nguser/NG_MNGR/NG_BL_01
bin_path=
Db_ip=172.16.212.11:1521
file_name=application.log

cd $application_log_path

#finding pid of application
pid=`ps -Aef | grep java | grep $bin_path | grep -v grep | awk '{print $2}'`

#current DB connections
db_connections=`netstat -antp 2>/dev/null | grep "${pid}/" | awk '$5 ~ /'${Db_ip}'$/ {print $0}' | wc -l`
#current TPS
tps=`grep -i "JSON request received from Host" LOG_NGBL_01.log | cut -c2-20 | sort -rn | uniq -c | sort -rn | he
ad -n1 | awk 'FNR==1{print $1}'`
#Disk space value
actual_value_space=`df -h  /dev/xvda1  | awk 'FNR==2{print $5}'  |tr -d '%'`
#error string
error_string=`rep 'Exception' LOG_NGBL_0*log | grep -v 'Exception calling MessageExpanstionBO' | grep -v 'isException: false' > er.txt`

#conveting error string to base 64 content
base64SerrorString=`base64 er.txt`

#macking request packet
req_packet='{
    "request_id":"'${RANDOM}'00'${RANDOM}'",
    "tps_value":"'$tps'",
    "disk_space":"'$actual_value_space'",
    "db_connection":"'$db_connections'",
    "error_string":"'$base64SerrorString'"
}'

echo $req_packet > req.json

#sending request tor error adapter
curl -u OoredooUser:NGWP@Ooredoo#123 -i -H "Content-Type: application/json Accept:application/json" -d @req.json http://192.168.1.6:5000/errorAdapter