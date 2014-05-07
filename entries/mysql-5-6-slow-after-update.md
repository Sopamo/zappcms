author:Paul Mohr
created:2014-05-07 11:10:00
|||||||||||||||||||||||||||||||
MySQL is suddenly slow after upgrade to 5.6
===========================================

I just upgraded the MySQL Server on one of our servers to 5.6. Everything was normally, only all sites seemed to be running a bit slower than usually.
After some debugging, I found out, that the reason was MySQL not caching any queries anymore, which can have dramatic performance impacts (300ms+ time for a query instead of ~20ms). On database heavy sites this issue can easily double or triple the site load time.
To find out, if the SQL cache is your problem, check the following:
If your query is:
    SELECT * FROM users WHERE email LIKE "%@gmail.com"
Prepend "SQL_NO_CACHE":
    SELECT SQL_NO_CACHE * FROM users WHERE email LIKE "%@gmail.com"

If the response time does not go up, you weren't caching anything in the first place.

To reenable caching, set these values to your my.cnf (located under /etc/mysql/my.cnf):
    query_cache_size  = 64M
	query_cache_limit = 4M
	query_cache_type  = 1

Don't forget to restart mysql
    /etc/init.d/mysql restart

Of course you can tweak the values according to your system specs.

If you have questions, feel free to ask in the comments section :)

%AUTHOR%

%DISQUS%