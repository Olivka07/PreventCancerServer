const config = require('config')
const sql = require('mssql')
const {Router} = require('express')

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const router = Router()



// /api/auth/register/patient
router.post(
    '/register/patient', 
    async (req, res) => {
    try {
        await sql.connect(config.get('configsql'))
        const {login, password, surname, name, patronymic, sex, snils, phone, address, polis, birthdate, email} = req.body

        
        

        if (login.length < 6 || login.length > 15) {
            return res.status(400).json({message: "Логин должен быть от 6 до 15 символов"})
        } 
        if (password.length < 6 || password.length > 15) {
            return res.status(400).json({message: "Пароль должен быть от 6 до 15 символов"})
        } 
        if (surname.length < 1 || surname.length > 30) {
            return res.status(400).json({message: "Фамилия - обязательное поле, до 30 символов"})
        } 
        if (name.length < 1 || name.length > 30) {
            return res.status(400).json({message: "Имя - обязательное поле, до 30 символов"})
        } 
        if (patronymic.length < 1 || patronymic.length > 30) {
            return res.status(400).json({message: "Отчество - обязательное поле, до 30 символов"})
        } 
        if (sex.length === 0) {
            return res.status(400).json({message: "Пол не указан"})
        }
        if (snils.length !== 11 || !Number(snils)) {
            return res.status(400).json({message: "Неверно указан СНИЛС"})
        } 
        if (phone.length!==12 || !Number(phone) || phone.includes('_')) {
            return res.status(400).json({message: "Неверно указан телефон"})
        } 
        if (address.length==="") {
            return res.status(400).json({message: "Введите адрес"})
        } 
        if (polis.length!==11 || !Number(polis) || polis.includes('_')) {
            return res.status(400).json({message: "Неверно указан полис"})
        } 
        if (birthdate) {
            let now = new Date()
            now = new Date(now.getFullYear() + "-"+ (Number(now.getMonth())+1) + "-" + (now.getDate()<10? '0'+now.getDate() : now.getDate()))
            let dateBirth = new Date(String(birthdate).split('-')[0] + '-' + String(birthdate).split('-')[1]+'-'+ String(birthdate).split('-')[2])
            if (Number(dateBirth.getFullYear()) < 1900) {
                return res.status(400).json({message: "Неверно указана дата рождения"})
            } else if (now.getTime()< dateBirth.getTime()) {
                return res.status(400).json({message: "Неверно указана дата рождения"})
            } 
        }
        else if (!birthdate) {
            return res.status(400).json({message: "Не указана дата рождения"})
        } 
        if (email && !EMAIL_REGEXP.test(email)) {
            return res.status(400).json({message: "Неверно указан email"})
        } 
        const result = await sql.query(`select * from [Patient] where login = '${login}'`)
        if(result.recordset.length!==0) {
            return res.status(400).json({ message: "Такой пользователь уже существует" })
        }
        const result1 = await sql.query(`select * from [Doctor] where login = '${login}'`)
        if(result1.recordset.length!==0) {
            return res.status(400).json({ message: "Такой пользователь уже существует" })
        }
        else {
            const str = `INSERT INTO [Patient] values 
                (NULL, '${surname}', '${name}', '${patronymic}', '${sex}', 
                '${snils}', '${phone}', '${address}', '${polis}', '${password}', '${login}', '${email}', '${birthdate}', 0, NULL)`
            await sql.query(str)
            return res.status(201).json({message: "Пользователь создан!"})
        }  
    }
    catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так при регистрации пациента, попробуйте снова' + e })
    }
})


// /api/auth/register/doctor
router.post(
    '/register/doctor', 
    async (req, res) => {
    try {
        await sql.connect(config.get('configsql'))
        const {login, password, surname, name, patronymic, dep, job} = req.body

        
        

        if (login.length < 6 || login.length > 15) {
            return res.status(400).json({message: "Логин должен быть от 6 до 15 символов"})
        } 
        if (password.length < 6 || password.length > 15) {
            return res.status(400).json({message: "Пароль должен быть от 6 до 15 символов"})
        } 
        if (surname.length < 1 || surname.length > 30) {
            return res.status(400).json({message: "Фамилия - обязательное поле, до 30 символов"})
        } 
        if (name.length < 1 || name.length > 30) {
            return res.status(400).json({message: "Имя - обязательное поле, до 30 символов"})
        } 
        if (patronymic.length < 1 || patronymic.length > 30) {
            return res.status(400).json({message: "Отчество - обязательное поле, до 30 символов"})
        } 
        if (dep === 0) {
            return res.status(400).json({message: "Не указано отделение"})
        }
        if (job === 0) {
            return res.status(400).json({message: "Не указана должность"})
        }

        const result = await sql.query(`select * from [Patient] where login = '${login}'`)
        if(result.recordset.length!==0) {
            return res.status(400).json({ message: "Такой пользователь уже существует" })
        }

        const result1 = await sql.query(`select * from [Doctor] where login = '${login}'`)
        if(result1.recordset.length!==0) {
            return res.status(400).json({ message: "Такой пользователь уже существует" })
        }

        else {
            const str = `INSERT INTO [Doctor] values 
                    (${job}, ${dep}, '${surname}', '${login}', '${password}','${name}', '${patronymic}')`
            console.log(str)
            await sql.query(str)
            return res.status(201).json({message: "Пользователь создан!"})
        }  
    }
    catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так при регистрации доктора, попробуйте снова' })
    }
})

// /api/auth/login
router.post(
    '/login', 
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const {login, password} = req.body
            const result1 = await sql.query(`select * from [Patient] where login = '${login}' AND password = '${password}'`) 
            if(result1.recordset.length===1) {
                return res.status(200).json({
                    login,
                    password,
                    userId: result1.recordset[0].id_patient,
                    role: 0
                })
            }

            const result2 = await sql.query(`select * from [Doctor] where login = '${login}' AND password = '${password}'`) 

            if(result2.recordset.length===1) {
                return res.status(200).json({
                    login, password,
                    userId: result2.recordset[0].id_doctor,
                    role: 1
                })
            }

            return res.status(400).json({ message: "Пользователя не найдено" })
        }
        catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так при входе, попробуйте снова' })
        }
})

// /api/auth/getpatient
router.post(
    '/getpatient', 
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const {id} = req.body
            const result = await sql.query(`select * from [Patient] where id_patient = ${id}`) 
            if(result.recordset.length===1) {
                return res.status(200).json({
                    userId: result.recordset[0].id_patient,
                    role: 0
                })
            }

            return res.status(400).json({ message: "Такой пользователь не найден!" })
        }
        catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
        }
})

// /api/auth/getdoctor
router.post(
    '/getdoctor', 
    async (req, res) => {
        try {
            const {id} = req.body
            await sql.connect(config.get('configsql'))
            const result = await sql.query(`select * from [Doctor] where id_doctor = ${id} `) 
            if(result.recordset.length===1) {
                return res.status(200).json({
                    userId: result.recordset[0].id_doctor,
                    role: 1
                })
            }

            return res.status(400).json({ message: "Такой пользователь не найден!" })
        }
        catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
        }
})




module.exports = router