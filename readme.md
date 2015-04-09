Nodeclam
====

Nodeclam is a Node.js front end for the ClamAV anti-virus scanner. The primary use of it is to allow applications to HTTP POST a file to the application, which then pipes it to ClamAV. The HTTP status code determines whether or not ClamAV flagged it as containing a virus, or not. The response payload simply contains a SHA256 digest of the received file. Callers can use to this verify that nodeclam received the file correctly.

##Installation

You can either run the application by itself, or in a Docker container. A Dockerfile is included to easily deploy this to Docker. The Dockerfile also ensures the application is not running a root, and instead creates a node user.

###Stand alone

    git clone https://github.com/HigherLogic/Nodeclam.git
    cd ./Nodeclam
    npm install
    node ./nodeclam.js

###Docker

    sudo docker build -t nodeclam https://github.com/HigherLogic/Nodeclam.git
    sudo docker run -d -p 80:8080 -i nodeclam

Installing ClamAV depends on your package manager.

###Debian

    sudo apt-get update
    sudo apt-get install clamav

###AWS Linux

    sudo yum install clamav clamav-update

Depending on which package you install, additional configuration may be required.	
