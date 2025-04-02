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

  def self.authenticate(email, password)
    res = DB.query("SELECT * FROM users WHERE email = '#{DB.escape(email)}' LIMIT 1").first
    puts res.inspect
    BCrypt::Password.new(res['password_hash']) == password ? User.new(res) : nil
  end
end