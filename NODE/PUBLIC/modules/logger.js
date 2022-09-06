const logger =() =>{

    let div_id=document.querySelector(".logger-module");
    

    sendHttpRequest('GET', node_http_root + '/log').then(responseData => {


        let ar = JSON.parse(JSON.stringify(responseData))
        console.log(ar[0])
        for (let j =0; j < ar.length ; j++){

            p1 =document.createElement("p")
            p1.textContent =ar[j].log_line
            div_id.appendChild(p1)

        }
        //console.log(dataE001)
        errorReportGraph()
    })
}

logger()