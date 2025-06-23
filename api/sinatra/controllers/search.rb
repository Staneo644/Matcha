require 'sinatra'
require_relative '../models/user'

get '/search' do
  authenticate!
  begin
    current_user = User.find(@current_user)
    
    # Get blocked users to exclude from results
    blocked_users = BlockedUser.where(blocker_id: @current_user.to_s).map(&:blocked_id)
    blocked_by = BlockedUser.where(blocked_id: @current_user.to_s).map(&:blocker_id)
    excluded_users = (blocked_users + blocked_by + [@current_user.to_s]).uniq
    
    # Basic filters
    min_age = params[:min_age]&.to_i || 18
    max_age = params[:max_age]&.to_i || 100
    min_fame = params[:min_fame]&.to_i || 0
    max_fame = params[:max_fame]&.to_i || 100
    max_distance = params[:max_distance]&.to_f || 100
    tags = params[:tags]&.split(',') || []
    
    # Get all users
    users = User.all
    
    # Filter by orientation and gender
    users = users.select do |user|
      # Skip excluded users
      next false if excluded_users.include?(user.id.to_s)
      
      # Filter by orientation
      if current_user.orientation == 'M'
        next false unless user.gender == 'M'
      elsif current_user.orientation == 'W'
        next false unless user.gender == 'W'
      end
      
      # Filter by user's orientation
      if user.orientation == 'M'
        next false unless current_user.gender == 'M'
      elsif user.orientation == 'W'
        next false unless current_user.gender == 'W'
      end
      
      true
    end
    
    # Filter by age
    users = users.select do |user|
      age = ((Time.now - Time.parse(user.birthday)) / (60*60*24*365)).to_i
      age >= min_age && age <= max_age
    end
    
    # Filter by fame rating
    users = users.select do |user|
      fame = user.fame_rating.to_i
      fame >= min_fame && fame <= max_fame
    end
    
    # Filter by distance
    if current_user.location_latitude && current_user.location_longitude
      users = users.select do |user|
        distance = user.distance_from(current_user.location_latitude.to_f, current_user.location_longitude.to_f)
        distance && distance <= max_distance
      end
    end
    
    # Filter by tags
    if tags.any?
      users = users.select do |user|
        user_tags = UserTag.where(user_id: user.id.to_s).map { |ut| Tag.find(ut.tag_id).name }
        (user_tags & tags).any?
      end
    end
    
    # Calculate match score for sorting
    users = users.map do |user|
      # Calculate distance
      distance = current_user.distance_from(user.location_latitude.to_f, user.location_longitude.to_f) || 999
      
      # Calculate common tags
      user_tags = UserTag.where(user_id: user.id.to_s).map { |ut| Tag.find(ut.tag_id).name }
      current_user_tags = UserTag.where(user_id: current_user.id.to_s).map { |ut| Tag.find(ut.tag_id).name }
      common_tags = (user_tags & current_user_tags).length
      
      # Calculate match score (lower is better)
      match_score = distance - (common_tags * 10) - (user.fame_rating.to_i * 0.5)
      
      {
        id: user.id,
        pseudo: user.pseudo,
        gender: user.gender,
        orientation: user.orientation,
        bio: user.bio,
        birthday: user.birthday,
        location_distance: distance.round(1),
        fame_rating: user.fame_rating.to_i,
        tags: user_tags,
        common_tags: common_tags,
        match_score: match_score
      }
    end
    
    # Sort by requested parameter
    sort_by = params[:sort_by] || 'match_score'
    sort_order = params[:sort_order] || 'asc'
    
    users = users.sort_by { |u| u[sort_by.to_sym] }
    users = users.reverse if sort_order == 'desc'
    
    status 200
    { users: users }.to_json
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end
