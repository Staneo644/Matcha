require 'sinatra'
require_relative '../models/user'

get '/search' do
  authenticate!
  # begin
    birthday_range_min = params[:birthday_range_min]
    birthday_range_max = params[:birthday_range_max]
    location_latitude = params[:location_latitude].to_f
    location_longitude = params[:location_longitude].to_f
    fame_rating_min = params[:fame_rating_min].to_f
    fame_rating_max = params[:fame_rating_max].to_f

    distance = params[:distance].to_f
    tags = params[:tags]&.split(',')

    users = User.all
    users = users.reject { |user| user.id == @current_user }
    blocked_users = Like.where(liker_id: @current_user.to_s, like_type: 'block').map(&:liked_id)
    users = users.reject { |user| blocked_users.include?(user.id) }

    if birthday_range_min
      users = users.reject do |user|
        Date.parse(user.birthday.to_s) < Date.parse(birthday_range_min)
      end
    end

    if birthday_range_max
      users = users.reject do |user|
        Date.parse(user.birthday.to_s) > Date.parse(birthday_range_max)
      end
    end

    if location_latitude && location_longitude && distance > 0
      users = users.select do |user|
      user.distance_from(location_latitude, location_longitude) <= distance
      end
    end

    if tags && tags.any?
      users = users.select do |user|
        user_tags = User_Tag.where(user_id: user.id.to_s).map { |user_tag| user_tag.tag_id.to_s }
        (user_tags & tags).any?
      end
    end

    if fame_rating_min
      users = users.select do |user|
        number_like = Like.where(liked_id: user.id.to_s, like_type: 'like').count
        number_view = Like.where(liked_id: user.id.to_s, like_type: 'block').count + Like.where(liked_id: user.id.to_s, like_type: 'view').count + number_like
        if number_view == 0
          fame_rating = 0
        else
          fame_rating = number_like.to_f / number_view.to_f
        end
        fame_rating >= fame_rating_min
      end
    end

    if fame_rating_max
      users = users.select do |user|
        number_like = Like.where(liked_id: user.id.to_s, like_type: 'like').count
        number_view = Like.where(liked_id: user.id.to_s, like_type: 'block').count + Like.where(liked_id: user.id.to_s, like_type: 'view').count + number_like
        if number_view == 0
          fame_rating = 0
        else
          fame_rating = number_like.to_f / number_view.to_f
        end
        fame_rating <= fame_rating_max
      end
    end

    users.map! do |user|
      {
        id: user.id,
      }
      end
    status 200
    { users: users }.to_json
  # rescue StandardError => e
  #   status 422
  #   { error: e.message }.to_json
  # end
end