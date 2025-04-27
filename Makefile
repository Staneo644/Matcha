NAME := docker-compose.yml

all : build up

build:
	sudo docker compose -f $(NAME) build

up:
	sudo docker compose -f $(NAME) up -d

down:
	sudo docker compose -f $(NAME) down

downv:
	sudo docker compose -f $(NAME) down -v

clean: down
	sudo docker system prune -af
	sudo docker volume prune -f
	

re: clean all
