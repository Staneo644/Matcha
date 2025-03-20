NAME := docker-compose.yml

all : build up

build:
	docker compose -f $(NAME) build

up:
	docker compose -f $(NAME) up -d

down:
	docker compose -f $(NAME) down

clean: down
	docker system prune -af
	docker volume prune -f
	

re: clean all