const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql')
//const logger = require('./logMaster')
const dotenv = require('dotenv').config({ path: './class/sql.env' })
const app = express()
const PORT = process.env.PORT || 5080 //must for production environmentnpm install dotenv --save

//must use body parser for decoding the params from the url
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

//database connection

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

//for gettng connection stutus
pool.getConnection((err, connection) => {
    if (err) {
        console.log(err)
        //logger.debug("databas is not connected");
        logger.error(err);
    } else {
        console.log("database connection estblished sucessfully!!!")
        //logger.info("database connection estblished sucessfully");

    }
});

//index-sat-files
app.use(express.static('PUBLIC'))
app.use('/PUBLIC', express.static(__dirname + 'PUBLIC/index.css'))
app.use('/PUBLIC', express.static(__dirname + 'PUBLIC/index.js'))
app.use('/PUBLIC', express.static(__dirname + 'PUBLIC/modules/apiEngin.js'))
app.use('/PUBLIC', express.static(__dirname + 'PUBLIC/class/config.js'))
app.use('/PUBLIC', express.static(__dirname + 'PUBLIC/modules/error_dec.js'))
app.use('/PUBLIC', express.static(__dirname + 'PUBLIC/modules/logger.js'))

//js config file
app.use('/bin', express.static(__dirname + 'PUBLIC/bin/config.js'))

//general routes
app.get('', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')

});

//error visulisation route
app.get('/errorData', (req, res) => {
    
    //ruele check
    pool.getConnection((err, connection) => {
       if (err) {
           logger.error(err);
       }
       console.log(`connected id ${connection.threadId}`);
       const param = req.body
       //const label_max = param.master_label

       connection.query('SELECT Level_one_name,Level_two_name,Level_three_name,Level_four_name,value_one,value_two,value_three,value_four FROM error_description where  error_code = "MXPER"', (err, rows) => {

        if (!err) {
            
           //let data = RowDataPacket[0].parameter_value

            res.send(rows)
            console.log(rows)
            ar = JSON.parse(JSON.stringify(rows))
            console.log(ar[0].Level_one_name)
            

        } else {
            res.send(err)

            
        }

       });
       //res.send("ok")
   });
   
});

//error report route
app.get('/errorReport/:tred', (req, res) => {
    

    let param = req.params
    let node = req.params.tred

    //ruele check
    pool.getConnection((err, connection) => {
       if (err) {
           logger.error(err);
       }
       console.log(`connected id ${connection.threadId}`);
       const param = req.body
       //const label_max = param.master_label

       connection.query('SELECT managed_connection,Connection_reset_by_peer,timed_out,	Closed_Connection FROM error_report ORDER BY create_time DESC LIMIT ' + node +'', (err, rows) => {

        if (!err) {
            
           //let data = RowDataPacket[0].parameter_value

            res.send(rows)
            //console.log(rows)
            ar = JSON.parse(JSON.stringify(rows))
            console.log(ar[0])
            

        } else {
            res.send(err)

            
        }

       });
       //res.send("ok")
   });
   
});


//error report route
app.get('/appReport/:tred', (req, res) => {
    

    let param = req.params
    let node = req.params.tred

    //ruele check
    pool.getConnection((err, connection) => {
       if (err) {
           logger.error(err);
       }
       console.log(`connected id ${connection.threadId}`);
       const param = req.body
       //const label_max = param.master_label

       connection.query('SELECT tps_count,disk_space,db_connection FROM application_statics ORDER BY create_time DESC LIMIT ' + node +'', (err, rows) => {

        if (!err) {
            
           //let data = RowDataPacket[0].parameter_value

            res.send(rows)
            //console.log(rows)
            ar = JSON.parse(JSON.stringify(rows))
            console.log(ar[0])
            

        } else {
            res.send(err)

            
        }

       });
       //res.send("ok")
   });
   
});

//error report route
app.get('/log', (req, res) => {
    

    let param = req.params
    let node = req.params.tred

    //ruele check
    pool.getConnection((err, connection) => {
       if (err) {
           logger.error(err);
       }
       console.log(`connected id ${connection.threadId}`);
       const param = req.body
       //const label_max = param.master_label

       connection.query('SELECT log_line FROM logger ', (err, rows) => {

        if (!err) {
            
           //let data = RowDataPacket[0].parameter_value

            res.send(rows)
            //console.log(rows)
            ar = JSON.parse(JSON.stringify(rows))
            console.log(ar[0])
            

        } else {
            res.send(err)

            
        }

       });
       //res.send("ok")
   });
   
});

//app.listen(port, "Started sucessfully");
app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})