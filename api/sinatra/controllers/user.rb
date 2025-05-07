require 'sinatra'
require_relative '../models/user'
require_relative '../models/connection'

post '/user' do
  begin
    password = params.fetch(:password)
    if password.length < 8 || password.length > 72 || password !~ /[a-z]/ || password !~ /[A-Z]/ || password !~ /[0-9]/
      raise KeyError, "password"
      status 400
      return { error: "Password must be between 8 and 72 characters and contain at least one lowercase letter, one uppercase letter, and one digit." }.to_json
    end
    password_hash = BCrypt::Password.create(password)

    location_results = Geocoder.search(params.fetch(:location))
    if location_results.empty? || location_results.first.nil?
      status 400
      return { error: "Invalid location." }.to_json
    end
    location = location_results.first
    user = User.new(
      email: params.fetch(:email), 
      password_hash: password_hash, 
      pseudo: params.fetch(:pseudo), 
      birthday: params.fetch(:birthday),
      gender: params.fetch(:gender),
      orientation: params.fetch(:orientation),
      bio: params.fetch(:bio),
      want_location: params.fetch(:want_location),
      location_latitude: location.latitude.to_s,
      location_longitude: location.longitude.to_s
    )
    if user.save
      session[:user_id] = user.id
      redirect '/'
    else
      status 400
      return { error: "Unable to create user." }.to_json
    end
  rescue KeyError => e
    status 400
    @error = "Missing parameter: #{e.message}"
  end
end

patch '/user' do
  authenticate!
  begin
    user = User.find(@current_user)
    if user
      user.email = params[:email] || user.email
      user.pseudo = params[:pseudo]
      user.birthday = params[:birthday] || user.birthday
      user.gender = params[:gender] || user.gender
      user.orientation = params[:orientation] || user.orientation
      user.bio = params[:bio] || user.bio
      user.want_location = params[:want_location] || user.want_location

      if params[:location]
        location_results = Geocoder.search(params[:location])
        if location_results.empty? || location_results.first.nil?
          status 400
          return { error: "Invalid location." }.to_json
        end
        location = location_results.first
        user.location_latitude = location.latitude.to_s
        user.location_longitude = location.longitude.to_s
      end
      user.save
      status 200
      { message: "User updated successfully." }.to_json
    else
      status 404
      { error: "User not found." }.to_json
    end
  rescue KeyError => e
    status 500
    { error: "An error occurred: #{e.message}" }.to_json
  end
end

delete '/user' do
  authenticate!
  begin
    user = User.find(@current_user)
    if user
      user.destroy
      session.clear
      status 200
      { message: "User deleted successfully." }.to_json
    else
      status 404
      { error: "User not found." }.to_json
    end
  rescue KeyError => e
    status 420
    { error: "An error occurred: #{e.message}" }.to_json
  end
end