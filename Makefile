NAME := docker-compose.yml

all : build up

build:
	sudo docker compose -f $(NAME) build

up:
	sudo docker compose -f $(NAME) up -d && \
	make start

down:
	sudo docker compose -f $(NAME) down  && \
	make stop

downv:
	sudo docker compose -f $(NAME) down -v

clean: down
	sudo docker system prune -af
	sudo docker volume prune -f

start:
	@cd frontend && \
	npm start

stop:
	@cd frontend && \
	npm stop

re: clean all

.PHONY: all build up down downv clean start stop re
