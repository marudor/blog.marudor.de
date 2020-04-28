---
title: Zugdetails
date: '2020-04-27T22:12:03.284Z'
published: true
---

Ich hab in meinen Talks schon öfter über die verschiedenen APIs der Bahn berichtet und was da so komisch läuft.‌‌ Aber ich hab glaub ich noch nie wirklich beschrieben was denn überhaupt so nötig ist um die Features von marudor.de zu realisieren. Und wer das nicht weiß versteht auch nicht warum manche Teile von marudor.de leicht andere Informationen haben als andere.

Also fang ich mal an ein feature zu erklären, was kann es, welche APIs brauch ich? Welche Fallstricke gibt es?‌‌ Also hier mal einen Überblick über die Zugdetails. Gemeint ist speziell folgendes:

https://marudor.de/details/ICE%20274

Wer die Seite öfter mal benutzt sieht direkt das dieser Link anders ist als welche die ich in der Seite nutze - das liegt daran das dies der unspezifische Link für "Gib mir Details vom ICE 274" ist - ohne weitere Informationen ist das nicht immer eindeutig. Zum einen nehme ich jetzt an das der heutige Tag gemeint ist. Das ist um den Datumswechsel aber oft nicht korrekt. Darum lässt sich optional noch eine Zeit angeben. Und dann gibt es noch Züge die nicht eindeutig sind.‌‌Nicht eindeutig? Ja. In Deutschland dürfen nicht zwei Züge zur gleichen Zeit die gleiche Nummer haben. Beim Fernverkehr ist das einfach, Die 4 oder weniger stelligen Nummern sind dem Fernverkehr vorbehalten. Die fahren auch lang genug das sich da keine Probleme ergeben. Anders beim Nahverkehr. Denn hier gibt es teils Dopplungen. Und darum geb ich neben einer Uhrzeit auch die Start oder Endstation an. Dann wird es eindeutig.‌‌  
So führt folgender Link zur SBahn Berlin: https://marudor.de/details/S%207104?station=8089021‌‌  
Ohne die Station allerdings zur SBahn Stuttgart. https://marudor.de/details/S%207104

Die selbe Nummer ist also am gleichen Tag mehrfach in verwendung. Die Stuttgarter SBahn fährt allerdings von 05:16-06:38. Die Berliner ab 14:31. Also genug Puffer das auch Verspätung nicht zu Problemen führt. Bevor die SBahn 8 Stunden Verspätung hat fällt sie wohl einfach aus.

Zurück zu APIs. Warum ist das in APIs ein Problem? Nun. Ich habe ja erst mal nur den Typ und die Nummer eines Zuges. Und das fütter ich in die `JourneyMatch` Methode vom HAFAS.‌‌ Als Ergebnis bekomme ich für die `S 7104` 3 Möglichkeiten. Die zwei erwähnten SBahnen und eine nach Bern. (Hier mal gekürzt der response)

```json
[
  {
    "train": {
      "name": "S 1",
      "line": "1",
      "number": "7104",
      "operator": {
        "name": "DB Regio AG S-Bahn Stuttgart",
        "icoX": 0
      }
    },
    "jid": "1|336443|0|80|27042020"
  },
  {
    "train": {
      "name": "S 7",
      "line": "7",
      "number": "7104",
      "operator": {
        "name": "S-Bahn Berlin",
        "icoX": 4
      }
    },
    "jid": "1|366378|0|80|27042020"
  },
  {
    "train": {
      "name": "S 7",
      "line": "7",
      "number": "7104",
      "operator": {
        "name": "Regionalverkehr Bern-Solothurn",
        "icoX": 7
      }
    },
    "jid": "1|931006|10|80|27042020"
  }
]
```

Neben dem was hier steht gibt es noch den ersten und den letzten Stop. Anfangs hab ich das genutzt um zu filtern. Inzwischen versteh ich genug vom HAFAS um zu wissen wie man eine Station als Filter mitgibt. Ich kann also auch direkt das HAFAS filtern lassen das eine bestimmte Station im verlauf des Zuges vorhanden sein muss.‌‌Damit haben wir also für die Zugdetails den Zug, ersten/letzten Stops und die `jid`. Noch nicht genug für die Detail page. Aber wir haben bisher auch nur ne Suche gemacht um einen bestimmten Zug zu finden - jetzt brauchen wir von dem Details.  
Praktischer Weise gibt es dafür `JourneyDetails`. Das ganze nimmt eine `jid` (JourneyID) und gibt uns start/stop/verspätungen/Messages also alles was wir brauchen. Also theoretisch... denn obwohl da eigentlich alles drin steht was wir brauchen wäre es ja schade wenn es auch immer so funktionieren würde...

Das DB HAFAS ist da nämlich besonders. Es löscht Verspätungen von vergangenen Stops. Andere wie z.B. die OEBB machen das nicht. Wie schaffen wir es jetzt also neben zukünftigen Stops auch die Verspätung der vergangenen Stops zu bekommen?

Glücklicherweise hat HAFAS da etwas. `SearchOnTrip` eigentlich wohl dafür gedacht Anschlüsse basierend auf einem aktuellen Zug zu bekommen lässt sich damit aber auch `JourneyDetails` etwas anreichern. ‌‌Dafür brauchen wir entweder eine `jid` oder einen `ctxRecon` letzteres haben wir nicht, kommt weder bei `JourneyMatch` noch bei `JourneyDetails` mit. Aber die `jid` haben wir ja noch. Also fragen wir damit mal.

```json
{
  "ver": "1.18",
  "ext": "DB.R19.04.a",
  "lang": "deu",
  "id": "6v263rtiwq83w44c",
  "err": "OK",
  "cInfo": { "code": "OK", "url": "", "msg": "" },
  "svcResL": [
    {
      "meth": "SearchOnTrip",
      "err": "DATE_TIME",
      "errTxt": "HCI Service: date or time missing or invalid"
    }
  ]
}
```

Hmm scheinbar möchte HAFAS noch ein date oder time. Unpraktisch. Also entweder rausfinden was sie da an Zeit möchten - oder den `ctxRecon` nutzen. Den haben wir aber ja nicht.  
Aber wir können ihn uns bauen. Für die S7104 in Stuttgart wäre es folgender:

`¶HKI¶T$A=1@L=8002785@a=128@$A=1@L=8003280@a=128@$202004270516$202004270638$S 1$$1$`
Scheinbar etwas mit `$` getrennt. Schauen wir uns die Variablen Anteile mal an.

`¶HKI¶T$A=1@L=` - Das ist statisch.
`8002785` - Dann kommt die evaID des ersten stops.
`@a=128@$A=1@L=` - auch wieder statisch, `A=1@L=<evaID>@a=128@` beschreibt eine Station.
`8003280` - evaID des letzten Stops
`@a=128@$` - rest vom Station identifier
`202004270516` - Geplante Abfahrt am ersten Bahnhof
`$202004270638` - Geplante Abfahrt am letzten Bahnhof
`$S 1$$` - Name des Zuges
`$S 1$$` - Ich hab sie "replacement Number" getauft. Ist immer eins. Außer bei Ersatzfahren. Dort ist es 2. Genauer weiß ich es auch nicht.

Mit dem `ctxRecon` können wir also wieder `SearchOnTrip` fragen. Jetzt bekommen wir auch eine Antwort. Hier gibt es jetzt zwei Möglichkeiten. Entweder der Responses hat alle Verspätungen - oder keine. Also müssen wir diesen Response mit dem ursprünglichen `JourneyDetails` mergen. Damit haben wir für diesen Zug oft alle Verspätungen, mindestens aber die für die Zukunft.

Das wäre damit auch alles für die Details Page. An sich gibt es noch 2 Zusatz Infos auf dieser Page - die geplante ICE Baureihe und die Wagenreihung. Aber das kommt dann wohl ein anderes mal.
