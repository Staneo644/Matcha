require_relative './model'
require 'bcrypt'

class User < Model
  attr_accessor :email, :password_hash, :pseudo, :birthday, :gender, :orientation, :bio, 
                :want_location, :location_latitude, :location_longitude, :verified, 
                :verification_token, :reset_token, :reset_token_expiry, :fame_rating, 
                :last_connection

  def self.table_name
    'users'
  end

  def self.columns
    ['email', 'password_hash', 'pseudo', 'birthday', 'gender', 'orientation', 'bio', 
     'want_location', 'location_latitude', 'location_longitude', 'verified', 
     'verification_token', 'reset_token', 'reset_token_expiry', 'fame_rating', 
     'last_connection']
  end

  def distance_from(latitude, longitude)
    return nil if self.location_latitude.nil? || self.location_longitude.nil?

    r = 6371
    dlat = (latitude - self.location_latitude) * Math::PI / 180
    dlon = (longitude - self.location_longitude) * Math::PI / 180
    a = Math.sin(dlat / 2) ** 2 + Math.cos(self.location_latitude * Math::PI / 180) * Math.cos(latitude * Math::PI / 180) * Math.sin(dlon / 2) ** 2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    distance = r * c
    distance
  end

  def self.authenticate(email, password)
    res = DB.query("SELECT * FROM users WHERE email = '#{DB.escape(email)}' LIMIT 1").first
    return nil unless res
    return nil unless res['verified'] == 1
    BCrypt::Password.new(res['password_hash']) == password ? User.new(res) : nil
  end
  
  # Update last connection time
  def update_last_connection
    self.last_connection = Time.now.to_s
    self.save
  end
  
  # Calculate fame rating based on profile views and likes
  def calculate_fame_rating
    views = ProfileView.where(viewed_id: self.id.to_s).count
    likes = Like.where(liked_id: self.id.to_s).count
    
    # Simple algorithm: (views + likes*2) / 10, max 100
    rating = [(views + likes*2) / 10, 100].min
    self.fame_rating = rating.to_s
    self.save
    rating
  end
end
