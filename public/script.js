const getAvgBttn = document.getElementById('avg-button')

function getReq() {
    return state = document.getElementById('cities').value
}

async function fetchAvg(state) {
    prvTimestamp = Date.now()
    console.log({'state': state, 'timestamp': prvTimestamp})
    const response = await fetch(`/biggestOccupancyByState/${state}`);
    const json = await response.json()
    lstTimestamp = Date.now()
    responseTime = (lstTimestamp-prvTimestamp) * 0.001
    console.log({'timestamp': lstTimestamp, 'responseTime': responseTime,'data': json}); 
}

getAvgBttn.addEventListener('click', () => {
    getReq();
    fetchAvg(state);
})