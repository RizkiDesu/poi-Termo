
let data = [
    ["Waktu", "Suhu 1", "Suhu 2"],
]
let dataGrafik1 = []
let dataGrafik2 = []
let dataTerakhir = 0
let seconds = 0
let minutes = 0
let hours = 0

// penamaan data excel secara random
const generateRandomString=(length)=> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

// meyimpan data array ke excel
function simpandata(){
    const XLSX = require('xlsx')
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
    const randomString = generateRandomString(15);
    XLSX.writeFile(workbook, `./resources/outputApp/data_${randomString}.xlsx`)
    document.getElementById("status").innerHTML = `data_${randomString} telah disimpan !!!`;
    
}

// mengambil data di id input
const getipadrees =()=> {
    const ipaad = document.getElementById('input').value
    document.getElementById('ipaddress').textContent = ipaad
    return ip = ipaad
}
// submit ip address
document.getElementById('submitButton').addEventListener('click', ()=> {
    getipadrees()
    // console.log(ip)
})


// membuat grafik
const ctx = document.getElementById('grafik').getContext('2d')
let grafik
const buatGrafik=()=> {
    grafik = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Suhu Pada Sensor 1',
                data: dataGrafik1,
                borderColor: 'red',
                borderWidth: 2,
                fill: false
            }, {
                label: 'Suhu Pada Sensor 2',
                data: dataGrafik2,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            reponsive: true,
            scales: {
                x: {
                    beginAtZero: false
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// menambahkan data ke grafik dam menambahkan data array yang nanti akan di konfersi ke excel
const tambahDataGrafik=(data1, data2)=> {
    // input data grafik
    dataGrafik1.push(data1)
    dataGrafik2.push(data2)
    seconds++
    if(seconds == 60){
        minutes++
        seconds = 0
        if(minutes == 60){
            hours++
            minutes = 0
        }
    }
    seconds = seconds.toString().padStart(2, '0')
    minutes = minutes.toString().padStart(2, '0')
    hours = hours.toString().padStart(2, '0')
    dataTerakhir = hours + ':' + minutes + ':' + seconds
    grafik.data.labels.push(dataTerakhir)

    // batas data grafik dan update grafik
    const batasData = 60
    if (grafik.data.labels.length >= batasData) {
        dataGrafik1.shift()
        dataGrafik2.shift()
        grafik.data.labels.shift()
    }
    grafik.update()


    // input data array excel
    data.push([dataTerakhir, data1, data2])
    // tampilkan timer
    document.getElementById("waktu").innerHTML = dataTerakhir
}

// tombol refresh
document.getElementById('refresh').addEventListener('click', function() {

    // hapus grafik dan buat grafik
    grafik.destroy()
    buatGrafik()

    // tampilkan status refresh
    document.getElementById("status").innerHTML = "Refresh"
})

// tombol reset
document.getElementById('reset').addEventListener('click', function() {

    //hapus grafik 
    grafik.destroy()

    // reset semua data mejadi semula
    dataGrafik1 = []
    dataGrafik2 = []
    seconds = 0
    minutes = 0
    hours = 0
    dataTerakhir = "00:00:00"
    data = [
        ["Waktu", "Suhu 1", "Suhu 2"],
    ]
    // buat grafik
    buatGrafik()
    // tampilkan status reset
    document.getElementById("waktu").innerHTML = dataTerakhir
    document.getElementById("status").innerHTML = "Reset";
});

buatGrafik()

// ambil data dari server
const Requestdata =()=> {
    const ip = getipadrees()
    fetch(`http://${ip}/get-message`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        }
    })
    .then(response => {
        //tamplikan status koneksi terhubung
        document.getElementById("status").innerHTML = `Response ${response.status} Ok`;
        if (!response.ok) {
            //tamplikan status koneksi terputus
            document.getElementById("status").innerHTML = `HTTP error, status: ${response.status}`;
            throw new Error('HTTP error, status = ' + response.status);
        }
          return response.json();
        })

    .then(data => {
        document.getElementById("suhu1").innerHTML = data.suhu1;
        document.getElementById("suhu2").innerHTML = data.suhu2;
        tambahDataGrafik(data.suhu1, data.suhu2)
            
        // Lakukan pemrosesan data JSON di sini
    })
    .catch(error => {
        console.error('Ada kesalahan:', error);
        //tamplikan status koneksi error
        document.getElementById("status").innerHTML = `error ${error}`
    });
}

// tombol hidup dan mati
let status = false;
const tampilkanStatus=()=> {
    if (status) {

        // ambil data setiap 1 detik
        intervalId = setInterval(() => {
        Requestdata(ip);
        }, 1000);
    } else {
        // stop ambil data
        clearInterval(intervalId);

        // tampilkan bahwa tidak ada data
        document.getElementById("suhu1").innerHTML = "-"
        document.getElementById("suhu2").innerHTML = "-"
        document.getElementById("status").innerHTML = "Not Connected Server"
    }
}

// fungsi tombol hidup dan mati
const toggleStatus=()=> {
    status = !status;
    tampilkanStatus();
    const tombolToggle = document.getElementById('hidup');
    tombolToggle.textContent = status ? 'Stop' : 'Start';
}

// tombol hidup dan mati
document.getElementById('hidup').addEventListener('click', toggleStatus)


// tombol simpan data ke excel
document.getElementById('simpan').addEventListener('click', ()=>{
    simpandata()
})

//tamplikan status
tampilkanStatus()

