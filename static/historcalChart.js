function fetchData() {
    const xml = new XMLHttpRequest();
    xml.open('GET', 'http://127.0.0.1:5000/data/mongo', true);

    xml.responseType = 'json';
    xml.onload = function() {
        if (xml.status != 200) {
            alert(`Error ${xml.status}: ${xml.statusText}`);
        }else {
            let response = xml.response;
            let lastValue = response[response.length-1];
            let latestTempValue = lastValue['temp'];
            let latestHumidValue = lastValue['humid'];

            //Fetch latest 20docs
            endIndex = response.length
            startIndex = response.length-21;
            latestTempList = [];
            latestHumidList = [];
            labels = [];
            if(endIndex > 20) {
                for(let i = startIndex; i < endIndex; i++) {
                    latestTempList.push(response[i]['temp']);
                    latestHumidList.push(response[i]['humid']);
                    labels.push(ISOParser(response[i].date['$date']));
                }
            }

            //ISO1806 String parser
            function ISOParser(isoString) {
                let ISODate = new Date(isoString)
                let year = ISODate.getFullYear();
                let month = String(ISODate.getMonth()<8 ? '0' + ISODate.getMonth() : ISODate.getMonth());
                let day = String(ISODate.getDate()<8 ? '0' + ISODate.getDate() : ISODate.getDate());
                let hour = String(ISODate.getUTCHours()).padStart(2, "0");
                let minute = String(ISODate.getUTCMinutes()).padStart(2, "0");
                let second = String(ISODate.getUTCSeconds()).padStart(2, "0");
                let date = `${year}-${month}-${day}`;
                let time = `${hour}-${minute}-${second}`; 
                return time;
            }
            
            // Convert ISO1806 time format to DD-MM-YYYY:hh-mm-ss
            function takeTime() {
                let isoString = lastValue.date['$date']
                let ISODate = new Date(isoString)
                let year = ISODate.getFullYear();
                let month = String(ISODate.getMonth()<8 ? '0' + ISODate.getMonth() : ISODate.getMonth());
                let day = String(ISODate.getDate()<8 ? '0' + ISODate.getDate() : ISODate.getDate());
                let hour = String(ISODate.getUTCHours()).padStart(2, "0");
                let minute = String(ISODate.getUTCMinutes()).padStart(2, "0");
                let second = String(ISODate.getUTCSeconds()).padStart(2, "0");
                let date = `${year}-${month}-${day}`;
                let time = `${hour}-${minute}-${second}`; 
                console.log(lastValue)
                return time;
            }

            /*
            *Chart for visualization
            */
            // If chart already exists
            if (window.tempChart) {
                // Update data
                window.tempChart.data.datasets[0].data.push(latestTempValue);
                window.tempChart.data.labels.push(takeTime());

                // Remove old data if exceeding 20 points
                if (window.tempChart.data.labels.length > 20) {
                    // Temp chart
                    window.tempChart.data.labels.shift();
                    window.tempChart.data.datasets.forEach(dataset => dataset.data.shift());
                }
                window.tempChart.update();
            } else {
                // Create Chart if it doesn't exist
                // Temp chart
                var chartOne = document.getElementById('myTempChart');
                window.tempChart = new Chart(chartOne, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{ 
                            label: 'Current Temperature', 
                            data: latestTempList, 
                            borderWidth: 1,
                            borderColor: 'rgb(227, 94, 32)',
                        }]
                    },
                    options: { 
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: {
                                    // This more specific font property overrides the global property
                                    font: {
                                        size: 20
                                    }
                                },
                            }
                        }
                    }
                });
            }

            if (window.humidChart) {
                // Update data
                window.humidChart.data.datasets[0].data.push(latestHumidValue);
                window.humidChart.data.labels.push(takeTime());

                // Remove old data if exceeding 20 points
                if (window.humidChart.data.labels.length > 20) {
                    // Humid chart
                    window.humidChart.data.labels.shift();
                    window.humidChart.data.datasets.forEach(dataset => dataset.data.shift());
                }
                window.humidChart.update();
            } else {
                // Create Chart if it doesn't exist
                // Humid chart
                var chartTwo = document.getElementById('myHumidChart');
                window.humidChart = new Chart(chartTwo, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{ 
                            label: 'Current Humidity', 
                            data: latestHumidList, 
                            borderWidth: 1,
                        }]
                    },
                    options: { 
                        responsive: true, 
                        plugins: {
                            legend: {
                                labels: {
                                    // This more specific font property overrides the global property
                                    font: {
                                        size: 20
                                    }
                                }
                            }
                        }
                    }
                });
            }

        }
    }
    xml.send(); 
}       
setInterval(fetchData, 5000);
fetchData();