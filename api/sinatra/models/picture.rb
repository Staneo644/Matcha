require_relative '../database'
require_relative './model'

class Picture < Model
  attr_accessor :user_id, :name, :data

  def self.table_name
    'pictures'
  end

  def self.columns
    ['user_id', 'name', 'data']
  end
end