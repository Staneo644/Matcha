require 'sinatra'
require_relative '../models/user'
require_relative '../models/connection'
require_relative '../models/like'
require_relative '../models/picture'
require_relative '../models/notification'

post '/like' do
  authenticate!
  begin
    user_to_like = User.find(params[:liked_id])
    current_user = User.find(@current_user)
    
    # Check if user has profile picture
    user_pictures = Picture.where(user_id: @current_user.to_s)
    if user_pictures.empty?
      status 400
      return { error: 'You need a profile picture to like other users' }.to_json
    end
    
    users = [current_user.id, user_to_like.id]
    connection = Connection.where(user1_id: users.min.to_s, user2_id: users.max.to_s).first
    like_type = params[:like_type]
    
    if connection && like_type != "like"
      connection.destroy
    end
    
    old_like = Like.where(liker_id: @current_user.to_s, liked_id: user_to_like.id.to_s).first
    if old_like && old_like.like_type == like_type
      status 200
      return { message: 'Like already exists' }.to_json
    end
    
    like = Like.new(liker_id: @current_user.to_s, liked_id: user_to_like.id.to_s, like_type: like_type)
    like.save
    
    # Create notification
    Notification.create_like_notification(user_to_like.id.to_s, @current_user.to_s)
    
    # Update fame rating
    user_to_like.calculate_fame_rating
    
    other_like = Like.where(liker_id: user_to_like.id.to_s, liked_id: @current_user.to_s).first
    if like.like_type == "like" && other_like && other_like.like_type == "like"
      list_user = [current_user.id, user_to_like.id]
      connection = Connection.new(
        user1_id: list_user.min.to_s, 
        user2_id: list_user.max.to_s, 
        number_message_unread_user1: '0', 
        number_message_unread_user2: '0'
      )
      connection.save
      
      # Create match notifications for both users
      Notification.create_match_notification(@current_user.to_s, user_to_like.id.to_s)
      Notification.create_match_notification(user_to_like.id.to_s, @current_user.to_s)
      
      status 201
      return { message: 'User liked and matched successfully', matched: true }.to_json
    end
    
    status 201
    { message: 'User liked successfully', matched: false }.to_json
    
  rescue StandardError => e
    status 422
    puts e.message
    { error: 'Unable to like user' }.to_json
  end
end

# Add unlike endpoint
post '/unlike/:user_id' do
  authenticate!
  begin
    user_to_unlike = User.find(params[:user_id])
    
    # Find and delete the like
    like = Like.where(liker_id: @current_user.to_s, liked_id: user_to_unlike.id.to_s).first
    if like
      like.destroy
      
      # Check if there's a connection and destroy it
      users = [@current_user.to_s, user_to_unlike.id.to_s]
      connection = Connection.where(user1_id: users.min, user2_id: users.max).first
      if connection
        connection.destroy
      end
      
      # Notify the other user
      if $clients[user_to_unlike.id.to_s]
        $clients[user_to_unlike.id.to_s].send({
          type: 'notification',
          notification: {
            type: 'unlike',
            from_user_id: @current_user,
            message: "A user has unliked your profile"
          }
        }.to_json)
      end
      
      status 200
      { message: 'User unliked successfully' }.to_json
    else
      status 404
      { error: 'Like not found' }.to_json
    end
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end

get '/likes' do
  authenticate!
  begin
    current_user = User.find(@current_user)
    likes = Like.where(liker_id: current_user.id.to_s)
    likes.map! do |like|
      user = User.find(like.liked_id)
      {
        id: user.id,
        name: user.pseudo,
      }
    end
    status 200
    { likes: likes }.to_json
  rescue StandardError => e
    status 401
    { error: e.message }.to_json
  end
end
