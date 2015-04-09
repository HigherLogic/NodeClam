FROM    node:0.12.2
MAINTAINER Kevin Jones (kjones@higherlogic.com)
COPY    . /etc/nodeclam
ADD     ./nodeclam-cron /etc/cron.d/
RUN     adduser --system -shell /usr/sbin/nologin node
RUN     cd /etc/nodeclam; npm install
EXPOSE  8080
RUN     apt-get --assume-yes update
RUN     apt-get --assume-yes install clamav
RUN     freshclam
USER    node
CMD     ["node", "/etc/nodeclam/nodeclam.js"]
