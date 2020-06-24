---
title: IRIS-TTS Stationen
date: '2020-06-24T17:00:07Z'
published: true
---

Ich hatte vor längerem einen Hint auf Twitter gegeben das ich ein Thema für einen Blogpost hätte.

https://twitter.com/marudor/status/1267927700309712896?s=21

Das ist jetzt auch schon drei Wochen her und so langsam könnte ich den ja wirklich mal schreiben.
Ausgelöst hatte es dieses issue.  
https://github.com/marudor/BahnhofsAbfahrten/issues/352  
Es ging drum das Züge am Halt „Norddeich Mole“ doppelt angezeigt werden. Als ich das issue gesehen habe war für mich auch schon klar woran es liegt. Um das zu verstehen erkläre ich mal die Struktur von Stationen im IRIS-TTS.

## Einschub - IRIS-TTS

Was ist eigentlich das IRIS-TTS?  
Kurz gesagt die Hauptdatenquelle von https://marudor.de. Es ist auch die erste Datenquellen gewesen und für die Abfahrten zuständig. Das ganze bietet verschiedene Schnittstellen. Relevant dafür sind 3 verschiedene Endpunkte.

- `/station`
- `/plan`
- `/fchg`

`/plan` gibt uns alle Planabfahrten an einem Bahnhof zu einer Stunde.
`/fchg` hat Echtzeitinformationen zu einem Bahnhof.  
Und `/station` entsprechend eine art Stationssuche. Allerdings gibt es immer noch ein result zurück statt mehreren.

## Was ist ein Bahnhof?

Knackpunkt des issues und der API ist die Frage was überhaupt ein Bahnhof ist. Für den Kunden ist das leicht. Frankfurt Hbf z.B.  
Frankfurt Hbf meint für Kunden sowohl den Kopfbahnhof als auch die S-Bahn. Im Sprachgebrauch macht keiner die Unterscheidung.  
Oder Berlin Hbf - auch hier meinen Menschen normalerweise den kompletten Bahnhof. Also sowohl hoch als auch tief.
Aber betrieblich gibt es eben eine Trennung. Es gibt hoch und tief separat. Sowohl für Berlin als auch Frankfurt.  
Die API sieht es betrieblich. Für sie ist Berlin Hbf (tief) ein anderer Bahnhof als Berlin Hbf. Als Nutzer einer Bahninformation möchte man diese Trennung aber nicht haben. Dafür hat die API auch eine Lösung. `meta`

## meta?

Genau, es gibt ein `meta` Feld im response. Das beschreibt Stationen die zur abgefragten dazu gehören.  
Frankfurt zum Beispiel besteht aus 4 Stationen.

```xml
<stations>
    <station p="22|23|24|1a|10|11|12|13|14|15|16|17|18|19|1|2|3|4|5|6|7|8|9|20|21" meta="8089211|8089505|8098105" name="Frankfurt(Main)Hbf" eva="8000105" ds100="FF" db="true" creationts="20-06-23 13:28:46.959"/>
</stations>
```

import frankfurt from './frankfurt.svg';

<img src={frankfurt}/>

Also gibt es für das Problem schon eine Lösung. Wenn ich die Abfahrten für Frankfurt suche schau ich also vorher nach welche Stationen dazu gehören und frage alle ab.

## Probleme

Problematisch wird es erst wenn die Daten nicht ganz Stimmen. Schauen wir uns dafür mal Norddeich Mole an.

```xml
<stations>
    <station p="1" meta="8004449" name="Norddeich Mole" eva="8007768" ds100="HNDM" db="true" creationts="20-06-09 12:32:18.098"/>
</stations>
```

Hier sehen wir eine Meta Station. Dazu einmal auch ein Bild von allen Abhängigkeiten basierend auf Norddeich Mole.

import norddeich from './norddeich.svg';

<img src={norddeich}/>

Hier fallen direkt mehrere Probleme auf. Zum einen ist Norddeich nicht gleich Norddeich Mole. Das sind 4 Minuten RE fahrt.  
Zum anderen ist Norddeich Mole zu Norddeich gleich und Norddeich zu Norddeich Flugplatz. Norddeich Flugplatz aber nicht zu Norddeich Mole. Irgendwie passt das nicht ganz.
Da an Norddeich Flugplatz keine Züge fahren ist das für https://marudor.de erst mal egal. Norddeich allerdings sollte nicht gleichgesetzt werden zu Norddeich Mole.  
Für mich ist das tatsächlich durch manuellen Eingriff gelöst. Ich Filter bestimmte `meta` ids bei bestimmten Stationen raus.

## Rekursiv?

Ein weiteres Problem das hier deutlich wird ist wie weit schau ich meta an? Suche ich so lange bis ich keine neuen Stationen finde? Dann würde hier Norddeich Mole auch Norddeich Flugplatz finden.  
Oder schau ich nur direkte meta Stationen an?  
Für https://marudor.de ist entschieden das nur direkte Stationen beachtet werden. Anfangs war das anders, da hab ich rekursiv gesucht. Bis ich mir mal München angeschaut habe.  
Auch dazu mal ein Bild.

import muenchen from './muenchen.svg';

<img src={muenchen}/>

Das ist jetzt schon etwas chaotischer. Das Problem hier ist das der Hauptbahnhof mit dem ZOB (Hackerbrücke) verbunden ist und dieser wiederum mit der Station Hackerbrücke.  
Letzteres ist aber eine S-Bahn Station vor dem Hauptbahnhof. Für meine Zwecke also nicht mit dem Hbf gleich.  
Die einfache Lösung hier ist, wie erwähnt, einfach nicht rekursiv suchen.

## weitere Probleme

Es gibt bei den Assoziationen und dem Ansatz Stationen so zusammen zu fassen aber auch Probleme für die ich noch keine direkte Lösung habe.  
Dafür gibt es Stolberg (Rheinl) als Beispiel.

import stolberg from './stolberg.svg';

<img src={stolberg}/>

Prinzipiell sieht das ja ganz passend aus. Einfach ein Bahnhof der aus 3 betrieblichen Teilen besteht.  
Wer schon mal da war weiß das Gleis 1&2 zu Stolberg Hbf gehören, direkt daneben sind 44 & 43. Und 27 ist dann einmal über die Straße. Also durchaus „Ein Bahnhof“  
Das Problem dabei ist aber das es den RB20 dort gibt. Der hält an allen 3 Bahnhöfen!
Erst Gleis 27, dann Gleis 1, dann Gleis 44.  
Dazu einfach mal https://marudor.de/Stolberg(Rheinl)Hbf anschauen.  
Hier fehlt mir auch noch ein bisschen die Idee das sinnvoll darzustellen. Bis auf Stolberg ist mir aber auch keine andere solch weirde Situation bekannt. Vielleicht belasse ich es also auch wie es ist.
