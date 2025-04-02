require 'sinatra'
require './controllers/app_controller'
require './controllers/message'
require './controllers/like'
require './controllers/picture'
require './controllers/connection'
require './controllers/tags'
require './controllers/user_tags'

get '/' do
  'Hello, Sinatra with MariaDB in Docker!'
end
