create_package:
	mkdir images; \
	git clone -n https://github.com/o2r-project/o2r-badger; \
	cd o2r-badger; git checkout 5f54e81d0fd5c682dab07e2aa4dc0f2ec4d691c0; \
	docker build -t badger:demo -f Dockerfile .; \
	cd ..; \
	docker save badger:demo > images/badger.tar; \

	git clone -n https://github.com/LukasLohoff/o2r-extender; cd o2r-extender; \
	git checkout b1aa87e94655192ae5cb38e3a2fed01f7142e1e9; \
	cd ..;
	
	git clone -n https://github.com/o2r-project/o2r-muncher; \
	cd o2r-muncher;	git checkout 0e2a5cfff68a6adeddcf43d2df42fde52849e6fc;	\
	docker build -t muncher:badger-demo .; \
	cd ..; \
	docker save muncher:badger-demo > images/muncher.tar;
	
	docker pull mongo:3.4; docker tag mongo:3.4 mongo:badger-demo; \
	docker save mongo:badger-demo > images/mongo.tar; \
	docker pull nginx:latest; docker tag nginx:latest nginx:badger-demo; \
	docker save nginx:badger-demo > images/nginx.tar; \

	zip -r badger_demo.zip images o2r-extender o2r-badger o2r-muncher -x *.git* */node_modules/**\*; \
	cd o2r-badger/demo; zip ../../badger_demo.zip README.md Makefile docker-compose.yml nginx.conf html; \

	rm -rf images/ o2r-badger/ o2r-muncher/ o2r-extender/; \
	docker rmi badger:demo muncher:badger-demo mongo:badger-demo nginx:badger-demo; \

download:
	wget https://zenodo.org/record/1199272/files/badger_demo.zip; \
	unzip badger_demo.zip -d badger_demo; \
	cd badger_demo;

reproduce:
	docker load --input images/muncher.tar; \
	docker load --input images/mongo.tar; \
	docker load --input images/badger.tar; \
	docker load --input images/nginx.tar; \
	docker-compose up;

clean_up:
	docker-compose down;