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
		console.log('Database connection error ',err);
	} else {
		console.log('Database connection successful');
	}
});
setInterval(
	function() {
		runCron()
	} , 30000) 

function runCron() {
	mysqlConnection.query('SELECT * FROM `router`', function (error, routers, fields) {
		if (error) throw error;
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
						//
						mysqlConnection.query(query, function (error_check, result_check, fields_check) {
							if(result_check.length>0) {
								var bytes_total = parseInt(result_check[0]['bytes-in']) + parseInt(result_check[0]['bytes-out']);
								var bytes_total_insert = parseInt(value_oid['bytes-in']) + parseInt(value_oid['bytes-out']);
								if (bytes_total>bytes_total_insert) {
									mysqlConnection.query('insert into `packets` set ? ', value_oid, function(error_insert, result_insert) {
										if(error_insert) {
											console.log('error_insert ',error_insert);
										}
										callback_oid()
									})
								} else {
									mysqlConnection.query('update `packets` set ? where id_ = ?', [value_oid, result_check[0].id_], function(error_update, result_update) {
										if(error_update) {
											console.log('error_update ',error_update);
										}
										callback_oid()
									})
								}
							} else {
								mysqlConnection.query('insert into `packets` set ? ', value_oid, function(error_insert, result_insert) {
									if(error_insert) {
										console.log('error_insert ',error_insert);
									}
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
setInterval(
	function() {
		checkMaxUsage()
	} , 15000) 
//checkMaxUsage()
function checkMaxUsage() {
	mysqlConnection.query(`
	select * from monitor.oid_list a
	ORDER BY
		a.name,
		a.name
	`, function (error, oids, fields) {
		if (error) throw error;
		async.eachLimit(oids, 1, function(oid, callback_oid) {
			//console.log('oid ',oid)
			if(oid.usage >= oid.max_usage && oid.actual_status == 1) {
				console.log('tokony tapaka')
				exec(`ssh admin@${oid.ip} "interface ${oid.type} disable ${oid.name}" `, (error, stdout, stderr) => {
					if (error) {
						console.log(`error: ${error.message}`);
						return;
					}
					if (stderr) {
						console.log(`stderr: ${stderr}`);
						return;
					}
					
					mysqlConnection.query(`
					update oid set actual_status = 0 where id_oid = ${oid.id_oid}
					`, function (error_update, result_update) {
						if(error_update) {
							console.log('error_update actual_status ',error_update);
						}
						callback_oid();
					})
				})
			} else if (oid.usage < oid.max_usage && oid.actual_status == 0) {
				console.log('tokony alefa')
				exec(`ssh admin@${oid.ip} "interface ${oid.type} enable ${oid.name}" `,  (error, stdout, stderr) => {
					if (error) {
						console.log(`error: ${error.message}`);
						return;
					}
					if (stderr) {
						console.log(`stderr: ${stderr}`);
						return;
					}
					mysqlConnection.query(`
					update oid set actual_status = 1 where id_oid = ${oid.id_oid}
					`, function (error_update, result_update) {
						if(error_update) {
							console.log('error_update actual_status ',error_update);
						}
						callback_oid();
					})

				})
			} else {
				callback_oid();
			}
		}, function (error_oid) {
			if( oids.length = 0 ) {
				console.log('vide ');
			}
			if (error_oid) {
				console.error('error_oid ',error_oid);
			}
		})
	});
}

router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/monitor', function (req, res, next) {
	var query = `
	SELECT * FROM monitor.oid_monitor
	`;
	mysqlConnection.query(query, function(errors, results, fields) {
		if(errors) {
			console.error('errors ',errors)
		}
		
		res.render('monitor', { title: 'Monitor', fields, results });
	})
})

router.get('/update_max_usage', function(req, res, next) {
	var query = req.query;
	console.log('query ',query)
	mysqlConnection.query(`
	update oid set usage_max = ${parseInt(query.max_usage)} where id_oid = ${query.idoid}
	`, function(error , result ) {
		res.json({
			success: true
		})
	})
	
})

router.get('/show/:id', function (req, res, next) {
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
		res.render('show', { title: 'Show', fields, results, id_oid: req.params.id });
	})
	
})

router.get('/data/graph/:id', function (req, res, next) {
	var query = `
	SELECT
		SUM(\`bytes-in\`) AS \`bytes-in\`,
		SUM(\`bytes-out\`) AS \`bytes-out\`,
		(SUM(\`bytes-in\`) + SUM(\`bytes-out\`)) AS 'bytes-total',
		DATE_FORMAT(\`date\`, '%Y-%m-%d') AS \`date\`
	FROM
		\`packets\`
	WHERE
		id_oid = ?
	GROUP BY
		DATE_FORMAT(\`date\`, '%Y-%m-%d')
	ORDER BY
		DATE_FORMAT(\`date\`, '%Y-%m-%d')
	`;
	mysqlConnection.query(query, req.params.id, function(errors, results, fields) {
		if(errors) {
			console.error('errors ',errors)
		}
		var dat = {
			categories: [],
			data: [
				{
					name:"Download",
					data: []
				},
				{
					name:"Upload",
					data: []
				},
				{
					name:"Total",
					data: []
				}
			]
		};
		results.forEach(function(item) {
			dat.categories.push(item.date)
			dat.data[0].data.push(parseFloat((item['bytes-in']/(1024*1024*1024)).toFixed(2)))
			dat.data[1].data.push(parseFloat((item['bytes-out']/(1024*1024*1024)).toFixed(2)))
			dat.data[2].data.push(parseFloat((item['bytes-total']/(1024*1024*1024)).toFixed(2)))
		})
		res.json({
			data: dat
		});
	})
})

router.get('/data/allgraph', function (req, res, next) {
	var query = `
	SELECT
		o.\`user\`,
		DATE_FORMAT(p.\`date\`, '%Y-%m-%d') AS \`date\`,
		(
			SUM(p.\`bytes-in\`) + SUM(p.\`bytes-out\`)
		) AS \`bytes-total\`
	FROM
		\`oid\` o
	INNER JOIN \`packets\` p ON
		p.\`id_oid\` = o.\`id_oid\`
	WHERE
		o.\`name\` != 'ether1'
	GROUP BY
		DATE_FORMAT(p.\`date\`, '%Y-%m-%d'),
		o.\`user\`
	ORDER BY
		o.\`user\` ASC,
		DATE_FORMAT(p.\`date\`, '%Y-%m-%d')
	`;
	mysqlConnection.query(query, function(errors, results, fields) {
		if(errors) {
			console.error('errors ',errors)
		}

		var dat = {
			categories: [],
			data: []
		};

		async.each(results, function(item, callback) {

			if(dat.categories.indexOf(item.date) == -1) {
				dat.categories.push(item.date)
			}
			dat.categories = dat.categories.sort(function(a,b){
				return new Date(a) - new Date(b);
			});
			
			if(_.findIndex(dat.data, function(o) {
				return o.name == item.user
			}) == -1) {
				dat.data.push({
					name: item.user,
					data: []
				})
			} 
			callback();
		}, function (error) {
			dat.categories.forEach(function(date) {
				dat.data.forEach(function(user) {
					if(_.findIndex(results, function (o) {
						return o.user == user.name && o.date == date
					}) == -1) {
						user.data.push(0)
					} else {
						var id = _.findIndex(results, function (o) {
							return o.user == user.name && o.date == date
						})
						user.data.push(parseFloat((results[id]['bytes-total']/ (1024*1024*1024)).toFixed(2)))
					}
				})
			})

			res.json({
				data: dat
			});
		})


	})
})


module.exports = router;
