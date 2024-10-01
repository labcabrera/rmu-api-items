#!/bin/bash

docker stop rmu-api-items

docker rm rmu-api-items

docker rmi labcabrera/rmu-api-items:latest

docker build -t labcabrera/rmu-api-items:latest .

docker run -d -p 3006:3006 --network rmu-network --name rmu-api-items -h rmu-api-items -e PORT='3006' labcabrera/rmu-api-items:latest

docker logs -f rmu-api-items
