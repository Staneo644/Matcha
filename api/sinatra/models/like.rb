require '../database'
require_relative './model'

class Like < Model
  attr_accessor :like_type, :liker_id, :liked_id

  def self.table_name
    'likes'
  end

  def self.columns
    ['like_type', 'liker_id', 'liked_id']
  end

  def self.between(liker_id, liked_id)
    res = DB.query("SELECT * FROM likes WHERE liker_id = #{liker_id} AND liked_id = #{liked_id} LIMIT 1").first
    res
  end

end