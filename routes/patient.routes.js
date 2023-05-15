const config = require('config')
const {Router} = require('express')
const sql = require('mssql')
const router = Router()

// /api/patient/ankets
router.post(
    '/ankets',
    async (req, res) => {
        try {
            const {id_patient} = await req.body
            await sql.connect(config.get('configsql'))
            const result = await sql.query(`select DISTINCT [date_complete] from [AnketaPatient] WHERE id_patient = ${id_patient}`)
            let resv = []
            result.recordset.forEach((el) => {
                resv.push({date_complete: el.date_complete})
            })
            res.status(200).json({ankets: resv})
            // result.recordset.forEach((el) => {
            //     const finding = resv.find((elem) => {
            //         if (String(elem.date_complete) === String(el.date_complete)) {
            //             return elem
            //         }
            //     })
            //     if (finding) {
            //         resv = resv.map((elem) => {
            //             if (elem.date_complete === finding.date_complete) {
            //                 // if (!elem.anketa) {
            //                 //     elem.anketa = []
            //                 // }
            //                 elem.anketa.push({text_question: el.text_question, text_answer: el.text_answer})
            //             }
            //             return elem
            //         })
            //     } else {
            //         const newEl = {}
            //         newEl.anketa = [{text_question: el.text_question, text_answer: el.text_answer}]
            //         newEl.date_complete = el.date_complete
            //         resv.push(newEl)
            //     }
            // })
            // res.status(200).json({ankets: resv})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка анкет пациента"})
        }
    }
)

// /api/patient/anketa
router.post(
    '/anketa',
    async (req, res) => {
        try {
            const {id_patient, date_complete} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `select * from [AnketaPatient] WHERE id_patient = ${id_patient} AND date_complete=\'${date_complete}\'`
            const result = await sql.query(str)
            let resv = []
            result.recordset.forEach((el) => {
                resv.push({text_question: el.text_question, text_answer: el.text_answer})
            })
            res.status(200).json({anketa: resv})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении анкеты пациента"})
        }
    }
)

// /api/patient/notconfirm
router.get(
    '/notconfirm',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const str = `select * from [Patient] WHERE confirm = 0`
            const result = await sql.query(str)
            let resv = []
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
                newEl.confirm = el.confirm
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
            res.status(400).json({message:"Что-то пошло не так при получении списка неподтверждённых пациентов"})
        }
    }
)

// /api/patient/notconfirm
router.post(
    '/notconfirm',
    async (req, res) => {
        try {
            const {updatePatients, deletePatients} = await req.body
            await sql.connect(config.get('configsql'))
            updatePatients.forEach(async(id_patient) => {
                const str = `UPDATE [Patient] SET confirm = 1 where id_patient=${id_patient}`
                const result = await sql.query(str)
            })
            deletePatients.forEach(async(id_patient) => {
                const str = `DELETE FROM [Patient] where id_patient=${id_patient}`
                const result = await sql.query(str)
            })
            res.status(201).json({message: "Данные обновлены"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка неподтверждённых пациентов"})
        }
    }
)

// /api/patient/all
router.get(
    '/all',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const str = `
                SELECT id_patient, Patient.surname, Patient.name, Patient.patronymic,
                Patient.sex, Patient.snils, Patient.phone, Patient.birthdate,
                Patient.address, Patient.polis, Doctor.surname as doctor_surname, Doctor.name as doctor_name, 
                Doctor.patronymic as doctor_patronymic
                FROM [Patient] LEFT JOIN Doctor on Patient.id_doctor = Doctor.id_doctor
                WHERE Patient.confirm=1
            `
            const result = await sql.query(str)
            const resv = []
            result.recordset.forEach((el) => {
                const newEl = {}
                newEl.id_patient = el.id_patient
                if (el.doctor_surname) {
                    newEl.doctor = el.doctor_surname + ' ' +el.doctor_name + ' '+ el.doctor_patronymic
                } else {
                    newEl.doctor = '-'
                }
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

// /api/patient/all
router.post(
    '/all',
    async (req, res) => {
        try {
            const {deletePatients} = await req.body
            await sql.connect(config.get('configsql'))
            deletePatients.forEach(async(id_patient) => {
                const str = `DELETE FROM Patient WHERE id_patient=${id_patient}`
                const result = await sql.query(str)
            })
            res.status(200).json({message: "Всё прошло успешно"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка пациентов"})
        }
    }
)

// /api/patient/recomendations
router.post(
    '/recomendations',
    async (req, res) => {
        try {
            const {id_patient} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `SELECT * FROM Recomendation WHERE id_patient=${id_patient}`
            const result = await sql.query(str)
            const recs = []
            result.recordset.forEach((recBD) => {
                const el = {id_recomendation: recBD.id_recomendation, text_recomendation: recBD.text_recomendation}
                recs.push(el)
            })
            res.status(200).json({recs: recs})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка рекомендаций"})
        }
    }
)

// /api/patient/recomendation
router.post(
    '/recomendation',
    async (req, res) => {
        try {
            const {text_recomendation, id_patient} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `INSERT INTO Recomendation VALUES (${id_patient}, '${text_recomendation}')`
            const result = await sql.query(str)
            res.status(201).json({message: "Добавлена новая рекомендация"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при добавлении новой рекомендации"})
        }
    }
)

// /api/patient/recomendation
router.put(
    '/recomendation',
    async (req, res) => {
        try {
            const {text_recomendation, id_recomendation} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `
                UPDATE Recomendation SET text_recomendation ='${text_recomendation}' WHERE id_recomendation = ${id_recomendation}
            `
            const result = await sql.query(str)
            res.status(201).json({message: "Рекомендация изменена"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при изменении рекомендации"})
        }
    }
)

// /api/patient/recomendation
router.delete(
    '/recomendation',
    async (req, res) => {
        try {
            const {id_recomendation} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `
                DELETE FROM Recomendation WHERE id_recomendation = ${id_recomendation}
            `
            const result = await sql.query(str)
            res.status(201).json({message: "Рекомендация была удалена"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при удалении рекомендации"})
        }
    }
)




// /api/patient/directions
router.post(
    '/directions',
    async (req, res) => {
        try {
            const {id_patient} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `SELECT * FROM Direction WHERE id_patient=${id_patient}`
            const result = await sql.query(str)
            const dirs = []
            result.recordset.forEach((dirBD) => {
                const el = {id_direction: dirBD.id_direction, text_direction: dirBD.text_direction}
                dirs.push(el)
            })
            res.status(200).json({dirs: dirs})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка направлений"})
        }
    }
)

// /api/patient/direction
router.post(
    '/direction',
    async (req, res) => {
        try {
            const {text_direction, id_patient} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `INSERT INTO Direction VALUES (${id_patient}, '${text_direction}')`
            const result = await sql.query(str)
            res.status(201).json({message: "Добавлено новое направление"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при добавлении нового направления"})
        }
    }
)

// /api/patient/direction
router.put(
    '/direction',
    async (req, res) => {
        try {
            const {text_direction, id_direction} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `
                UPDATE Direction SET text_direction ='${text_direction}' WHERE id_direction = ${id_direction}
            `
            const result = await sql.query(str)
            res.status(201).json({message: "Направление изменено"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при изменении направления"})
        }
    }
)

// /api/patient/direction
router.delete(
    '/direction',
    async (req, res) => {
        try {
            const {id_direction} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `
                DELETE FROM Direction WHERE id_direction = ${id_direction}
            `
            const result = await sql.query(str)
            res.status(201).json({message: "Направление было удалено"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при удалении направления"})
        }
    }
)

// /api/patient/statistics/pol
router.get(
    '/statistics/pol',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const str = `
                SELECT COUNT(id_patient) AS amount, sex as pol
                FROM Patient
                WHERE risk = 1
                GROUP BY sex
            `
            const result = await sql.query(str)
            res.status(200).json({statistics: result.recordset})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении статистики о среднем проценте заболеваемости по полу"})
        }
    }
)


// /api/patient/statistics/age
router.get(
    '/statistics/age',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const str = `
                SELECT COUNT(id_patient) AS amount, DATEDIFF(year, birthdate, GETDATE()) AS age
                FROM Patient
                WHERE risk =1
                GROUP BY DATEDIFF(year, birthdate, GETDATE())
            `
            const result = await sql.query(str)
            const resMas = [
                {
                    amount: 0,
                    age: 'Молодые(18-44)',
                    max: 44
                },
                {
                    amount: 0,
                    age: 'Средний(45-59)',
                    min: 45,
                    max: 59
                },
                {
                    amount: 0,
                    age: 'Пожилой(60-74)',
                    min: 60,
                    max: 74
                },
                {
                    amount: 0,
                    age: 'Старческий(75-90)',
                    min: 75,
                    max: 90
                },
                {
                    amount: 0,
                    age: 'Долгожители(90+)',
                    min: 90
                }
            ]
            result.recordset.forEach((elbd) => {
                resMas.forEach((el) => {
                    if (!el.min) {
                        if (elbd.age<=el.max) {
                            el.amount += elbd.amount
                        }
                    }
                    if (!el.max) {
                        if (elbd.age >= el.min) {
                            el.amount += elbd.amount
                        }
                    }
                    if (el.max && el.min) {
                        if (elbd.age >= el.min && elbd.age<=el.max) {
                            el.amount += elbd.amount
                        }
                    }
                })
            })
            res.status(200).json({statistics: resMas})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении статистики о среднем проценте заболеваемости по возрасту"})
        }
    }
)


// /api/patient/completeanketa
router.post(
    '/completeanketa',
    async (req, res) => {
        try {
            const {anketa, id_patient} = await req.body
            await sql.connect(config.get('configsql'))
            const date_complete = new Date()
            anketa.forEach(async (el) => {
                const str = `INSERT INTO AnketaPatient VALUES ('${Object.keys(el)[0]}', ${Number(id_patient)},
                '${Object.values(el)[0]}', '${date_complete.toISOString()}')`
                await sql.query(str)
            })

            res.status(201).json({message: "Анкета сохранена"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при сохранении анкеты"})
        }
    }
)


// /api/patient/risk
router.post(
    '/risk',
    async (req, res) => {
        try {
            const {risk, id_patient} = await req.body
            await sql.connect(config.get('configsql'))
            const str = `UPDATE Patient SET risk=${risk} WHERE id_patient=${id_patient}`
            await sql.query(str)
            res.status(201).json({message: "Риск пациента обновлён"})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при обновлении риска"})
        }
    }
)






module.exports = router