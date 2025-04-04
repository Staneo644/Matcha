require 'sinatra'
require_relative '../models/user'

get '/search' do
  authenticate!
  begin
    birthdate_range = params[:birthdate_range] # Expected format: "YYYY-MM-DD,YYYY-MM-DD"
    location = params[:location]
    distance = params[:distance].to_f
    tags = params[:tags]&.split(',')

    users = User.all

    if birthdate_range
      start_date, end_date = birthdate_range.split(',').map { |date| Date.parse(date) }
      users = users.where(birthdate: start_date..end_date)
    end

    if location && distance > 0
      latitude, longitude = location.split(',').map(&:to_f)
      users = users.select do |user|
      user.distance_from(latitude, longitude) <= distance
      end
    end

    if tags && tags.any?
      users = users.select do |user|
        user_tags = user_tags.where(user_id: user.id).map { |user_tag| user_tag.tag_id.to_s }
        (user_tags & tags).any?
      end
    end

    users.to_json
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end