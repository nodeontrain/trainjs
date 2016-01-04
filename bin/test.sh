#!/bin/sh

BASEDIR=$(pwd $0)

rm -rf /tmp/my_app
rm -rf /tmp/scaffold_app
rm -rf /tmp/sample_app
./bin/train_command.js new /tmp/my_app
./bin/train_command.js new /tmp/scaffold_app
./bin/train_command.js new /tmp/sample_app

cd /tmp/scaffold_app
eval "$BASEDIR/bin/train_command.js generate scaffold User name:string email:string"

cd /tmp/sample_app
eval "$BASEDIR/bin/train_command.js generate controller StaticPages home help"

cd $BASEDIR
mocha test/*_spec.js
