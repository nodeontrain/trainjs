#!/bin/sh

TRAIN_DIR=$(pwd)
cd template
../bin/train_command.js s > /dev/null 2>&1 &
TRAINS_PID=$!

cd ..
sleep 1
mocha

kill $TRAINS_PID
kill $(ps aux | grep "$TRAIN_DIR/bin/server.ls" | grep -v grep | awk '{print $2}')
