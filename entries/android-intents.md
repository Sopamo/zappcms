author:Paul Mohr, Stefan Mayer

Fehlende Fehlermeldung bei Intents in Android
====================================
Serializable Objects
----------------------------

Java ist eigentlich eine Programmiersprache, die den Programmierer per Fehlermeldung über Programmierfehler extrem genau informiert. Doch es kann auch passieren, dass es gar keine Fehlermeldung gibt, obwohl sich das gesamte Programm, in unserem Fall eine Android App, aufgehangen hat. Wir haben dabei einer Activity ein IntentObjekt übergeben. Etwa so:

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

Leider hat sich die App immer aufgehangen ohne eine Fehlermeldung zu werfen.
Die Lösung des Problems war beim Item das Interface Serializable zu implementieren. Weil alle Objekte in putExtra Serializable implementieren müssen auch wenn diese nur in einem übergebenen Objekt als Variable vorhanden sind.

<p>Von: %AUTHOR%</p>

%DISQUS%
