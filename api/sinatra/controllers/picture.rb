get '/pictures' do
  authenticate!
  begin
    pictures = Picture.where({user_id: @current_user.to_s})
    pictures.map! do |picture|
      {
        id: picture.id,
        created_at: picture.created_at,
        url: picture.url
      }
    end
    status 200
    { pictures: pictures }.to_json
  rescue StandardError => e
    status 401
    { error: e.message }.to_json
  end
end

post '/pictures' do
  authenticate!
  begin
    picture = Picture.new(user_id: @current_user.to_s, url: params[:url])
    if picture.save
      status 201
      { message: 'Picture created successfully' }.to_json
    else
      status 422
      { error: 'Unable to create picture' }.to_json
    end
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end