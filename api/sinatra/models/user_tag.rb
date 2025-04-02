require '../database'
require_relative './model'

class User_Tag < Model
  attr_accessor :user_id, :tag_id

  def self.table_name
    'user_tags'
  end

  def self.columns
    ['user_id', 'tag_id']
  end
end
