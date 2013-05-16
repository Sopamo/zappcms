author:Paul Mohr, Stefan Mayer
created:2013-05-16 20:50:00
|||||||||||||||||||||||||||||||
Running a node js site on Plesk with Apache
===========================================

Running a node js site on Plesk which normally uses Apache isn't as easy as it should be.
After some hours of fiddling around we ended up with the following setup:

1. Create the domain in Plesk as usual  
2. Enable the Apache modules proxy, proxy_http and rewrite here:  
        http://your-plesk-domain.com/admin/server/optimization-settings
3. Edit the Apache virtual host. The configuration file is here:  
        /var/www/vhosts/your-domain.com/conf/vhost.conf  
The vhost.conf file might not be there, simply create it then.  
You have to add the following two lines:  
        ProxyPass / http://localhost:8000/  
        ProxyPassReverse / http://localhost:8000/  
If your node.js server doesn't run on port 8000 you have to change that accordingly.  

4. Run:  
        /usr/local/psa/admin/bin/httpdmng --reconfigure-domain your-domain.com  

    This tells plesk to reload the vhost configuration.  
5. Restart apache:  

        /etc/init.d/apache2 restart  
    
Done! Your domain should be routed to node.js now.

%AUTHOR%

%DISQUS%