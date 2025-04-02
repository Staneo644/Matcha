require '../database'
require_relative './model'

class Tag < Model
  attr_accessor :name

  def self.table_name
    'tags'
  end

  def self.columns
    ['name']
  end
end
