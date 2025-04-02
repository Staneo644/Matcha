require 'sinatra'
require_relative '../models/user'
require_relative '../models/connection'
require_relative '../models/like'

post '/like' do
  authenticate!
  begin
    user_to_like = User.find(params[:liked_id])
    users = [@current_user, user_to_like]
    connection = Connection.where(user1_id: users.min.to_s, user2_id: users.max.to_s).first
    if connection && like_type != "like"
      # If a connection already exists and the like type is not "like", destroy the connection
      connection.destroy
    end
    like = Like.new(liker_id: @current_user.to_s, liked_id: user_to_like.id.to_s, like_type: params[:like_type])
    like.save
    other_like = Like.where(liker_id: user_to_like.id.to_s, liked_id: @current_user.to_s).first
    if like.like_type == "like" && other_like && other_like.like_type == "like"
      # Create a connection if both users liked each other
      list_user = [@current_user, user_to_like.id]
      connection = Connection.new(user1_id: list_user.min.to_s, user2_id: list_user.max.to_s)
      connection.save
    end
    status 201
    { message: 'User liked and matched successfully' }.to_json
    
  rescue StandardError => e
    puts e.message
    status 422
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
