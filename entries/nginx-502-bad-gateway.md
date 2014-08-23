author:Paul Mohr
created:2014-08-23 16:08:13
|||||||||||||||||||||||||||||||
Nginx 502 Bad Gateway after update
==================================

After the weekly apt-get update && apt-get upgrade all sites suddenly displayed an evil "502 Bad Gateway" error.
We are using php-fpm to serve php files out of nginx and the issue was wrong permissions on the /var/run/php5-fpm.sock socket.

If you are experiencing the same problem, a quick check to see if that's your problem is to
    
    chmod 0777 /var/run/php5-fpm.sock

If everything is working again: Congratulations.
Now we have to fix the problem permanently. Open your php-fpm pool configuration file (/etc/php5/fpm/pool.d/www.conf) and uncomment the following lines:

    listen.owner = www-data
    listen.group = www-data
    listen.mode = 0666

Then restart php5-fpm:

    sudo service php5-fpm restart

Everything should be good now :)

%AUTHOR%

%DISQUS%
