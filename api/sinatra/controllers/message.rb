post '/message' do
  authenticate!

  begin
    current_user = User.find(@current_user)
    body = params[:body]
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

    message = Message.new(sender_id: @current_user.to_s, connection_id: connection.id.to_s, body: body)
    message.save
    { message: 'Message sent successfully' }.to_json
    status 201
  rescue StandardError => e
    puts e.message
    status 422
    { error: 'Unable to send message' }.to_json
  end
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
