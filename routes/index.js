var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../config/databases');
const { exec } = require("child_process");
var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var numeral = require('numeral');
// '0.00b' bytes converter
/* GET home page. */

var mysqlConnection = mysql.createConnection(db);
mysqlConnection.connect(function (err) {
	if (err) {
		console.log('Database connection error');
	} else {
		console.log('Database connection successful');
	}
});
/*
mysqlConnection.end(function (err) {
	// Function to close database connection
	if (err) {
		console.log('err on connect db ', err)
	}
});
*/
setInterval(
	function() {
		runCron()
	} , 120000) 

function runCron() {
	mysqlConnection.query('SELECT * FROM `router`', function (error, routers, fields) {
		if (error) throw error;
		// console.log(routers);
		async.eachLimit(routers, 1, function(router, callback_router) {
			var ip = router.ip;

			mysqlConnection.query('SELECT * FROM `oid` WHERE router = '+router.id_router, function (error, oids, fields) {
				if(error) throw error;

				async.each(oids, function(oid, callback_oid) {
					var array_oid = {};
					array_oid['bytes-in'] = oid['bytes-in'];
					array_oid['bytes-out'] = oid['bytes-out'];
					var value_oid = {};

					var id_oid = oid.id_oid;
					async.forEachOf(array_oid, function (value, key, callback_byte) {
						exec(`snmpwalk -c public -v2c ${ip} ${value}` , (error, stdout, stderr) => {
							if (error) {
								console.log(`error: ${error.message}`);
								return;
							}
							if (stderr) {
								console.log(`stderr: ${stderr}`);
								return;
							}
							////console.log(`stdout: ${stdout}`);

							
							var stdout_parse = parseInt(stdout.split(' ').pop());
							value_oid[key] = stdout_parse;
							// check if insert or update;
							
							callback_byte()
						});
					}, function (error_byte) {
						if(error_byte) {
							console.error('error_byte ',error_byte);
						}

						// select max where 
						value_oid['id_oid'] = id_oid;
						// var query = " SELECT max(date) date_m, max(`bytes-in`) 'bytes-in',max(`bytes-out`) 'bytes-out', MAX(id_) id_ FROM packets WHERE id_oid = "+id_oid+" and DATE_FORMAT(date, '%Y-%m') = '"+moment().format('YYYY-MM')+"'"
						var query = " SELECT * from packets WHERE id_ in (SELECT MAX(id_) id_ FROM packets WHERE id_oid = "+id_oid+" and DATE_FORMAT(date, '%Y-%m') = '"+moment().format('YYYY-MM')+"')"
						console.log('query ',query)
						//
						mysqlConnection.query(query, function (error_check, result_check, fields_check) {
							console.log('result_check ',result_check)
							if(result_check.length>0) {
								// 2914111607 -- 114110254
								// 2918894154 -- 114563193
								var bytes_total = parseInt(result_check[0]['bytes-in']) + parseInt(result_check[0]['bytes-out']);
								var bytes_total_insert = parseInt(value_oid['bytes-in']) + parseInt(value_oid['bytes-out']);
								console.log('bytes_total ',bytes_total)
								console.log('bytes_total_insert ',bytes_total_insert)
								if (bytes_total>bytes_total_insert) {
									mysqlConnection.query('insert into `packets` set ? ', value_oid, function(error_insert, result_insert) {
										if(error_insert) {
											console.log('error_insert ',error_insert);
										}
										console.log('result_insert ',result_insert)
										console.log('insert a',value_oid);
										callback_oid()
									})
								} else {
									mysqlConnection.query('update `packets` set ? where id_ = ?', [value_oid, result_check[0].id_], function(error_update, result_update) {
										if(error_update) {
											console.log('error_update ',error_update);
										}
										console.log('result_update ',result_update)
										console.log('update ', value_oid);
										callback_oid()
									})
								}
							} else {
								mysqlConnection.query('insert into `packets` set ? ', value_oid, function(error_insert, result_insert) {
									if(error_insert) {
										console.log('error_insert ',error_insert);
									}
									console.log('result_insert ',result_insert)
									console.log(value_oid);
									callback_oid()
								})
							}
						})

						
					})

				}, function (error_oid) {
					if (error_oid) {
						console.error('error_oid ',error_oid);
					}
					callback_router()
				})
			})
		}, function (error_router) {
			if (error_router) {
				console.error('error_router ',error_router)
			}
		})	
	});
}

router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/monitor', function (req, res, next) {
	var query = `
	SELECT
    r.ip,
    r.name AS \`lieu\`,
    CASE WHEN o.name = 'wlan1' AND r.name = 'rdc' THEN 'rdc_gauche' WHEN o.name = 'wlan5' AND r.name = 'rdc' THEN 'rdc_droite' WHEN o.name = 'wlan1' AND r.name = '1ère étage' THEN '1ère étage' ELSE o.name
	END AS \`name\`,
	p.id_oid,
	o.user,
	SUM(p.\`bytes-in\`) AS \`bytes-in\`,
	SUM(p.\`bytes-out\`) AS \`bytes-out\`,
	CONCAT(
		TRUNCATE
			(
				(
					SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
				) / 1024.0,
				2
			),
			' ',
			'KB'
	) AS 'Total en KB',
	CONCAT(
		TRUNCATE
			(
				(
					SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
				) / 1048576.0,
				2
			),
			' ',
			'MB'
	) AS \`Total en MB\`,
	CONCAT(
		TRUNCATE
			(
				(
					SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
				) /(1048576.0 * 1024),
				2
			),
			' ',
			'GB'
	) AS \`Total en GB\`,
	DATE_FORMAT(
			MAX(p.\`date\`),
		'%M %d, %Y %H:%i:%S'
	) AS \`Dérnier Connexion\`,
	CASE WHEN(
		(
			SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
		)
	) > (20*1024*1024*1024) THEN 'Oui' ELSE 'Non'
	END AS \`FUP 20 GB\`
	FROM
		router r,
		oid o,
		packets p
	WHERE
		r.id_router = o.router AND o.id_oid = p.id_oid AND o.name != 'ether1'
	GROUP BY
		p.id_oid
	ORDER BY
		r.name,
		o.name
	`;
	mysqlConnection.query(query, function(errors, results, fields) {
		if(errors) {
			console.error('errors ',errors)
		}
		
		res.render('monitor', { title: 'Monitor', fields, results });
	})
})

router.get('/show/:id', function (req, res, next) {
	console.log(req.params);
	var query = `
	SELECT
		r.ip,
		r.name AS \`lieu\`,
		CASE WHEN o.name = 'wlan1' AND r.name = 'rdc' THEN 'rdc_gauche' WHEN o.name = 'wlan5' AND r.name = 'rdc' THEN 'rdc_droite' WHEN o.name = 'wlan1' AND r.name = '1ère étage' THEN '1ère étage' ELSE o.name
		END AS \`name\`,
		p.id_oid,
		o.user,
		SUM(p.\`bytes-in\`) AS \`bytes-in\`,
		SUM(p.\`bytes-out\`) AS \`bytes-out\`,
		CONCAT(
			TRUNCATE
				(
					(
						SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
					) / 1024.0,
					2
				),
				' ',
				'KB'
		) AS 'Total en KB',
		CONCAT(
			TRUNCATE
				(
					(
						SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
					) / 1048576.0,
					2
				),
				' ',
				'MB'
		) AS \`Total en MB\`,
		CONCAT(
			TRUNCATE
				(
					(
						SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
					) /(1048576.0 * 1024),
					2
				),
				' ',
				'GB'
		) AS \`Total en GB\`,
		DATE_FORMAT(p.date, '%Y-%m-%d') AS \`Day\`
	FROM
		router r,
		oid o,
		packets p
	WHERE
		r.id_router = o.router AND o.id_oid = p.id_oid AND o.id_oid = ?
	GROUP BY
		DATE_FORMAT(p.date, '%Y-%m-%d')
	ORDER BY
		DATE_FORMAT(p.date, '%Y-%m-%d')
	`;
	mysqlConnection.query(query, req.params.id, function(errors, results, fields) {
		if(errors) {
			console.error('errors ',errors)
		}
		res.render('show', { title: 'Show', fields, results });
	})
	
})


module.exports = router;
