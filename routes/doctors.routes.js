const config = require('config')
const {Router} = require('express')
const sql = require('mssql')
const router = Router()

// /api/doctor/doctors
router.get(
    '/doctors',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const result = await sql.query('select * from [Doctor]')
            const resv = []
            result.recordset.forEach((el) => {
                const newEl = {}
                newEl.id_doctor = el.id_doctor
                if (!el.id_department) {
                    el.id_department = 0
                } else {
                    newEl.id_department = el.id_department
                }
                if (!el.id_job) {
                    el.id_job = 0
                } else {
                    newEl.id_job = el.id_job
                }
                newEl.surname = el.surname
                newEl.login = el.login
                newEl.password = el.password
                newEl.name = el.name
                newEl.patronymic = el.patronymic
                resv.push(newEl)
            })
            res.status(200).json({docs: resv})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка докторов"})
        }
    }
)

// /api/doctor/doctors
router.post(
    '/doctors',
    async (req, res) => {
        try {
            const {updateDoctors, deleteDoctors} = req.body
            await sql.connect(config.get('configsql'))
            updateDoctors.forEach(async(upd) => {
                const str = `UPDATE [Doctor] SET id_job=${upd.id_job}, id_department=${upd.id_department}, 
                                surname=\'${upd.surname}\', name=\'${upd.name}\', patronymic=\'${upd.patronymic}\' 
                                WHERE id_doctor=${upd.id_doctor}`
                await sql.query(str)
            })
            deleteDoctors.forEach(async (id_doctor) => {
                await sql.query(`DELETE  FROM [Doctor] WHERE id_doctor=${id_doctor}`)
            })


            // const result = await sql.query('select * from [Doctor]')
            // console.log('2')
            // const resv = []
            // result.recordset.forEach((el) => {
            //     const newEl = {}
            //     newEl.id_doctor = el.id_doctor
            //     newEl.id_job = el.id_job
            //     newEl.id_department = el.id_department
            //     newEl.surname = el.surname
            //     newEl.login = el.login
            //     newEl.password = el.password
            //     newEl.name = el.name
            //     newEl.patronymic = el.patronymic
            //     resv.push(newEl)
            // })
            // console.log(resv)
            res.status(200).json({message: "Всё прошло успешно"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при сохранении списка докторов" + e})
        }
    }
)

// /api/doctor/patients
router.get(
    '/patients',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const str = `SELECT * FROM [Patient] WHERE id_doctor IS NULL AND confirm=1`
            const result = await sql.query(str)
            const resv = []
            result.recordset.forEach((el) => {
                const newEl = {}
                newEl.id_patient = el.id_patient
                newEl.id_doctor = el.id_doctor
                newEl.surname = el.surname
                newEl.name = el.name
                newEl.patronymic = el.patronymic
                newEl.sex = el.sex
                newEl.snils = el.snils
                newEl.phone = el.phone
                newEl.address = el.address
                newEl.polis = el.polis
                if (el.email) {
                    newEl.email = el.email
                } else {
                    newEl.email = '-'
                }
                newEl.birthdate = el.birthdate
                resv.push(newEl)
            })
            res.status(200).json({pats: resv})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка пациентов"})
        }
    }
)

// /api/doctor/patients
router.post(
    '/patients',
    async (req, res) => {
        try {
            const {id_doctor} = req.body
            await sql.connect(config.get('configsql'))
            const str = `SELECT * FROM [Patient] WHERE id_doctor=${id_doctor}`
            const result = await sql.query(str)
            const resv = []
            result.recordset.forEach((el) => {
                const newEl = {}
                newEl.id_patient = el.id_patient
                newEl.id_doctor = el.id_doctor
                newEl.surname = el.surname
                newEl.name = el.name
                newEl.patronymic = el.patronymic
                newEl.sex = el.sex
                newEl.snils = el.snils
                newEl.phone = el.phone
                newEl.address = el.address
                newEl.polis = el.polis
                if (el.email) {
                    newEl.email = el.email
                } else {
                    newEl.email = '-'
                }
                newEl.birthdate = el.birthdate
                resv.push(newEl)
            })
            res.status(200).json({pats: resv})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка пациентов"})
        }
    }
)


// /api/doctor/updpatients
router.post(
    '/updpatients',
    async (req, res) => {
        try {
            const {updatePatients, deletePatients} = req.body
            await sql.connect(config.get('configsql'))
            await updatePatients.forEach(async (upd) => {
                if (upd.email!=='-') {
                    const str = `UPDATE [Patient] SET id_doctor=${upd.id_doctor}, surname=\'${upd.surname}\', 
                                name=\'${upd.name}\', patronymic=\'${upd.patronymic}\', sex=\'${upd.sex}\',
                                snils=\'${upd.snils}\', phone=\'${upd.phone}\', address=\'${upd.address}\',
                                polis=\'${upd.polis}\', email=\'${upd.email}\', birthdate=\'${upd.birthdate}\'
                                WHERE id_patient=${upd.id_patient}`
                    await sql.query(str)
                } else {
                    const str = `UPDATE [Patient] SET id_doctor=${upd.id_doctor}, surname=\'${upd.surname}\', 
                    name=\'${upd.name}\', patronymic=\'${upd.patronymic}\', sex=\'${upd.sex}\',
                    snils=\'${upd.snils}\', phone=\'${upd.phone}\', address=\'${upd.address}\',
                    polis=\'${upd.polis}\', email=null, birthdate=\'${upd.birthdate}\'
                    WHERE id_patient=${upd.id_patient}`
                    await sql.query(str)
                }
                
            })
            await deletePatients.forEach(async (id_patient) => {
                await sql.query(`UPDATE [Patient] SET id_doctor=null WHERE id_patient=${id_patient}`)
            })

            
            res.status(200).json({message: "Всё прошло успешно"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при изменении списка пациентов у доктора"})
        }
    }
)


module.exports = router