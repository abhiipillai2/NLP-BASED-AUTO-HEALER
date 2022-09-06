dataMaster = []
labelMaster = []

dataE001=[]
dataE002=[]
dataE003=[]
dataE004=[]

const errorPiGraph = () => {
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labelMaster,
            datasets: [{
                label: 'Errors',
                data: dataMaster,
                backgroundColor: [
                    '#F21C04',
                    '#EAED00',
                    '#09A086',
                    '#1507A5',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

}
errorPiGraph()

const errorReportGraph = () =>{
    const ctx2 = document.getElementById('errorReporChart').getContext('2d');
    const myChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['15', '30', '45','60','75','90','105'],
            datasets: [{
                label: 'managed connection',
                data: dataE001,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            },{
                label: 'Connection reset by peer',
                data: dataE002,
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.1
            },{
                label: 'timed out',
                data: dataE003,
                fill: false,
                borderColor: 'rgba(255, 206, 86, 1)',
                tension: 0.1
            },{
                label: 'Closed Connection',
                data: dataE004,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

errorReportGraph()

//-------------------------------------processing---part--------------------------------//

const loadingFunction = () => {
    sendHttpRequest('GET', node_http_root + '/errorData').then(responseData => {

        let percet_001=0
        let percet_002=0
        let percet_009=0
        let percet_010=0

        let pr_level_001="ERROR"
        let pr_level_002="ERROR"
        let pr_level_003="ERROR"
        let pr_level_004="ERROR"

        //for deleting all element for new update
        dataMaster.splice(0, dataMaster.length)

        let ar = JSON.parse(JSON.stringify(responseData))
        //console.log(ar)
        if (ar[0].value_one != null){

            dataMaster.push(ar[0].value_one)
        }
        if (ar[0].value_two != null){
            
            dataMaster.push(ar[0].value_two)
        }
        if (ar[0].value_three != null){
            
            dataMaster.push(ar[0].value_three)
        }
        if (ar[0].value_four != null){
            
            dataMaster.push(ar[0].value_four)
        }

        //console.log(dataMaster)

         //remove all existing label from label
         labelMaster.splice(0, labelMaster.length)

         if (ar[0].Level_one_name != null){

            labelMaster.push(ar[0].Level_one_name)
        }
        if (ar[0].Level_two_name != null){
            
            labelMaster.push(ar[0].Level_two_name)
        }
        if (ar[0].Level_three_name != null){
            
            labelMaster.push(ar[0].Level_three_name)
        }
        if (ar[0].Level_four_name != null){
            
            labelMaster.push(ar[0].Level_four_name)
        }

        console.log(labelMaster)
        console.log(dataMaster)


        //making error description array
        err_dec= []
        for (let j = 0; j <= labelMaster.length; j++) {

                if(labelMaster[j] == "managed connection"){

                    err_dec.push("NGEX001")
                    percet_001=dataMaster[j]
                    if( j > 1){
                        pr_level_001 = "WARNING"
                    }
                }
                if(labelMaster[j] == "Connection reset by peer"){

                    err_dec.push("NGEX002")
                    percet_002=dataMaster[j]
                    if( j > 1){
                        pr_level_002 = "WARNING"
                    }
                }
                if(labelMaster[j] == "timed out"){

                    err_dec.push("NGEX009")
                    percet_009=dataMaster[j]
                    if( j > 1){
                        pr_level_003 = "WARNING"
                    }
                }
                if(labelMaster[j] == "Closed Connection"){

                    err_dec.push("NGEX010")
                    percet_010=dataMaster[j]
                    if( j > 1){
                        pr_level_004 = "WARNING"
                    }
                }
            
        }

        let NGEX001=`We found that managed connection ${pr_level_001} occured in the system. and the total percentage of occuarance of the respected error is ${percet_001}%. It may due to the apllicator error or db error. the cause of the error is that the java application not able to get connection from master db. On the application side it is due to the inappropriate configuraton of DB pool. ACTION: We reconfigurd the min max pool value to 50 extra to the existing connection value. If the eeror is continulsly repaeting please check the db side.`
        let NGEX002=`We found that connection reset by peer ${pr_level_002} occured in the syatem. And the total percentage of occuarance of the respected error is ${percet_002}%. It completly due to HTTP port block. That measn the TSP of the application is curremtly high so some request packet get fails to process it is due to the blocking of HTTP socket due to the TPS limit. ACTION: We incerse the the TPS limit to 30 to extra to the existing value. Please closely observ the TPS chart on the menu and observe any variation happens then you can reconfigure the value.`
        let NGEX009=`We found that timed out ${pr_level_003} occured in the syatem. And the percetage of occurance of the error is ${percet_009}%. It is a complety DB side error. It is due to the unresposive state of master db. That measns appliaction cant get the response from DB. NOTE: Please imeadtly contact the corresponding DB team and check the DB status. ACTION: This case we can only do a fresh restart of the appication . If any blockinng or lannging is occuring on application is cleared after the restart. Please check the DB connetions from the menu and observe any variation occuring on that.`
        let NGEX010=`We found that closed connection ${pr_level_004} occured in the system. And the percetage of ocuurance of the error is ${percet_010}%. It is due to application or the db side issue. Basically it happens due to the open pool that is one or many connections not closed propely with db so that application can't make fresh connection with db. It is due to the bad configuration of code lock or any lang in DB side. NOTE: Please contact your deveopment team for this error and evaluate the code. ACTION: In this case we can only do a fresh re start on the application and if any lag or slowness occring in the db side that may resolved. Please evaluate the d conection from the menu and observe any variation on that.`

        console.log(err_dec)
        for (let n = 0; n < err_dec.length; n++) {
             
            //console.log(err_dec)
            if(n == 0){
                document.querySelector("#lvelOne").textContent = eval(err_dec[0])
                document.querySelector(".level-1").style.display = "block";
            }
            if(n == 1){
                document.querySelector("#levelTwo").textContent = eval(err_dec[1])
                document.querySelector(".level-2").style.display = "block";
            }
            if(n == 2){
                document.querySelector("#levelThree").textContent = eval(err_dec[2])
                document.querySelector(".level-3").style.display = "block";
            }
            if(n == 3){
                document.querySelector("#levelFour").textContent = eval(err_dec[3])
                document.querySelector(".level-4").style.display = "block";
            }

        }
        errorPiGraph()

    })
}

loadingFunction()

//--------------------error---report------------------------------------//

const errorReportFuction = () => {
    sendHttpRequest('GET', node_http_root + '/errorReport/7').then(responseData => {

        //remove all existing label from label
        dataE001.splice(0, dataE001.length)
        dataE002.splice(0, dataE002.length)
        dataE002.splice(0, dataE002.length)
        dataE002.splice(0, dataE002.length)

        let ar = JSON.parse(JSON.stringify(responseData))
        console.log(ar[0])
        for (let j = ar.length - 1; j >= 0; j--){

            dataE001.push(ar[j].managed_connection)
            dataE002.push(ar[j].Connection_reset_by_peer)
            dataE003.push(ar[j].timed_out)
            dataE004.push(ar[j].Closed_Connection)

        }
        //console.log(dataE001)
        errorReportGraph()
    })

}

errorReportFuction()