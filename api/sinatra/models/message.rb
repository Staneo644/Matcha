require '../database'
require_relative './model'

class Message < Model
  attr_accessor :connection_id, :sender_id, :body

  def self.table_name
    'messages'
  end

  def self.columns
    ['connection_id', 'sender_id', 'body']
  end

    
end
