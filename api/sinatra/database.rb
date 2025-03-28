require 'mysql2'

DB = Mysql2::Client.new(
  host: "mariadb",
  username: "root",
  password: ENV['MYSQL_ROOT_PASSWORD'],
  database:  ENV['MYSQL_DATABASE'],
  encoding: "utf8mb4"
)