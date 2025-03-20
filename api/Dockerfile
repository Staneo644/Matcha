FROM ruby:3.0

RUN apt-get update -qq && apt-get install -y build-essential

COPY Gemfile ./
#COPY Gemfile.lock /sinatra/Gemfile.lock

RUN bundle install

COPY /sinatra .

EXPOSE 4567

ENV PORT=4567
CMD ["ruby", "app.rb", "-o", "0.0.0.0"]
