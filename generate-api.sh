#!/bin/bash

rm -r ./generated-server

openapi-generator-cli generate -i openapi.yaml -g nodejs-express-server -o ./generated-server