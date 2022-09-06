let tps_ar=[]
let disk_ar=[]
let db_ar =[]

//chart
const  appReportGraphDb = () =>{
    const ctx2 = document.getElementById('appDescChart').getContext('2d');
    const myChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['15', '30', '45','60','75','90','105'],
            datasets: [{
                label: 'DB Connection on last 2 hours',
                data: db_ar,
                fill: false,
                borderColor: 'black',
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

appReportGraphDb()

//chart
const  appReportGraphTps = () =>{
    const ctx2 = document.getElementById('appDescChartTps').getContext('2d');
    const myChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['15', '30', '45','60','75','90','105'],
            datasets: [{
                label: 'tps on last 2 hours',
                data:tps_ar ,
                fill: false,
                borderColor: 'black',
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

appReportGraphTps()


//chart
const  appReportGraphDisk = () =>{
    const ctx2 = document.getElementById('appDescChartDisk').getContext('2d');
    const myChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['15', '30', '45','60','75','90','105'],
            datasets: [{
                label: 'Disk space on last 2 hours',
                data: disk_ar,
                fill: false,
                borderColor: 'black',
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

appReportGraphDisk()

//navbar DOM
let reeBoot = document.querySelector("#reeBootTr");
let clr = document.querySelector("#clrTr");
let param = document.querySelector("#paramTr");


//event lisner for db
param.addEventListener("click", function() {

    //css action
    document.querySelector(".connect-div").style.display = "block";
    sendHttpRequest('GET', node_http_root + '/appReport/8').then(responseData => {

        //remove all existing label from label
        db_ar.splice(0, db_ar.length)

        let ar = JSON.parse(JSON.stringify(responseData))
        console.log(ar[0])
        for (let j = ar.length - 1; j >= 0; j--){

            db_ar.push(ar[j].db_connection)

        }
        appReportGraphDb()
    })
});

document.querySelector("#close2").addEventListener("click", function() {

    //css action
    document.querySelector(".connect-div").style.display = "none";
});


//event lisner for TPS
reeBoot.addEventListener("click", function() {

    //css action
    document.querySelector(".connect-div-2").style.display = "block";
    sendHttpRequest('GET', node_http_root + '/appReport/8').then(responseData => {

        //remove all existing label from label
        tps_ar.splice(0, tps_ar.length)

        let ar = JSON.parse(JSON.stringify(responseData))
        console.log(ar[0])
        for (let j = ar.length - 1; j >= 0; j--){

            tps_ar.push(ar[j].tps_count)

        }
        appReportGraphTps()
    })
    
});

document.querySelector("#close3").addEventListener("click", function() {

    //css action
    document.querySelector(".connect-div-2").style.display = "none";

});

//event lisner of disk space
clr.addEventListener("click", function() {

    //css action
    document.querySelector(".connect-div-3").style.display = "block";
    sendHttpRequest('GET', node_http_root + '/appReport/8').then(responseData => {

        //remove all existing label from label
        disk_ar.splice(0, disk_ar.length)

        let ar = JSON.parse(JSON.stringify(responseData))
        console.log(ar[0])
        for (let j = ar.length - 1; j >= 0; j--){

            disk_ar.push(ar[j].disk_space)

        }
        appReportGraphDisk()
    })
});

document.querySelector("#close4").addEventListener("click", function() {

    //css action
    document.querySelector(".connect-div-3").style.display = "none";

});










