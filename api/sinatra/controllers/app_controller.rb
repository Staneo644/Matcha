require 'sinatra'
require_relative '../models/user'
require_relative '../models/like'
require_relative '../models/message'
require_relative '../secret_key'
require 'jwt'
require 'bcrypt'
require_relative '../geocoder'

enable :sessions

def authenticate!
  token = request.env["HTTP_AUTHORIZATION"]&.split(' ')&.last
  return halt 401, { error: 'Token missing' }.to_json unless token

  begin
    decoded_token = JWT.decode(token, $SECRET_KEY, true, { algorithm: 'HS256' })
    @current_user = decoded_token[0]['user_id'] # Récupération de l'utilisateur
  rescue JWT::DecodeError
    halt 401, { error: 'Invalid token' }.to_json
  end
end

get '/' do
  puts session[:user_id]
end

get '/register' do
  erb :register
end

post '/register' do
  begin
    password = params.fetch(:password)
    if password.length < 8 || password.length > 72 || password !~ /[a-z]/ || password !~ /[A-Z]/ || password !~ /[0-9]/
      raise KeyError, "password"
      status 400
      @error = "Password must be between 8 and 72 characters and contain at least one lowercase letter, one uppercase letter, and one digit."
    end
    password_hash = BCrypt::Password.create(password)

    location_results = Geocoder.search(params.fetch(:location))
    if location_results.empty? || location_results.first.nil?
      status 400
      @error = "Invalid location."
      return
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
      @error = "Registration failed."
    end
  rescue KeyError => e
    status 400
    @error = "Missing parameter: #{e.message}"
  end
end

get '/login' do
  erb :login
end

post '/login' do
  begin
    user = User.authenticate(params.fetch(:email), params.fetch(:password))
    if user
      session[:user_id] = user.id
      payload = { user_id: user.id, exp: Time.now.to_i + 36000 } # Expiration dans 1h
      token = JWT.encode(payload, $SECRET_KEY, 'HS256')
      status 200
      { token: token }.to_json

    else
      status 400
      @error = "Invalid email or password."
    end
  rescue KeyError => e
    status 400
    @error = "Missing parameter: #{e.message}"
  end
end

get '/logout' do
  session.clear
  redirect '/login'
end