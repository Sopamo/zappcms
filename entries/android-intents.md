author:Paul Mohr, Stefan Mayer
created:2013-05-15 23:00
||||||||||||||||||||||||||||||

Missing Error Message using Intents in Android
====================================
Serializable Objects
----------------------------

Actually Java is a programming language which informs the programmer extremely verbose about programming mistakes.
But sometimes it occurs that there is no error message being displayed, although the whole program, which in 
our case was a android app, starts freezing. We passed an IntenObject to an activity like so:

    class Test implements Serializable {
        public Item[] items = { new Item() };
    }

    class Item {}
    
    class startActivity extends Activity {
        public void onCreate(Bundle s) {
            super.onCreate(s);
            Intent intent = new Intent(Bla.class,this);
            intent.putExtra("Bla",new Test());
            startActivity(intent);
        }
    }

Sadly the app started freezing without notifying us :O The solution of the problem was to implement the Interface
Serializable on all Objects being passed within the putExtra function of Intent. Even if the Object is only saved within
an attribute of the Object being passe. 


<p>Written by: %AUTHOR%</p>

%DISQUS%
