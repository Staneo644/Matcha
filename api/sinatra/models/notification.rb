require_relative './model'

class Notification < Model
  attr_accessor :user_id, :type, :from_user_id, :message, :read

  def self.table_name
    'notifications'
  end

  def self.columns
    ['user_id', 'type', 'from_user_id', 'message', 'read']
  end
  
  # Create notification types
  def self.create_like_notification(liked_id, liker_id)
    liker = User.find(liker_id)
    notification = Notification.new(
      user_id: liked_id.to_s,
      type: 'like',
      from_user_id: liker_id.to_s,
      message: "#{liker.pseudo} liked your profile",
      read: 'false'
    )
    notification.save
    
    # Send real-time notification
    if $clients[liked_id]
      $clients[liked_id].send({
        type: 'notification',
        notification: {
          type: 'like',
          from_user_id: liker_id,
          message: "#{liker.pseudo} liked your profile"
        }
      }.to_json)
    end
  end
  
  def self.create_view_notification(viewed_id, viewer_id)
    viewer = User.find(viewer_id)
    notification = Notification.new(
      user_id: viewed_id.to_s,
      type: 'view',
      from_user_id: viewer_id.to_s,
      message: "#{viewer.pseudo} viewed your profile",
      read: 'false'
    )
    notification.save
    
    # Send real-time notification
    if $clients[viewed_id]
      $clients[viewed_id].send({
        type: 'notification',
        notification: {
          type: 'view',
          from_user_id: viewer_id,
          message: "#{viewer.pseudo} viewed your profile"
        }
      }.to_json)
    end
  end
  
  def self.create_match_notification(user_id, matched_user_id)
    matched_user = User.find(matched_user_id)
    notification = Notification.new(
      user_id: user_id.to_s,
      type: 'match',
      from_user_id: matched_user_id.to_s,
      message: "You matched with #{matched_user.pseudo}!",
      read: 'false'
    )
    notification.save
    
    # Send real-time notification
    if $clients[user_id]
      $clients[user_id].send({
        type: 'notification',
        notification: {
          type: 'match',
          from_user_id: matched_user_id,
          message: "You matched with #{matched_user.pseudo}!"
        }
      }.to_json)
    end
  end
end