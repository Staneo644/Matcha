require 'sinatra'
require_relative '../models/tag'

get '/tags' do
  begin
    tags = Tag.all
    tags.map! do |tag|
      {
        id: tag.id,
        name: tag.name,
      }
    end
    status 200
    { tags: tags }.to_json
  rescue StandardError => e
    status 401
    { error: e.message }.to_json
  end
end

post '/tags' do
  authenticate!
  begin
    tag = Tag.new(name: params[:name])
    if tag.save
      status 201
      { message: 'Tag created successfully' }.to_json
    else
      status 422
      { error: 'Unable to create tag' }.to_json
    end
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end