post '/messages' do
    halt(401, "Unauthorized") unless @current_user
    recipient_id = params[:recipient_id]
    content = params[:content]
    
    if @current_user.matches.map(&:id).include?(recipient_id.to_i)
      Message.create(sender_id: @current_user.id, receiver_id: recipient_id, content: content)
      redirect '/messages'
    else
      halt(403, "Forbidden")
    end
  end
  
  get '/messages' do
    halt(401, "Unauthorized") unless @current_user
    @messages = Message.where(sender_id: @current_user.id).or(receiver_id: @current_user.id).all
    erb :messages
  end