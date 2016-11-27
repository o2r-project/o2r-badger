Inital README

First you have to pull our repository to your machine and install nodejs. 
The node-modules have to be included in your test folder.

To run the Testfile:

> npm install mocha 
> npm test

## Scalability Badge
This badge provides a scalable badges that can be embed on a third party site.

## Checklist of our task :
 * Implementation of the scaling part
 * API for DOAJ (Directory of Open Access Journals)
 * Running a Docker Container
 * Writing a Documentation and tests
 
 
## Installation
 We used [Docker](https://www.docker.com/) to create a consistent environment. Docker is a software containerization platform that allows the users to run their projects in containers. Instead of virtual machines being created there are containers that are much more lightweight as compared to virtual machines. Basically you first make a Dockerfile, from which you then create a Docker image and then finally you run that image in the form of containers to check out the results of the project. Make sure that you have installed Docker [Docker installation](https://docs.docker.com/engine/installation/) and all the dependencies according to the operating system you use.
 
1. Clone the project from Gitlab using the following command:
    git clone https://zivgitlab.uni-muenster.de/geocontainer-badges/scalability
2. Navigate into the project folder with the Dockerfile
3. Now build the docker image and run it in a docker container:
    docker build -t scalability .    //creates the image 
    docker run -p 80:3000 scalability   //runs the image in a container
Finally have a look at the results on the localhost 3000. 
