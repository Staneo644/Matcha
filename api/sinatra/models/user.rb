require_relative './model'
require 'bcrypt'

class User < Model
  attr_accessor :email, :password_hash, :pseudo, :birthday, :gender, :orientation, :bio, :want_location, :location_latitude, :location_longitude

  def self.table_name
    'users'
  end

  def self.columns
    ['email', 'password_hash', 'pseudo', 'birthday', 'gender', 'orientation', 'bio', 'want_location', 'location_latitude', 'location_longitude']
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
    BCrypt::Password.new(res['password_hash']) == password ? User.new(res) : nil
  end
end