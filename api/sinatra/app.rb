require 'sinatra'
require 'active_record'

ActiveRecord::Base.establish_connection(
  adapter: 'mysql2',
  host: ENV['MYSQL_HOST'],
  username: 'root',
  password: ENV['MYSQL_ROOT_PASSWORD'],
  database: ENV['MYSQL_DATABASE']
)

get '/' do
  'Hello, Sinatra with MariaDB in Docker!'
end

get '/users' do
  'Hello, users!'
end

get '/db' do
  ActiveRecord::Base.connection.current_database
end

post '/message' do
