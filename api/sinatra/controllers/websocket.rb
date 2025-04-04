require 'faye/websocket'
require 'eventmachine'
require 'sinatra'
require 'jwt'
require_relative '../secret_key'
require_relative '../models/user'
require_relative '../models/connection'
require_relative '../models/message'
require_relative '../models/like'

$clients = []
enable :sessions

get '/ws' do
  puts params[:token]
  puts $SECRET_KEY
  decoded_token = JWT.decode(params[:token], $SECRET_KEY, true, { algorithm: 'HS256' })
  @current_user = decoded_token[0]['user_id']
  if Faye::WebSocket.websocket?(env)
    ws = Faye::WebSocket.new(env)

    
    ws.on :message do |event|
      puts "Message reçu : #{event.data}"
      
      ws.send("Message reçu : #{event.data}")
    end

    ws.on :open do |event|
      puts "Client connecté"
      $clients[@current_user] = ws
      ws.send("welcome")
    end

    ws.on :close do |event|
      $clients.delete(ws)
      puts "Client déconnecté"
    end

    ws.rack_response
  else
    status 400
    "Ce n'est pas une connexion WebSocket."
  end
end