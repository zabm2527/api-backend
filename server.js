const express = require('express')
const mysql= require('mysql')
const myconn = require('express-myconnection')
const routes = require('./routes')

const app = express();
app.set('port', process.env.PORT || 9000)

const dbOptions = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'abcd1234',
    database: 'eventosDB'
}

//Middlewares
app.use(myconn(mysql, dbOptions, 'single'))
app.use(express.json())
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Routes
app.get('/', (require, response)=>{
    response.send('Welcome to aplication')
})

app.use('/api', routes)

//Listenting
app.listen(app.get('port'), ()=>{
    console.log('Server is listening on port ', app.get('port'))
})