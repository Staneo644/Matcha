require 'faye/websocket'
require 'eventmachine'
require 'sinatra'
require 'jwt'
require_relative '../secret_key'
require_relative '../models/user'
require_relative '../models/connection'
require_relative '../models/message'
require_relative '../models/like'
require_relative '../models/notification'

$clients = {}
enable :sessions

get '/ws' do
  begin
    decoded_token = JWT.decode(params[:token], $SECRET_KEY, true, { algorithm: 'HS256' })
    @current_user = decoded_token[0]['user_id']
    
    if Faye::WebSocket.websocket?(env)
      ws = Faye::WebSocket.new(env)
      
      ws.on :open do |event|
        puts "Client connected: #{@current_user}"
        $clients[@current_user] = ws
        
        # Update user's last connection time
        user = User.find(@current_user)
        user.update_last_connection
        
        # Send unread notifications
        unread_notifications = Notification.where(user_id: @current_user.to_s, read: 'false')
        if unread_notifications.any?
          ws.send({
            type: 'unread_notifications',
            count: unread_notifications.length,
            notifications: unread_notifications.map do |n|
              {
                id: n.id,
                type: n.type,
                from_user_id: n.from_user_id,
                message: n.message,
                created_at: n.created_at
              }
            end
          }.to_json)
        end
        
        ws.send({ type: 'welcome', message: 'Connected to WebSocket server' }.to_json)
      end
      
      ws.on :message do |event|
        data = JSON.parse(event.data)
        
        case data['type']
        when 'read_notification'
          notification = Notification.find(data['notification_id'])
          if notification && notification.user_id == @current_user.to_s
            notification.read = 'true'
            notification.save
          end
        when 'ping'
          # Update user's last connection time
          user = User.find(@current_user)
          user.update_last_connection
          ws.send({ type: 'pong' }.to_json)
        end
      end
      
      ws.on :close do |event|
        puts "Client disconnected: #{@current_user}"
        $clients.delete(@current_user)
        
        # Update user's last connection time
        user = User.find(@current_user)
        user.update_last_connection
      end
      
      ws.rack_response
    else
      status 400
      "Not a WebSocket connection"
    end
  rescue JWT::DecodeError
    status 401
    { error: 'Invalid token' }.to_json
  end
end
