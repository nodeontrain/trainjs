#!/bin/sh

BASEDIR=$(pwd $0)

rm -rf /tmp/my_app
rm -rf /tmp/scaffold_app
rm -rf /tmp/sample_app
rm -rf /tmp/generate_database
rm -rf /tmp/generate_model
rm -rf /tmp/generate_service
./bin/train_command.js new /tmp/my_app
./bin/train_command.js new /tmp/scaffold_app
./bin/train_command.js new /tmp/sample_app
./bin/train_command.js new /tmp/generate_database
./bin/train_command.js new /tmp/generate_model
./bin/train_command.js new /tmp/generate_service

cd /tmp/scaffold_app
eval "$BASEDIR/bin/train_command.js generate scaffold User name:string email:string"

cd /tmp/sample_app
eval "$BASEDIR/bin/train_command.js generate controller StaticPages home help"

cd /tmp/generate_database
eval "$BASEDIR/bin/train_command.js generate database mysql"

cd /tmp/generate_model
eval "$BASEDIR/bin/train_command.js generate model User name:string email:string"
eval "$BASEDIR/bin/train_command.js generate model Micropost content:text user:references"

cd /tmp/generate_service
eval "$BASEDIR/bin/train_command.js generate service User"

cd $BASEDIR
mocha test/*_spec.js
