require('dotenv').config();
console.log('utilisateur mysql ',process.env.MYSQL_USER)
module.exports = {
  host: "db",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}
