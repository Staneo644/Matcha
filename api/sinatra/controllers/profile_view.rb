require 'sinatra'
require_relative '../models/user'
require_relative '../models/profile_view'
require_relative '../models/notification'

# Record profile view
post '/profile/view/:user_id' do
  authenticate!
  begin
    viewed_user_id = params[:user_id]
    
    # Don't record if viewing own profile
    if viewed_user_id == @current_user.to_s
      status 200
      return { message: 'Own profile view not recorded' }.to_json
    end
    
    # Check if user exists
    viewed_user = User.find(viewed_user_id)
    
    # Record the view
    profile_view = ProfileView.new(
      viewer_id: @current_user.to_s,
      viewed_id: viewed_user_id
    )
    profile_view.save
    
    # Create notification
    Notification.create_view_notification(viewed_user_id, @current_user.to_s)
    
    # Update fame rating
    viewed_user.calculate_fame_rating
    
    status 201
    { message: 'Profile view recorded' }.to_json
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end

# Get profile viewers
get '/profile/viewers' do
  authenticate!
  begin
    views = ProfileView.where(viewed_id: @current_user.to_s)
    
    # Group by viewer and get most recent view
    viewers = {}
    views.each do |view|
      viewer_id = view.viewer_id
      if !viewers[viewer_id] || viewers[viewer_id][:created_at] < view.created_at
        viewers[viewer_id] = {
          id: view.id,
          viewer_id: viewer_id,
          created_at: view.created_at
        }
      end
    end
    
    # Get user details for each viewer
    result = viewers.values.map do |view|
      user = User.find(view[:viewer_id])
      {
        id: user.id,
        pseudo: user.pseudo,
        viewed_at: view[:created_at]
      }
    end
    
    status 200
    { viewers: result }.to_json
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end