#from crypt import methods
from distutils.log import debug
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import base64
from flask import Flask, jsonify, request
from flask_mysqldb import MySQL
from flask_cors import CORS
import random
import os

app = Flask(__name__)
CORS(app)

#Data base connection
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'mxpc_master'
 
mysql = MySQL(app)


@app.route("/errorAdapter" , methods = ['POST'])
def data():
    
    label_arry= []
    fixing_flag = False
    socket_data = request.get_json()

    base64String = socket_data['error_string']
    encoded_b64 = base64.b64decode(base64String)

    tps=int(socket_data['tps_value'])
    disk_space=int(socket_data['disk_space'])
    db_connection=int(socket_data['db_connection'])

    #insering appllication parameters in table
    log=" INFO | System got %s as tps and %s as disk space and %s as present DB connections"%(tps,disk_space,db_connection)
    cursor = mysql.connection.cursor()
    cursor.execute(" TRUNCATE TABLE logger")
    cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
    cursor.execute(" INSERT INTO application_statics (dummy,tps_count,disk_space,db_connection) VALUES('10','%s','%s','%s')"%(tps,disk_space,db_connection))
    mysql.connection.commit()
    
    #assining new lable for new custommer
    file1 = open("logSample.txt", "w")  
    file1.write(str(encoded_b64))
    file1.close() 

    file = open("logSample.txt", "r")
    input= file.read()
    file.close()
    
    #call the model
    model = SentenceTransformer('all-MiniLM-L6-v2')

    #labels
    ref_manged_connection="Java is not able to get managed connection. It throws a ResourceException. The error due to the application not able to get No managed connections available within configured blocking timeout"
    ref_connection_peer="Peer has reset the connection. The error is related to sending to ResponseServlet. It is a HTTP error. It is due to the host close the soket for the sender"
    ref_closed_connection="it is a sql exception. Java unable to get new connection so the application thrown closed connection error. Also this error can be found on java class io.undertow.server.Connectors.executeRootHandler. It can be found on Connectors.java:364. The main java class of this error is ServletInitialHandler.java:104"
    ref_connection_time_out="Connection timed out. It throws SQLRecoverableException:. Also the error occuring on java class oracle.jdbc.driver.T4CPreparedStatement.executeForDescribe"

    sentance_vector = model.encode(input)
    sentance_vector=sentance_vector.reshape(1, -1)

    ref_vector_maneged_connection = model.encode(ref_manged_connection)
    ref_vector_maneged_connection = ref_vector_maneged_connection.reshape(1, -1)

    ref_vector_connection_peer = model.encode(ref_connection_peer)
    ref_vector_connection_peer = ref_vector_connection_peer.reshape(1, -1)

    ref_vector_closed_connection = model.encode(ref_closed_connection)
    ref_vector_closed_connection = ref_vector_closed_connection.reshape(1, -1)

    ref_vector_connection_timeout = model.encode(ref_connection_time_out)
    ref_vector_connection_timeout = ref_vector_connection_timeout.reshape(1, -1)

    total_sum=0

    out_manged_connection = cosine_similarity(sentance_vector,ref_vector_maneged_connection)
    print(out_manged_connection[0])
    if out_manged_connection[0][0] > .6:

        label_arry.append([out_manged_connection[0][0],"managed connection"])

        log=" INFO | System detected managed connection error in sample logs"
        cursor = mysql.connection.cursor()
        cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
        mysql.connection.commit()

        total_sum = total_sum + out_manged_connection[0][0]
    
    out_connection_peer = cosine_similarity(sentance_vector,ref_vector_connection_peer)
    print(out_connection_peer[0])
    if out_connection_peer > .6:

        label_arry.append([out_connection_peer[0][0],"Connection reset by peer"])

        log=" INFO | Connection reset by peer error in sample logs"
        cursor = mysql.connection.cursor()
        cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
        mysql.connection.commit()

        total_sum = total_sum + out_connection_peer[0][0]
    
    out_closed_connection = cosine_similarity(sentance_vector,ref_vector_closed_connection)
    print(out_closed_connection[0])
    if out_closed_connection > .6:
        label_arry.append([out_closed_connection[0][0],"Closed Connection"])

        log=" INFO | System detected Closed connection error in sample logs"
        cursor = mysql.connection.cursor()
        cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
        mysql.connection.commit()

        total_sum = total_sum + out_closed_connection[0][0]

    out_connection_time_out = cosine_similarity(sentance_vector,ref_vector_connection_timeout)
    print(out_connection_time_out[0])
    if out_connection_time_out >.6:
        label_arry.append([out_connection_time_out[0][0],"timed out"])

        log=" INFO | System detected timed out erro in sample logs"
        cursor = mysql.connection.cursor()
        cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
        mysql.connection.commit()

        total_sum = total_sum + out_connection_time_out[0][0]

    print(label_arry)
    print("-----------------------------------------------------------")
    label_arry = sorted(label_arry,key = lambda x: x[0], reverse = True)
    print(label_arry)

    #Action plans
    count = len(label_arry)
    middle_name_array=["one","two","three","four"]

    n = random.randint(0,1000)
    cursor = mysql.connection.cursor()
    cursor.execute(" INSERT INTO error_report (dummy) VALUES('%s')"%n)
    cursor.execute(" TRUNCATE TABLE error_description")
    cursor.execute(" INSERT INTO error_description (error_code) VALUES('MXPER')")
    mysql.connection.commit()
    

    #master loop
    for i in range(count):
        err = label_arry[i][1]
        perct_value=int((label_arry[i][0]/total_sum * 100))

        cursor = mysql.connection.cursor()
        cursor.execute(" UPDATE error_description  SET Level_%s_name = '%s' " %(middle_name_array[i] ,err))
        cursor.execute(" UPDATE error_description  SET value_%s = '%s' " %(middle_name_array[i] ,perct_value))
        mysql.connection.commit()
        cursor.close()

        if err == "managed connection":
            
            cursor = mysql.connection.cursor()
            cursor.execute(" UPDATE error_report  SET managed_connection = '1' where dummy = %s"%n)
            mysql.connection.commit()

            if i < 2:
                print("Action plan -1")
                #getting label max from data base
                log=" INFO | System detected as managed connection error in priority level."

                cursor = mysql.connection.cursor()
                cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                mysql.connection.commit()

                cursor = mysql.connection.cursor()
                cursor.execute(''' SELECT data_base_connection FROM dummy_application_parameter ''')
                #mysql.connection.commit()
                #cursor.close()
                row_headers=[x[0] for x in cursor.description]
                row = cursor.fetchall()
                json_data=[]
                for result in row:
                    json_data.append(dict(zip(row_headers,result)))
                    print(json_data[0]['data_base_connection'])

                configured_connection = int(json_data[0]['data_base_connection'])

                if db_connection > configured_connection:

                    new_connection = ( db_connection - configured_connection ) + 10
                    new_cofig_connction = configured_connection + new_connection

                    log=" INFO | We observed that the configured connection is %s and this is not enough for the application in the moment so we calculate and reconfigured the value to %s"%(configured_connection,new_cofig_connction)

                    cursor = mysql.connection.cursor()
                    cursor.execute(" UPDATE dummy_application_parameter  SET data_base_connection = '%s'" %new_cofig_connction)
                    cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                    mysql.connection.commit()

                    fixing_flag = True
                else:
                    fixing_flag = True

                    log=" INFO | System detected the configured value of db connection is enough for the application in this moment. But it may be the application is on lagging condition so we are raising request for restarting the apllication right now."
                    cursor = mysql.connection.cursor()
                    cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                    mysql.connection.commit()

        elif err == "Connection reset by peer":

            cursor = mysql.connection.cursor()
            cursor.execute(" UPDATE error_report  SET Connection_reset_by_peer = '1' where dummy = %s"%n)
            mysql.connection.commit()

            if i < 2:
                print("Action plan -2")
                 #getting label max from data base
                log=" INFO | System detected as Connection reset by peer error in priority level."

                cursor = mysql.connection.cursor()
                cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                mysql.connection.commit()

                
                cursor = mysql.connection.cursor()
                cursor.execute(''' SELECT tps_limit FROM dummy_application_parameter ''')
                #mysql.connection.commit()
                #cursor.close()
                row_headers=[x[0] for x in cursor.description]
                row = cursor.fetchall()
                json_data=[]
                for result in row:
                    json_data.append(dict(zip(row_headers,result)))
                    print(json_data[0]['tps_limit'])

                configured_tps = json_data[0]['tps_limit']
                if tps > configured_tps:

                    new_tps = ( tps - configured_tps) + 10
                    new_configurd_tps =configured_tps + new_tps

                    log=" INFO | We observed that the configured connection is %s and this is not enough for the application in the moment so we calculate and reconfigured the value to %s"%(configured_tps,new_configurd_tps)

                    cursor = mysql.connection.cursor()
                    cursor.execute(" UPDATE dummy_application_parameter  SET tps_limit = '%s'" %new_configurd_tps)
                    cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                    mysql.connection.commit()

                    fixing_flag=True
                else:
                    fixing_flag = True

                    log=" INFO | System detected the configured value of TPS is enough for the application in this moment. But it may be the application is on lagging condition so we are raising request for restarting the apllication right now."
                    cursor = mysql.connection.cursor()
                    cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                    mysql.connection.commit()
        
        elif err == "Closed Connection":
            cursor = mysql.connection.cursor()
            cursor.execute(" UPDATE error_report  SET Closed_Connection = '1' where dummy = %s "%n)
            mysql.connection.commit()

            if i < 2:
                print("Action plan -3")
                fixing_flag = True

                log=" INFO | System detected that Closed connection error is occured in Apllication. This is may be due to the application is lagging on this moment. So we are just raising request for restarting the application NOTE:look error report for other informations"
                cursor = mysql.connection.cursor()
                cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                mysql.connection.commit()

                
        
        elif err == "timed out":
            cursor = mysql.connection.cursor()
            cursor.execute(" UPDATE error_report  SET timed_out = '1' where dummy = %s "%n)
            mysql.connection.commit()

            if i < 2:
                print("Action plan -4")
                fixing_flag = True
                log=" INFO | System detected that timed out error is occured in Apllication. This is may be due to the application is lagging on this moment. So we are raising request to restarting the application NOTE:look error report for other informations"
                cursor = mysql.connection.cursor()
                cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
                mysql.connection.commit()

    #resatrt the application    
    if fixing_flag:
        print("call restart script")

        # restartScript="applcation/bin"

        # cmd_1= 'cd $restartScript'
        # os.system(cmd_1)
        # cmd_2="./Restart.sh"
        # os.system(cmd_2)

        log=" INFO | System detected some changs done by the MXPlusC inteligent drive part of error fixing . So we are restarting the application"
        cursor = mysql.connection.cursor()
        cursor.execute(" INSERT INTO logger (dummy,log_line) VALUES('10','%s')"%log)
        mysql.connection.commit()

    return jsonify({"status":"ok"})

app.run(host="0.0.0.0",port=5000,debug = True)
# app.run(debug = True)