var express = require('express');
var router = express.Router();
var mysql = require('mysql');

//Put your mysql configuration settings - user, password, database and port
/*function getConnection(){
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'krutika',
        password : 'krutika@123',
        database : 'homework-273',
        port	 : 3306
    });
    return connection;
}*/

function getConnection(){
    var connectionPool = mysql.createPool({
        connectionLimit : 500,
        host     : 'localhost',
        user     : 'krutika',
        password : 'krutika@123',
        database : 'homework-273',
        port	 : 3306
    });
    return connectionPool;
}


function fetchData(callback,sqlQuery){

    console.log("\nSQL Query::"+sqlQuery);

    var connection=getConnection();

    connection.query(sqlQuery, function(err, rows, fields) {
        if(err){
            console.log("ERROR: " + err.message);
        }
        else
        {	// return err or result
            console.log("DB Results:"+rows);

        }
        callback(err, rows);
        connection.end();
    });
    console.log("\nConnection closed..");

}

exports.fetchData=fetchData;
