require 'sinatra'
require_relative '../models/user_tag'
require_relative '../models/tag'

get '/user_tags' do
  authenticate!
  begin
    user_tags = User_Tag.where({user_id: @current_user.to_s})
    user_tags.map! do |user_tag|
      tag = Tag.find(user_tag.tag_id)
      {
        id: user_tag.id,
        created_at: user_tag.created_at,
        tag: {
          id: tag.id,
          name: tag.name
        }
      }
    end
    status 200
    { user_tags: user_tags }.to_json
  rescue StandardError => e
    status 401
    { error: e.message }.to_json
  end
end

post '/user_tags' do
  authenticate!
  begin
    tag = Tag.find(params[:tag_id])
    user_tags = User_Tag.where({user_id: @current_user.to_s})
    if user_tags.length >= 5
      halt 422, { error: 'You can only have 5 tags' }.to_json
      
    end
    user_tag = User_Tag.new(user_id: @current_user.to_s, tag_id: tag.id.to_s)
    if user_tag.save
      status 201
      { message: 'User tag created successfully' }.to_json
    else
      status 422
      { error: 'Unable to create user tag' }.to_json
    end
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end

delete '/user_tags' do
  authenticate!
  begin
    user_tag = User_Tag.find(params[:tag_id])
    if user_tag.nil?
      status 404
      { error: 'User tag not found' }.to_json
      return
    end
    if user_tag.user_id.to_s != @current_user.to_s
      status 403
      { error: 'You are not authorized to delete this user tag' }.to_json
      return
    end
    if user_tag.destroy
      status 200
      { message: 'User tag deleted successfully' }.to_json
    else
      status 422
      { error: 'Unable to delete user tag' }.to_json
    end
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end