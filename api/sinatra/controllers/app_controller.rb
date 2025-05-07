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

