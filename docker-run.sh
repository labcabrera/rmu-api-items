#!/bin/bash

docker stop rmu-api-items

docker rm rmu-api-items

docker rmi labcabrera/rmu-api-items:latest

docker build -t labcabrera/rmu-api-items:latest .
0
docker run -d -p 3006:3006 --network rmu-network --name rmu-api-items -h rmu-api-items \
  -e PORT='3006' \
  -e RMU_MONGO_ITEMS_URI='mongodb://admin:admin@rmu-mongo:27017/rmu-items?authSource=admin' \
  -e RMU_API_CORE_URI='http://rmu-api-core:3001/v1' \
  -e RMU_IAM_JWK_URI='http://rmu-keycloak:8080/realms/rmu-local/protocol/openid-connect/certs' \
  -e RMU_KAFKA_BROKERS=rmu-kafka-broker:9092 \
  -e RMU_KAFKA_CLIENT_ID=rmu-api-items \
  -e RMU_KAFKA_CONSUMER_GROUP_ID=rmu-api-items-consumer \
  -e RMU_KAFKA_DEFAULT_PARTITIONS=1 \
  labcabrera/rmu-api-items:latest

docker logs -f rmu-api-items
