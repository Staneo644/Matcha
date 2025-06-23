require 'sinatra'
require_relative '../models/user'
require_relative '../models/blocked_user'

post '/block/:user_id' do
  authenticate!
  begin
    user_to_block = User.find(params[:user_id])
    
    # Check if already blocked
    existing_block = BlockedUser.where(blocker_id: @current_user.to_s, blocked_id: user_to_block.id.to_s).first
    if existing_block
      status 200
      return { message: 'User already blocked' }.to_json
    end
    
    # Create block
    block = BlockedUser.new(
      blocker_id: @current_user.to_s,
      blocked_id: user_to_block.id.to_s
    )
    block.save
    
    # Remove any existing connection
    users = [@current_user.to_s, user_to_block.id.to_s]
    connection = Connection.where(user1_id: users.min, user2_id: users.max).first
    if connection
      connection.destroy
    end
    
    # Remove any existing likes
    like = Like.where(liker_id: @current_user.to_s, liked_id: user_to_block.id.to_s).first
    if like
      like.destroy
    end
    
    like = Like.where(liker_id: user_to_block.id.to_s, liked_id: @current_user.to_s).first
    if like
      like.destroy
    end
    
    status 201
    { message: 'User blocked successfully' }.to_json
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end

post '/unblock/:user_id' do
  authenticate!
  begin
    block = BlockedUser.where(blocker_id: @current_user.to_s, blocked_id: params[:user_id]).first
    
    if block
      block.destroy
      status 200
      { message: 'User unblocked successfully' }.to_json
    else
      status 404
      { error: 'Block not found' }.to_json
    end
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end

get '/blocked-users' do
  authenticate!
  begin
    blocks = BlockedUser.where(blocker_id: @current_user.to_s)
    
    blocked_users = blocks.map do |block|
      user = User.find(block.blocked_id)
      {
        id: user.id,
        pseudo: user.pseudo,
        blocked_at: block.created_at
      }
    end
    
    status 200
    { blocked_users: blocked_users }.to_json
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end