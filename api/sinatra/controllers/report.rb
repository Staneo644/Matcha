require 'sinatra'
require_relative '../models/user'
require_relative '../models/reported_user'

post '/report/:user_id' do
  authenticate!
  begin
    user_to_report = User.find(params[:user_id])
    reason = params[:reason] || "Fake account"
    
    # Check if already reported
    existing_report = ReportedUser.where(reporter_id: @current_user.to_s, reported_id: user_to_report.id.to_s).first
    if existing_report
      status 200
      return { message: 'User already reported' }.to_json
    end
    
    # Create report
    report = ReportedUser.new(
      reporter_id: @current_user.to_s,
      reported_id: user_to_report.id.to_s,
      reason: reason
    )
    report.save
    
    status 201
    { message: 'User reported successfully' }.to_json
  rescue StandardError => e
    status 422
    { error: e.message }.to_json
  end
end