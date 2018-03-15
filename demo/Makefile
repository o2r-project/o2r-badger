create_package:
	mkdir package;	\
	git clone -n https://github.com/LukasLohoff/o2r-badger;	cd o2r-badger;	git checkout 58b95b3fedbd68866681e3b7d4aea68ff119c973;	\
	docker build -t badger:demo -f Dockerfile.local .;	cd ..;	docker save badger:demo > package/badger.tar; \
		
	git clone -n https://github.com/LukasLohoff/o2r-extender;	cd o2r-extender;	\
	git checkout b1aa87e94655192ae5cb38e3a2fed01f7142e1e9;	cd ..	\
	
	git clone -n https://github.com/o2r-project/o2r-muncher; 	cd o2r-muncher;	git checkout 0e2a5cfff68a6adeddcf43d2df42fde52849e6fc;	\
	docker build -t muncher:badger-demo .;	cd ..;	docker save muncher:badger-demo > package/muncher.tar; \
	
	docker pull mongo:3.4;	docker save mongo:3.4 > package/mongo.tar;	\
	docker pull nginx:latest;	docker save nginx:latest > package/nginx.tar; \
	zip -r badger_demo.zip package o2r-extender o2r-badger o2r-muncher -x *.git* */node_modules/**\*;	rm -rf package/ o2r-badger/ o2r-muncher/ o2r-extender/;

reproduce:
	wget https://zenodo.org/record/1199272/files/badger_demo.zip;	unzip badger_demo.zip -d  badger_demo;	\
	docker import badger_demo/package/muncher.tar;	docker import badger_demo/package/mongo.tar;	\
	docker import badger_demo/package/badger.tar;	docker import badger_demo/package/nginx.tar;	\
	docker-compose up;