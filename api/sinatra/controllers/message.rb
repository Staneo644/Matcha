require_relative '../models/user'
require_relative '../models/connection'
require_relative '../models/message'
require 'sinatra'


post '/message' do
  authenticate!

  # begin
    current_user = User.find(@current_user)
    body = params[:body]
    connection = Connection.find(params[:connection_id])
    if connection.nil?
      status 404
      { error: 'Connection not found' }.to_json
      return
    end

    if connection.user1_id.to_s != @current_user.to_s
      if connection.user2_id.to_s != @current_user.to_s
        status 403
        { error: 'You are not authorized to view this connection' }.to_json
        return
      end
      connection.number_message_unread_user1 += 1
      connection.number_message_unread_user2 = 0
    else
      connection.number_message_unread_user2 += 1
      connection.number_message_unread_user1 = 0
    end
    connection.save

    message = Message.new(sender_id: @current_user, connection_id: connection.id, body: body)
    message.save

    if connection.user1_id == @current_user
      other_user = connection.user2_id
    else
      other_user = connection.user1_id
    end
    $clients[other_user].send(
      {type: 'message', message: {sender_id: @current_user, body: body, connection_id: connection.id}}.to_json
     ) if $clients[other_user]

    { message: 'Message sent successfully' }.to_json
    status 201
  # rescue StandardError => e
  #   puts e.message
  #   status 422
  #   { error: 'Unable to send message' }.to_json
  # end
end
  
get '/messages' do
  authenticate!
  current_user = User.find(@current_user)
  connection = Connection.find(params[:connection_id])
  if connection.nil?
    status 404
    { error: 'Connection not found' }.to_json
    return
  end
  if connection.user1_id != @current_user && connection.user2_id != @current_user
    status 403
    { error: 'You are not authorized to view this connection' }.to_json
    return
  end
  messages = Message.where(sender_id: @current_user.to_s)
  messages.map! do |message|
    {
      id: message.id,
      sender_id: message.sender_id,
      body: message.body,
      created_at: message.created_at,
    }
    end
  status 200
  { messages: messages }.to_json
end
