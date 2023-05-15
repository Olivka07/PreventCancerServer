const config = require('config')
const {Router} = require('express')
const sql = require('mssql')
const router = Router()

// /api/dicts/dep
router.get(
    '/dep',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const result = await sql.query('select * from [Department]')
            const resv = []
            result.recordset.forEach((el) => {
                const newEl = {}
                newEl.id_department = el.id_department
                newEl.name = el.name
                resv.push(newEl)
            })
            res.status(200).json({dictDeps: resv})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка отделений"})
        }
    }
)

// /api/dicts/job
router.get(
    '/job',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const result = await sql.query('select * from [Job]')
            const resv = []
            result.recordset.forEach((el) => {
                const newEl = {}
                newEl.id_job = el.id_job
                newEl.name = el.name
                resv.push(newEl)
            })
            res.status(200).json({dictJobs: resv})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при получении списка должностей"})
        }
    }
)

// /api/dicts/job
router.post(
    '/job',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const {updateJob, insertJob, deleteJob} = await req.body
            await insertJob.forEach(async(job) => {
                // Добавляем в БД новый вопрос
                let result1 = await sql.query(`insert into Job (name) VALUES (\'${job.name}\')`)
            })

            await deleteJob.forEach(async(idDeleteJob) => {
                let result1 = await sql.query(`delete from Job where id_job = ${idDeleteJob}`)
            })

            await updateJob.forEach(async(job) => {
                let result1 = await sql.query(`update Job SET name=\'${job.name}\'where id_job = ${job.id_job}`)
            })
            res.status(201).json({message: 'Сохранение списка должностей прошло успешно'})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при сохранении списка должностей"})
        }
    }
)

// /api/dicts/dep
router.post(
    '/dep',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            const {updateDep, insertDep, deleteDep} = await req.body
            await insertDep.forEach(async(dep) => {
                // Добавляем в БД новый вопрос
                let result1 = await sql.query(`insert into Department (name) VALUES (\'${dep.name}\')`)
            })

            await deleteDep.forEach(async(idDeleteDep) => {
                let result1 = await sql.query(`delete from Department where id_department = ${idDeleteDep}`)
            })

            await updateDep.forEach(async(dep) => {
                let result1 = await sql.query(`update Department SET name=\'${dep.name}\'where id_department = ${dep.id_department}`)
            })
            res.status(201).json({message: 'Сохранение справочника отделений прошло успешно'})
        } catch (e) {
            res.status(400).json({message:"Что-то пошло не так при сохранении справочника отделений"})
        }
    }
)

module.exports = router