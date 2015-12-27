#!/bin/sh

rm -rf /tmp/my_app
./bin/train_command.js new /tmp/my_app > /dev/null 2>&1 &

mocha
