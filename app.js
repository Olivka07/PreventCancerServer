const express = require('express')
const config = require('config')
const sql = require('mssql')
const cors = require('cors')

const app = express()

app.use(express.json({extended:true}))
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/anketa', require('./routes/anketa.routes'))
app.use('/api/dicts', require('./routes/dicts.routes'))
app.use('/api/doctor', require('./routes/doctors.routes'))
app.use('/api/patient', require('./routes/patient.routes'))



const PORT = config.get("port") || 5000

function start() {
    try {
        sql.connect(config.get('configsql'), () => {
            app.listen(PORT, () => { console.log(`Server has been started on port ${PORT}...`) })
            sql.close()
        })
    }
    catch (e) {
        console.log("Server error ", e.message)
        process.exit(1)
    }
}


start()





