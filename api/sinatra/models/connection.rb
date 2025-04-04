require '../database'
require_relative './model'

class Connection < Model
  attr_accessor :user1_id, :user2_id, :number_message_unread_user1, :number_message_unread_user2

  def self.table_name
    'connections'
  end

  def self.columns
    ['user1_id', 'user2_id', 'number_message_unread_user1', 'number_message_unread_user2']
  end

  def self.between(user1_id, user2_id)
    sorted_ids = [user1_id, user2_id].sort
    res = DB.query("SELECT * FROM connections WHERE user1_id = #{sorted_ids[0]} AND user2_id = #{sorted_ids[1]} LIMIT 1").first
    res
  end
end