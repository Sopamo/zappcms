author:Paul Mohr
created:2014-05-21 13:10:00
|||||||||||||||||||||||||||||||
Getting JustBoil / jbimages to work with nginx
==============================================

JustBoil is a wonderful plugin for tinymce to upload images. But it doesn't work with you standard nginx configuration out of the box.

The solution is rather simple. As nginx doesn't recognize the upload url 

    http://yoursite.com/js/tinymce/plugins/jbimages/ci/index.php/upload/english

as a correct file, we need to change this. Just go into your jbimages plugins folder and change the upload urls in dialog.htm and dialog-v4.htm to 

    ci/index.php?/upload/english

You also have to change the upload_target iframe src to:

    ci/index.php?/blank

By adding the question mark nginx now correctly executes the php file and you are good to go.

If you have questions, feel free to ask in the comments section :)

%AUTHOR%

%DISQUS%