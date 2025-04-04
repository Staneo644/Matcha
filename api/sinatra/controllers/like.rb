require 'sinatra'
require_relative '../models/user'
require_relative '../models/connection'
require_relative '../models/like'

post '/like' do
  authenticate!
  begin
    user_to_like = User.find(params[:liked_id])
    current_user = User.find(@current_user)
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
    other_like = Like.where(liker_id: user_to_like.id.to_s, liked_id: @current_user.to_s).first
    if like.like_type == "like" && other_like && other_like.like_type == "like"
      list_user = [current_user.id, user_to_like.id]
      connection = Connection.new(user1_id: list_user.min.to_s, user2_id: list_user.max.to_s, number_message_unread_user1: '0', number_message_unread_user2: '0')
      connection.save
    end
    $clients[other_user].send(
      {type: 'message', message: {sender_id: @current_user, body: body, connection_id: connection.id}}.to_json
     ) if $clients[other_user]
    status 201
    { message: 'User liked and matched successfully' }.to_json
    
  rescue StandardError => e
    status 422
    puts e.message
    { error: 'Unable to like user' }.to_json
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
