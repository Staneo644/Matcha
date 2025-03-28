require 'sinatra'
require 'active_record'
require './controllers/app_controller'
require './controllers/message'

get '/' do
  'Hello, Sinatra with MariaDB in Docker!'
end

get '/db' do
  ActiveRecord::Base.connection.current_database
end
