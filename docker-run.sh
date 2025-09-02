#!/bin/bash

docker stop rmu-api-items

docker rm rmu-api-items

docker rmi labcabrera/rmu-api-items:latest

docker build -t labcabrera/rmu-api-items:latest .
0
docker run -d -p 3006:3006 --network rmu-network --name rmu-api-items -h rmu-api-items \
  -e PORT='3006' \
  -e RMU_MONGO_items_URI='mongodb://admin:admin@rmu-mongo:27017/rmu-items?authSource=admin' \
  -e RMU_IAM_TOKEN_URI='http://rmu-keycloak:8080/realms/rmu-local/protocol/openid-connect/token' \
  -e RMU_IAM_JWK_URI='http://rmu-keycloak:8080/realms/rmu-local/protocol/openid-connect/certs' \
  -e RMU_IAM_CLIENT_ID=rmu-client \
  -e RMU_IAM_CLIENT_SECRET=1tUzPc24SYJMPpX37g2eymEoS9C3Ttzw \
  -e RMU_KAFKA_BROKERS=rmu-kafka-broker:9092 \
  -e RMU_KAFKA_CLIENT_ID=rmu-api-items \
  labcabrera/rmu-api-items:latest

docker logs -f rmu-api-items
