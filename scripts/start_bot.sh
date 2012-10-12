cd `pwd`/node_modules/hubot
./node_modules/coffee-script/bin/coffee ./bin/hubot -a simplechat &
echo $! > ../../tmp/bot.pid