create_package:
	git clone -n https://github.com/o2r-project/o2r-badger;	cd o2r-badger;	git checkout 0b00d72732290aa841e18fb601f8eb2db7496efe;	\
	docker build -t badger:demo -f Dockerfile.local .;	cd ..;	docker save badger:demo > badger.tar; \
		
	git clone -n https://github.com/o2r-project/o2r-extender;	cd o2r-extender;	\
	git checkout 3b299a186cc40a992b211775f451756b993f04cd;	cd ..	\
	
	git clone -n https://github.com/o2r-project/o2r-muncher; 	cd o2r-muncher;	git checkout c432251f8ca4f5496f3cae3a956b81878186ca89;	\
	docker build -t muncher:badger-demo .;	cd ..;	docker save muncher:badger-demo > muncher.tar; \
	
	docker pull mongo:3.4;	docker save mongo:3.4 > mongo.tar;	\
	docker pull nginx:latest;	docker save nginx:latest > nginx.tar; \
	zip -r badger_demo.zip .;	rm -rf o2r-badger/ o2r-muncher/ o2r-extender/;	rm -f muncher.tar badger.tar mongo.tar nginx.tar

reproduce:
	wget https://sandbox.zenodo.org/record/12345/files/badger_demo.zip;	unzip badger_demo.zip;	\
	docker import muncher.tar;	docker import mongo.tar;	docker import badger.tar;	docker import nginx.tar;	\
	docker-compose up;	\
	xdg-open http://localhost/index.html