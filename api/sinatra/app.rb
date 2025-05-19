require 'sinatra'
require './controllers/app_controller'
require './controllers/message'
require './controllers/like'
require './controllers/picture'
require './controllers/connection'
require './controllers/tags'
require './controllers/user_tags'
require './controllers/search'
require './controllers/websocket'

require 'sinatra'
require 'sinatra/cross_origin'

configure do
  enable :cross_origin
end

options '*' do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
  200
end

before do
  response.headers['Access-Control-Allow-Origin'] = '*'
end


get '/' do
  'Hello, Sinatra with MariaDB in Docker!'
end
