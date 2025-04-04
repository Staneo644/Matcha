require 'base64'
require 'zlib'
require_relative '../models/user'
require_relative '../models/picture'
require 'sinatra'

def get_pictures(user_id)
  pictures = Picture.where({user_id: user_id})
  pictures.map! do |picture|
    {
      id: picture.id,
      created_at: picture.created_at,
      # data: Zlib::Inflate.inflate(picture.data),
      data: Base64.encode64(Zlib::Inflate.inflate(picture.data)),
      name: picture.name,
    }
  end
  pictures
end

get '/pictures' do
  authenticate!
  begin
    user_id = params[:user_id] || @current_user.to_s
    pictures = get_pictures(user_id)
    status 200
    { pictures: pictures }.to_json
  rescue StandardError => e
    status 401
    { error: e.message }.to_json
  end
end

post '/pictures' do
  # authenticate!
  begin
    puts params.inspect
    puts params['image'].inspect
    file = params['image'][:tempfile].read
    name = params['image'][:filename]
    max_size = 2 * 1024 * 1024
    # puts file.inspect
    puts name

    puts file.size
    if file.size <= max_size
      compressed = Zlib::Deflate.deflate(file)
      picture = Picture.new(user_id: 1.to_s, data: compressed, name: name.to_s)
      if picture.save
        status 201
        { message: 'Picture created successfully' }.to_json
      else
        status 422
        { error: 'Unable to create picture' }.to_json
      end
    else
      status 422
      { error: 'File type not supported or file too large' }.to_json
    end

  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end