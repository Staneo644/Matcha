require_relative '../models/user'
require_relative '../models/connection'
require 'sinatra'

get '/connections' do
  authenticate!
  connections = Connection.where({user1_id: @current_user.to_s})
  connections += Connection.where({user2_id: @current_user.to_s})
  connections.map! do |connection|
    user1 = User.find(connection.user1_id)
    user2 = User.find(connection.user2_id)
    {
      id: connection.id,
      created_at: connection.created_at,
      user1: {
        id: user1.id,
        pseudo: user1.pseudo
      },
      user2: {
        id: user2.id,
        pseudo: user2.pseudo
      }
    }
  end
  status 200
  { connections: connections }.to_json
end