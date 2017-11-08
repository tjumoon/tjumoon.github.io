---
title: mm-api-server
date: 2017-01-06 10:17:31
tags:
---
1. 启动Redis
	cd ~/Downloads/webtools/redis-3.2.5/src
	./redis-server ../redis.conf
1. 启动Mongodb
	mongod -f /usr/local/etc/mongod.conf
1. 启动mm-api-server
	pm2 start process.json
