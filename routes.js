const express = require('express')
const routes = express.Router()

//consulta colores
routes.get('/colores', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

            conn.query('SELECT * FROM COLORES', (err, rows)=>{

                if (err) return response.send(err)
                
                response.json(rows)
            })
    })
})

//consulta ciudades
routes.get('/ciudades', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

            conn.query('SELECT * FROM CIUDADES', (err, rows)=>{
                if (err) return response.send(err)
                
                response.json(rows)
            })
    })
})

//consulta all eventos
routes.get('/allEventos', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

            conn.query('SELECT * FROM EVENTOS', (err, rows)=>{
                if (err) return response.send(err)
                
                let datanew = []
                let arrdate
                let newrow = JSON.parse(JSON.stringify(rows))

                for (let i = 0; i < newrow.length; i++) {
                    datanew[i] = {title : newrow[i].NOMBRE_EVENTO, date: newrow[i].FECHA_INI}
                }

                response.json(datanew)
            })
    })
})

//consulta eventos by cod
routes.post('/eventoByCod', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

            conn.query('SELECT * FROM EVENTOS WHERE COD_EVENTO = ?', [require.body.cod_evento], (err, rows)=>{
                let respu

                if (err){
                    respu = {codMensaje : 2, mensaje: err}
                    response.json(respu)
                }else{
                    if (rows.length > 0) {
                        response.json(rows)   
                    }else{
                        respu = {codMensaje : 3, mensaje: 'No existen registros con ese codigo de evento.'}
                        response.json(respu)
                    }
                }
            })
    })
})

//consulta eventos by fecha
routes.post('/eventoByFec', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

            conn.query('SELECT EVENTOS.COD_EVENTO, EVENTOS.NOMBRE_EVENTO, '+
                            'EVENTOS.DESCRIPCION, EVENTOS.COD_CIUDAD, CIUDADES.NOM_CIUDAD, EVENTOS.COD_COLOR, COLORES.NOM_COLOR, '+
                            'EVENTOS.FECHA_INI, EVENTOS.FECHA_FIN '+
                        'FROM EVENTOS '+
                        'INNER JOIN CIUDADES ON EVENTOS.COD_CIUDAD = CIUDADES.COD_CIUDAD '+
                        'INNER JOIN COLORES ON EVENTOS.COD_COLOR = COLORES.COD_COLOR WHERE FECHA_INI LIKE ?', ['%'+require.body.fecha_ini+'%'], (err, rows)=>{
                let respu;

                if (err){
                    respu = {codMensaje : 2, mensaje: err}
                    response.json(respu)
                }else{
                    if (rows.length > 0) {
                        response.json(rows)   
                    }else{
                        // let meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

                        respu = {codMensaje : 3, mensaje: 'No existen registros en la fecha establecida ' + require.body.fecha_ini}
                        response.json(respu)
                    }
                }

            })
    })
})

//registra evento
routes.post('/insertEvento', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

        let respu

        var v1 = Date.parse(require.body.fecha_ini)
        var v2 = Date.parse(require.body.fecha_fin)

        var v4 = new Date(require.body.fecha_ini)
        var v5 = new Date(require.body.fecha_fin)

        if (v4.getDate() != v5.getDate()) {
            respu = {codMensaje : 3, mensaje: 'No se permiten eventos que abarquen dos dias diferentes.' }
            response.json(respu)
        }else if (v2 < v1) {
            respu = {codMensaje : 3, mensaje: 'La hora final no puede ser menor o anterior a la hora inicial.'}
            response.json(respu)            
        }else{
            conn.query('SELECT COUNT(*) as conteo FROM EVENTOS WHERE FECHA_INI = ? ', [require.body.fecha_ini], (err, data) =>{

                if (err) {
                    respu = {codMensaje : 2, mensaje: err}
                }else{
                    let dataparse = JSON.parse(JSON.stringify(data))
                    if (dataparse[0].conteo >= 1) {
                        respu = {codMensaje : 3, mensaje: 'No se permiten dos eventos en una misma fecha y hora. (simultaneamente).'}
                        response.json(respu)
                    }else{
                        conn.query('INSERT INTO EVENTOS SET ?', [require.body], (err,rows)=>{
                            
                            if (err){
                                respu = {codMensaje : 2, mensaje: err}
                                response.json(respu)
                            }else{
                                respu = {codMensaje : 1, mensaje: 'Row was inserted correctly!'}
                                response.json(respu)
                            }
                        })
                    }
                }
            })
        }
    })
})

//Actualiza evento
routes.post('/updateEvento/:cod_evento', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

        let respu

        var v1 = Date.parse(require.body.fecha_ini)
        var v2 = Date.parse(require.body.fecha_fin)

        var v4 = new Date(require.body.fecha_ini)
        var v5 = new Date(require.body.fecha_fin)

        if (v4.getDate() != v5.getDate()) {
            respu = {codMensaje : 3, mensaje: 'No se permiten eventos que abarquen dos dias diferentes.' }
            response.json(respu)
        } else if (v2 < v1) {
            respu = {codMensaje : 3, mensaje: 'La hora final no puede ser menor o anterior a la hora inicial.'}
            response.json(respu)            
        }else{
            conn.query('SELECT COUNT(*) as conteo FROM EVENTOS WHERE FECHA_INI = ? ', [require.body.fecha_ini], (err, data) =>{

                if (err) {
                    respu = {codMensaje : 2, mensaje: err}
                }else{
                    let dataparse = JSON.parse(JSON.stringify(data))
                    if (dataparse[0].conteo >= 1) {
                        respu = {codMensaje : 3, mensaje: 'No se permiten dos eventos en una misma fecha y hora. (simultaneamente).'}
                        response.json(respu)
                    }else{
                        conn.query('UPDATE EVENTOS SET ? WHERE COD_EVENTO = ?', [require.body, require.params.cod_evento], (err,rows)=>{
                            let respu
    
                            if (err){
                                respu = {codMensaje : 2, mensaje: err}
                                response.json(respu)
                            }else{
                                respu = {codMensaje : 1, mensaje: 'Row was updated correctly!'}
                                response.json(respu)
                            }
                        })
                    }
                }
            }) 
        }       
    })
})

//Elimina evento
routes.post('/deleteEvento', (require, response)=>{
    require.getConnection((err, conn)=>{
        if (err) return response.send(err)

        conn.query('DELETE FROM EVENTOS WHERE COD_EVENTO = ?', [require.body.cod_evento], (err,rows)=>{
            let respu

            if (err){
                respu = {codMensaje : 2, mensaje: err}
                response.json(respu)
            }else{
                respu = {codMensaje : 1, mensaje: 'Row was deleted correctly!'}
                response.json(respu)
            }
        })
    })
})


module.exports = routes