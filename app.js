const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query
  console.log(status)
  console.log(search_q)
  console.log(priority)

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
                SELECT
                  *
                FROM
                  todo 
                WHERE
                  todo LIKE '%${search_q}%'
                  AND status = '${status}'
                  AND priority = '${priority}';`
      break

    case hasPriorityProperty(request.query):
      getTodosQuery = `
                SELECT
                  *
                FROM
                  todo 
                WHERE
                  todo LIKE '%${search_q}%'
                  AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
                SELECT
                  *
                FROM
                  todo 
                WHERE
                   status = '${status}';`
      break
    default:
      getTodosQuery = `
                SELECT
                  *
                FROM
                  todo 
                WHERE
                  todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const singlequery = `
                          SELECT
                            *
                          FROM
                            todo
                            where id = ${todoId};
                           `

  console.log(todoId)

  data = await db.get(singlequery)
  response.send(data)
})

app.post('/todos/', async (request, response) => {
  const getDetails = request.body

  let {id, todo, priority, status} = getDetails

  const addquery = `
         INSERT INTO 
         todo (id,todo,priority,status)
        values(
          ${id},
          '${todo}',
          '${priority}',
          '${status}')
  
  `
  const dbResponse = await db.run(addquery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const getDetails = request.body
  const {todoId} = request.params
  let {status, priority, todo} = getDetails
  let updatequery = ''
  let res = ''
  switch (true) {
    case status !== undefined: //if this is true then below query is taken in the code
      updatequery = `
         UPDATE
             todo
         SET 
              
             status = '${status}'

         WHERE id = ${todoId} ;
  
  `
      res = 'Status Updated'
      break

    case priority !== undefined:
      updatequery = `
         UPDATE
             todo
         SET 
              
             priority = '${priority}'

        
         WHERE id = ${todoId} ;
  
  `
      res = 'Priority Updated'
      break

    default:
      updatequery = `
         UPDATE
             todo
         SET 
              
             todo = '${todo}'

        
         WHERE id = ${todoId} ; `
      res = 'Todo Updated'
  }

  await db.run(updatequery)
  response.send(res)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const deleteQuery = `
    delete
      from todo
    where
      id = ${todoId};`

  console.log(todoId)

  data = await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
