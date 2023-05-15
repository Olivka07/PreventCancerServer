const config = require('config')
const sql = require('mssql')
const {Router} = require('express')

const router = Router()

// /api/anketa/original
router.get(
    '/original',
    async (req, res) => {
        try {
            await sql.connect(config.get('configsql'))
            // let result = await sql.query(`select * from [Anketa] where id_anketa = 0`)
            // // Если такой анкеты нет, то создаем в базе данных
            // if (result.recordset.length === 0) {
            //     console.log('Было 0')
            //     sql.query(`SET IDENTITY_INSERT Anketa ON insert INTO Anketa (id_anketa, recomendation, direction, result, id_patient) values (0, NULL, null, null, null) SET IDENTITY_INSERT Anketa OFF`)
            //     return res.status(201).json({list:[]})
            // }
            // else {
            // Получаем список идентификаторов вопросов анкеты
            const result = await sql.query('select * from [Question]')
            const list = []
            let promises = []
            // new Promise((resolve, revoke) => {
            //     let i = 0
                result.recordset.forEach(({id_question, text_question}) => {
                    promises.push(new Promise(async(resolve, revoke) => {
                        let itemList = {}
                        itemList.id_question = id_question
                        // Запрос к таблице вопрос
                        // // let result1 = await sql.query(`SELECT * FROM Question where id_question = ${id_question}`) 
                        // // itemList.text_question = result1.recordset[0].text_question
                        itemList.text_question = text_question
                        const array_answers = []
                        // Запрос к таблице ответ
                        let result2 = await sql.query(`SELECT * FROM Answer where id_question = ${id_question}`)
                        result2.recordset.forEach(answ => {
                            let objectAnswer = {}
                            objectAnswer.id_answer = answ.id_answer
                            objectAnswer.weight = answ.weight
                            objectAnswer.text_answer = answ.text_answer
                            array_answers.push(objectAnswer)
                        })
                        itemList.listAnswers = array_answers
                        list.push(itemList)
                        resolve()
                    }))


                    ///////////////////////////////
                    // i++
                    // let itemList = {}
                    // itemList.id_question = id_question
                    // // Запрос к таблице вопрос
                    // // // let result1 = await sql.query(`SELECT * FROM Question where id_question = ${id_question}`) 
                    // // // itemList.text_question = result1.recordset[0].text_question
                    // itemList.text_question = text_question
                    // const array_answers = []
                    // // Запрос к таблице ответ
                    // let result2 = await sql.query(`SELECT * FROM Answer where id_question = ${id_question}`)
                    // result2.recordset.forEach(answ => {
                    //     let objectAnswer = {}
                    //     objectAnswer.id_answer = answ.id_answer
                    //     objectAnswer.weight = answ.weight
                    //     objectAnswer.text_answer = answ.text_answer
                    //     array_answers.push(objectAnswer)
                    // })
                    // itemList.listAnswers = array_answers
                    // list.push(itemList)
                    //////////////////////////////////////////////////////////////////////////////////////////////////////
                })
                Promise.all(promises).then(() => {
                    return res.status(200).json({list:list})
                })
            // })
            // .then(() => {
            //     return res.status(200).json({list:list})
            // })
            // }
        }
        catch (e) {
            return res.status(400).json({message: "Что-то пошло не так при получении информации об исходной анкете"})
        }
    }
)

// /api/anketa/save-questions
router.post(
    '/save-questions',
    async(req, res) => {
        try {
            const {newQuestions, deleteQuestions, updateQuestions} = await req.body
            await sql.connect(config.get('configsql'))

            await newQuestions.forEach(async(newquestion) => {
                // Добавляем в БД новый вопрос
                let result1 = await sql.query(`insert into Question (text_question) VALUES (\'${newquestion.text_question}\')`)

                // Получаем id новой записи
                let result2 = await sql.query(`SELECT [id_question] from Question WHERE text_question like \'${newquestion.text_question}\'`)
                const id_question = result2.recordset[0].id_question

                if (newquestion.listAnswers.length >0) {
                    newquestion.listAnswers.forEach(async(answer) => {
                        // Добавляем в БД новый ответ
                        let result1 = await sql.query(`insert into Answer (text_answer, weight, id_question) 
                                                                VALUES (\'${answer.text_answer}\', ${answer.weight}, ${id_question})`)
                    })
                }
            })

            await deleteQuestions.forEach(async(idDeleteQuestion) => {
                let result1 = await sql.query(`delete from Question where id_question = ${idDeleteQuestion}`)
            })

            await updateQuestions.forEach(async (itemUpdate) => {
                let result1 = await sql.query(`update Question SET text_question=\'${itemUpdate.text_question}\'where id_question = ${itemUpdate.id_question}`)


                let result2 = await sql.query(`SELECT [id_answer] from Answer WHERE id_question=${itemUpdate.id_question}`)
                
                if (itemUpdate.listAnswers.length >0) {
                    itemUpdate.listAnswers.forEach(async(answer) => {
                        const item = await result2.recordset.find((idansw) => {
                            if (idansw.id_answer === answer.id_answer) {
                                return idansw
                            }
                        })
                        if (item) {
                            let result3 = await sql.query(`update Answer SET text_answer=\'${answer.text_answer}\',weight=${answer.weight}  where id_answer = ${answer.id_answer}`)
                        } else {
                            let result3 = await sql.query(`insert into Answer (text_answer, weight, id_question) 
                                                        VALUES (\'${answer.text_answer}\', ${answer.weight}, ${itemUpdate.id_question})`)
                        }
                    })
                    result2.recordset.forEach(async (idansw) => {
                        if (!itemUpdate.listAnswers.find((el) => {
                            if (el.id_answer === idansw.id_answer) {
                                return el
                            }
                        })) {
                            let result4 = await sql.query(`delete from Answer where id_answer = ${idansw.id_answer}`)
                        }
                    })
                } else {
                    let result1 = await sql.query(`delete from Answer where id_question = ${itemUpdate.id_question}`)
                }
            })
            res.status(201).json({message: 'Всё прошло успешно'})

        } catch (e) {
            res.status(400).json({message: e.message()})
        }
    }
)

module.exports = router