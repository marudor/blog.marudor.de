---
title: SBB APIs
date: '2020-05-12T10:05:07Z'
published: true
---

Es ist ja bekannt das ich gern neue Datenquellen suche und anbinde. Auch wenn sie keinen direkten praktischen nutzen haben.
Sonst hätte ich nicht 6 verschiedene APIs für Stationssuchen - wobei ich davon ausgehe das die meisten nur den default nutzen. Also 2 verschiedene - je nachdem ob ÖPNV oder SPNV/FV gesucht wird.

#### Begrifflichkeiten

Also für diejenigen die jetzt nicht direkt verstanden haben was ich meine.  
SPNV ist der Schienenpersonennahverkehr.  
ÖPNV der Öffentliche Personennahverkehr.  
FV natürlich der Fernverkehr.  
Aber was verbirgt sich jetzt konkret hinter den drei Kategorien?  
100% Trennung existiert grade bei ÖPNV und SPNV nicht. Denn der ÖPNV beeinhaltet in der Regel S-Bahn, U-bahn, Straßenbahnen, Busse und Fähren. Aber auch Luftseilbahnen je nach Region. Teilweise zählen auch Regionalzüge dazu auch wenn das eig. schon SPNV ist.  
SPNV ist entsprechend Regionalverkehr - aber auch S-Bahnen.  
Wenn ich davon rede meine ich allerdings das der ÖPNV Straßenbahnen und Busse beinhaltet. SPNV hingegen nicht. Also die Trennung von allem was auf DB Trassen fährt (streng genommen gibts hier auch Ausnahmen) und Dingen die eher im Bereich Straße fahren.  
Hauptgrund ist das das Ursprüngliche https://marudor.de - also die Abfahrtstafel - nur Daten für Züge im DB Bereich hat. Entsprechend werden hier andere Schnittstellen benutzt.  
Aber genug davon, zurück zu Datenquellen.

#### Rückblick

Die Tatsache das die SBB eigene Daten hat sollte klar sein. Das erste mal für mich relevant wurden sie schon vor langer Zeit im Kontext Wagenreihungen. Konkret als ich in einem EC der SBB saß (Auch wenn ich von Hamburg nach Düsseldorf gefahren bin, SBB Material war es trotzdem)  
Dabei hab ich festgestellt das ein Panoramawagen dabei ist und ich das bei mir nicht anzeige. Ich fand aber das wäre ja ne super extra Information.  
Damals wusste ich auch noch nicht so viel über die Datenlage wie heute. Also fing ich erst mal an in der DB API zu suchen ob es irgendwie ersichtlich ist.  
Ernüchternd stellte ich fest nein. Absolut nicht. Inzwischen weiß ich auch das es nur Plandaten sind - selbst wenn der Zug in Hamburg startet und die DB damit wissen müsste ob der Zug korrekt gereiht ist.  
Aber gut, Hamburg -> Düsseldorf sind etwa 4 Stunden. Da hab ich also Zeit etwas zu suchen. Also mal die SBB App geladen und geschaut was die so kann.  
Stellt sich raus: Sie kann auch Wagenreihungen. Es wird sogar angezeigt das es einen Panoramawagen gibt. Allerdings falsch.  
Wieder ernüchternd. Da gibts es schon Daten und dann sind sie einfach falsch. Ich hab über ein paar Tage dann öfter mal geschaut ob die Daten eventuell nur genau an dem Zug falsch waren. Nein - sie waren immer falsch.  
Tolle Daten SBB. Toll.

Dann ließ ich das Thema ein bisschen ruhen, hab mir ein Issue gemacht das ich es nicht vergeß und mich nicht mehr drum gekümmert.

Irgendwann wollt ich mir die App dann doch mal genauer anschauen. Also das übliche, den Man in the Middle Proxy auf dem Handy anmachen und mal in die Requests schauen.  
Ich stelle allerdings schnell fest: Geht nicht. Certificate Pinning, so einfach wirds also nicht.  
Ein bisschen recherche und die Hilfe eines Menschen der mir eine decrypted IPA von der App gegeben hat später und ich hab mit objection und frida Certificate Pinning ausgemacht und mal reingeschaut. Allerdings auch hier schnell die Motivation verloren.

#### Fast Forward ins jetzt (Anfang Mai 2020)

Das Thema kam mal wieder auf. Diesmal wollt ich aber zumindest irgendwas anbinden damit ich nicht wieder von vorne anfange muss.  
Also erst mal wieder Certificate Pinning lösen.  
Da ich kein aktuelles decrypted IPA habe und außerdem kein Android device besitze wollte ich es im Android Emulator lösen.  
Hat nicht gut geklappt... Das mag an mir gelegen haben, aber dieser Emulator ist auch einfach nicht so dolle dafür.  
Nach einiger Zeit rumprobieren ist mir allerdings eingefallen das ich ja ein älteres iPad hab das sich jailbreaken lässt. Ich nutz das eh recht wenig, also passt das schon.  
Also jailbreak drauf, IPA decrypten, objection reinpatchen, aufs ipad damit. Tada - certificate pinning abschaltbar und ich kann in requests reinschauen. (Dieser Teil ist absichtlich nicht ausführlich. Wer das spannend findet schreibt mir einfach mal - eventuell finden das genug das ich nen eigenen Eintrag dazu mache)

#### HTTP Details

Schauen wir uns mal einen Request an. Eine der einfachsten ist oft die Stationssuche. Also fangen wir damit an.

```http
GET /unauth/fahrplanservice/v1/standorte/Z?onlyHaltestellen=false HTTP/1.1
Host: active.vnext.app.sbb.ch
Cookie: 5553092829633102002fb75614e4eddb=097f0eb89507e4855d2ed7832c14dc94; a7a0756860293f1dc97495aa1c73d9b5=f2dd847edeeec9739aecd9afd90cdb7a
X-API-DATE: 2020-05-11
X-API-AUTHORIZATION: OuBQb0492/Bcv3miISF6LYu3UsI=
X-APP-TOKEN: B2771DBD-68D7-4D3D-B7C9-6FE43D6CF636
Accept: application/json
Accept-Language: de-de
User-Agent: SBBmobile/10.5.0.build-152 iOS/13.4.1 (apple;iPad7,3)
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

Was könnte hier relevant sein? Vermutlich `X-API-AUTHORIZATION` und `X-APP-TOKEN` `X-API-DATE` eventuell, oft lässt sich sowas aber auch weglassen.  
Ich hoffe der Cookie ist irrelevant. Wenn man sich per Session authorizen muss wäre das doof.  
Aber erst mal checken ob der Request nochmal ausführbar ist. Nicht das irgend einer der Tokens da one time use ist.  
Stellt sich raus klappt.

Was passiert wenn wir bestimmte Dinge nicht mehr mitschicken? Nunja. Nur ein Bruchteil von dem Request ist mandatory. Wenn wir es auf das nötige kürzen haben wir folgendes.

```http
GET /unauth/fahrplanservice/v1/standorte/Z?onlyHaltestellen=false HTTP/1.1
Host: active.vnext.app.sbb.ch
X-API-DATE: 2020-05-11
X-API-AUTHORIZATION: OuBQb0492/Bcv3miISF6LYu3UsI=
```

Damit lässt sich arbeiten. Der `X-APP-TOKEN` ist wohl nur fürs tracking. `X-API-DATE` ist wohl das aktuelle Datum. (Request vom 11.5.2020)  
Bleibt der `X-API-AUTHORIZATION` Token. Finden wir raus was er tut.  
Sieht erst mal nach base64 aus.

```jsx react-live
// atob ist base64 decode
atob('OuBQb0492/Bcv3miISF6LYu3UsI=');
```

&nbsp;  
Hmm. Nicht so hilfreich. Schauen wir uns an was passiert wenn wir den Suchbegriff etwas ändern.

| Suche | Token                        |
| ----- | ---------------------------- |
| Z     | OuBQb0492/Bcv3miISF6LYu3UsI= |
| Zü    | jHEs3cbeXBB7R9wdmOglngZJCOE= |
| Zür   | k0wVgX/IIIhjCooXbktU+a5MOAc= |
| Züri  | TFqdn6FoQ/MU1YKdWT2HedYaU+E= |

Okay. Die länge bleibt gleich. Also muss da gehashed werden vor dem base64.  
Das ist jetzt der Moment an dem Source Code praktisch ist. Das geht zwar schwierig mit iOS. Aber zum Glück gibts Android und apktool.  
Also schauen wir uns mal etwas android an.

#### Android reversing

Kurz apk decompilen und schon haben wir die App und ressources. Das was bei DB (Beziehungsweise HAFAS) Apps schon sehr aufschlussreich ist - nämlich `res/raw` und config files gibts hier leider nicht. Also suchen wir mal nach `X-API-AUTHORIZATION`. Einen Treffer. Das ist also die Stelle die wir suchen.  
Leider ist es nicht ganz so einfach.

```smali
invoke-static {v1, v3}, Lch/sbb/mobile/android/repository/common/k/a;->a(Ljava/lang/String;Ljavax/crypto/spec/SecretKeySpec;)Ljava/lang/String;
move-result-object v1
const-string v3, "X-API-AUTHORIZATION"
invoke-virtual {v0, v3, v1}, Lcom/squareup/okhttp/Request$Builder;->addHeader(Ljava/lang/String;Ljava/lang/String;)Lcom/squareup/okhttp/Request$Builder;
```

Was passiert hier? Nun. Zeile 4 fügt was auch immer in `v1` steht in den Header `v3`. `v3` ist `X-API-AUTHORIZATION`. Wir müssen also nur rausfinden was in `v1` steht.  
Zeile 2 zeigt uns das es das Resultat des vorherigen calls ist. Also die static Function `Lch/sbb/mobile/android/repository/common/k/a;->a` welche mit einem `String` und einem `SecretKeySpec` aufgerufen wird. Wobei der `String` `v1` ist und `SecretKeySpec` `v3`.
Schauen wir uns diese Funktion also mal an.

```smali
invoke-virtual {p1}, Ljavax/crypto/spec/SecretKeySpec;->getAlgorithm()Ljava/lang/String;
move-result-object v0
invoke-static {v0}, Ljavax/crypto/Mac;->getInstance(Ljava/lang/String;)Ljavax/crypto/Mac;
move-result-object v0

invoke-virtual {v0, p1}, Ljavax/crypto/Mac;->init(Ljava/security/Key;)V
const-string p1, "UTF-8"

invoke-virtual {p0, p1}, Ljava/lang/String;->getBytes(Ljava/lang/String;)[B
move-result-object p0
invoke-virtual {v0, p0}, Ljavax/crypto/Mac;->doFinal([B)[B
move-result-object p0
const/4 p1, 0x2

invoke-static {p0, p1}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;
```

Eigentlich recht simpel. Wir holen uns eine `javax/crypto/Mac` Instanz mit dem Algorithmus aus unserem `SecretKeySpec` hashen damit den übergebenen String und encoden das ganze Base64.  
Also gilt es rauszufinden welcher String übergeben wird. Und wo der `SecretKeySpec` initialisiert wird.  
Fangen wir mit dem String an. Zurück zum Aufruf von eben. Dort wurde `v1` übergeben als String.

```smali
invoke-virtual {v0}, Lcom/squareup/okhttp/Request;->httpUrl()Lcom/squareup/okhttp/HttpUrl;
move-result-object v1
invoke-virtual {v1}, Lcom/squareup/okhttp/HttpUrl;->uri()Ljava/net/URI;
move-result-object v1
invoke-virtual {v1}, Ljava/net/URI;->getPath()Ljava/lang/String;
move-result-object v1

sget-object v2, Lorg/threeten/bp/format/c;->h:Lorg/threeten/bp/format/c;
invoke-static {}, Lorg/threeten/bp/s;->j()Lorg/threeten/bp/s;
move-result-object v3
invoke-virtual {v2, v3}, Lorg/threeten/bp/format/c;->a(Lorg/threeten/bp/temporal/e;)Ljava/lang/String;
move-result-object v2

invoke-virtual {v0}, Lcom/squareup/okhttp/Request;->newBuilder()Lcom/squareup/okhttp/Request$Builder;
move-result-object v0
new-instance v3, Ljava/lang/StringBuilder;
invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V
invoke-virtual {v3, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
invoke-virtual {v3, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
move-result-object v1
iget-object v3, p0, Lch/sbb/mobile/android/repository/common/h/d;->a:Ljavax/crypto/spec/SecretKeySpec;
```

Das ist ne Menge Code. Aber eigentlich recht simpel. `v3` wird aus `v1` und `v2` gebildet mit nem einfachen `StringBuilder`. Also suchen wir `v1` und `v2`

`v1` ist anfangs die URL aus `v0` und wir dann zum Ergebnis des `getPath` Aufruf auf einem `java/net/URI` Objekt.
Ich spoiler hier mal das `v0` anfangs einfach die URL ist die aufgerufen wird. In unserem Beispiel also `https://active.vnext.app.sbb.ch/unauth/fahrplanservice/v1/standorte/Z?onlyHaltestellen=false` woraus dann `/unauth/fahrplanservice/v1/standorte/Z` wird.

`v2` hingegen ist irgend ein Format aus der `org/threeten/bp` library. Ich könnte jetzt nachschauen welches genau. Oder aber wir schauen etwas weiter hinten im Code. Dort wird `v2` in `X-API-DATE` geschrieben. Damit wissen wir also das es einfach das aktuelle Datum im `yyyy-MM-dd` format ist.  
Fassen wir zusammen.  
Wir müssen einen noch unbekanntes hashverfahren auf einen String der aus der URL und dem Datum besteht anwenden. Also fehlt uns noch das hashverfahren. Der String ist ja jetzt klar.  
Dank einem hilfreichen Menschen auf Twitter ist klar das es 20 Bytes vor dem base64 sein müssen. Und SHA1 produziert genau das.

https://twitter.com/penma_/status/1259874400595255297

Versuchen wir das doch einfach mal. Unser path ist `/unauth/fahrplanservice/v1/standorte/Z`. Das passende Datum `2020-05-11`.

import './helper';

```js react-live code
SHA1.b64('/unauth/fahrplanservice/v1/standorte/Z2020-05-11');
```

`OuBQb0492/Bcv3miISF6LYu3UsI=` - Passt nicht. Schade.

Dem geneigten Leser ist es vielleicht schon aufgefallen. Ich habe was übersehen.

```smali
invoke-virtual {v0, p1}, Ljavax/crypto/Mac;->init(Ljava/security/Key;)V
```

Diese schöne Zeile. Das ganze wird mit einem Key initialized. Es ist also nicht SHA1 sondern HMAC-SHA1. Doof. Wo bekommen wir den Key her?  
Zurück in "unsere App" irgendwo muss der ja stehen.

#### Die Suche nach dem Key

Wie kommen wir jetzt an den Key? Ein bisschen weiter in der Funktion stöbern und es fällt auf das der `SecretKeySpec` reingegeben wird. Der wird also woanders initialisiert. Suchen wir doch mal nach `javax/crypto/spec/SecretKeySpec` wie oft taucht das auf?  
Leider 84 mal. Das hilft noch nicht. Wenn wir aber nach initialisierungen suchen. Also `javax/crypto/spec/SecretKeySpec;-><init>` nur noch 17 mal. Dazu die hälfte in google Libraries und genau ein mal in einer Datei die als `common` sortiert wurde.

Schauen wir uns den relevanten Teil an.

```smali
invoke-direct {p0}, Lch/sbb/mobile/android/repository/common/h/g;->h()Ljava/lang/String;
move-result-object v0
const-string v1, "c3eAd3eC3a7845dE98f73942b3d5f9c0"

invoke-static {v0, v1}, Lch/sbb/mobile/android/repository/common/k/a;->a(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
move-result-object v0

new-instance v1, Ljavax/crypto/spec/SecretKeySpec;
const-string v2, "UTF-8"
invoke-virtual {v0, v2}, Ljava/lang/String;->getBytes(Ljava/lang/String;)[B
move-result-object v0
const-string v2, "HmacSHA1"
invoke-direct {v1, v0, v2}, Ljavax/crypto/spec/SecretKeySpec;-><init>([BLjava/lang/String;)V
```

Erster Gedanke: Hey, da steht was das aussieht wie nen Key. Bevor ich weiter suche probier ich das doch mal!

```js react-live code
SHA1.b64_hmac(
  'c3eAd3eC3a7845dE98f73942b3d5f9c0',
  '/unauth/fahrplanservice/v1/standorte/Z2020-05-11'
);
```

`OuBQb0492/Bcv3miISF6LYu3UsI=` - Passt trotzdem nicht. Wäre wohl auch zu einfach. Also genauer schauen was passiert. Scheinbar wird der `SecretKeySpec` mit `v0` als Key initialiert. Das war mal ein String (Zeile 6) von dem die Bytes (Zeile 10) genommen wurden.  
Also ist Zeile 5 das relevante. Eine Funktion nimmt 2 Strings und das Ergebnis ist unser gesuchter Key. Schauen wir uns die mal an.

```smali
const-string v0, "SHA-256"

invoke-static {v0}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;
move-result-object v0

new-instance v1, Ljava/lang/StringBuilder;
invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V
invoke-virtual {v1, p0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
invoke-virtual {v1, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
move-result-object p0
const-string p1, "UTF-8"

invoke-virtual {p0, p1}, Ljava/lang/String;->getBytes(Ljava/lang/String;)[B
move-result-object p0
invoke-virtual {v0, p0}, Ljava/security/MessageDigest;->update([B)V

invoke-virtual {v0}, Ljava/security/MessageDigest;->digest()[B
```

Scheinbar werden beide Paramter einfach aneinander gehangen und davon SHA-256 gebildet. Das ist simpel. Fehlen uns also die beiden Paramter. Beziehungsweise einer davon. Eventuell wurde es schon entdeckt. Der String `c3eAd3eC3a7845dE98f73942b3d5f9c0` ist der 2. Also fehlt uns nur noch ein String.

```smali
invoke-direct {p0}, Lch/sbb/mobile/android/repository/common/h/g;->h()Ljava/lang/String;
move-result-object v0
const-string v1, "c3eAd3eC3a7845dE98f73942b3d5f9c0"

invoke-static {v0, v1}, Lch/sbb/mobile/android/repository/common/k/a;->a(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
```

Direkt die erste Zeile zeigt unsere gesuchte Funktion. Hoffentlich ist sie einfach.

```smali
iget-object v0, p0, Lch/sbb/mobile/android/repository/common/h/g;->s:Landroid/content/res/Resources;
sget v1, Li/a/a/a/b/f/j;->ca_cert:I
invoke-virtual {v0, v1}, Landroid/content/res/Resources;->openRawResource(I)Ljava/io/InputStream;
move-result-object v0
:try_start_0
const-string v1, "X509"

invoke-static {v1}, Ljava/security/cert/CertificateFactory;->getInstance(Ljava/lang/String;)Ljava/security/cert/CertificateFactory;
move-result-object v1

invoke-virtual {v1, v0}, Ljava/security/cert/CertificateFactory;->generateCertificate(Ljava/io/InputStream;)Ljava/security/cert/Certificate;
move-result-object v0
check-cast v0, Ljava/security/cert/X509Certificate;
const-string v1, "SHA1"

invoke-static {v1}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;
move-result-object v1

invoke-virtual {v0}, Ljava/security/cert/X509Certificate;->getEncoded()[B
move-result-object v0
invoke-virtual {v1, v0}, Ljava/security/MessageDigest;->digest([B)[B
move-result-object v0

const/4 v2, 0x2
invoke-static {v0, v2}, Landroid/util/Base64;->encode([BI)[B
```

Hui, scheinbar viel. Irgendwas mit Certificates, SHA und natürlich Base64.  
Schritt für Schritt passiert folgendes:

1. Hole die Ressource `ca_cert`
2. Erstelle eine CertificateFactory für X509
3. generiere ein Zertifikat basierend auf der Ressource `ca_cert`
4. erzeuge die encoded Form vom Certificate
5. erzeuge SHA1 davon
6. encode das als Base64

Schauen wir mal ob wir damit weiterkommen.  
Allerdings lassen sich diese Steps schwer im Browser zeigen. Deswegen hier der node code den ich dafür nutze.

```ts
const certificateBuffer = fs.readFileSync(
  path.resolve(__dirname, 'certificate.crt')
);
const certificateBasedKey = crypto
  .createHash('sha1')
  .update(certificateBuffer)
  .digest('base64');
```

Ja - das wars schon. Certificate einlesen, hash von bilden. Base64 version nehmen. Fertig.  
`WdfnzdQugRFUF5b812hZl3lAahM=`  
Super. Wir haben beide unsere Strings. Wir können jetzt den Key erzeugen.

```jsx react-live code
() => {
  const key1 = 'WdfnzdQugRFUF5b812hZl3lAahM=';
  const key2 = 'c3eAd3eC3a7845dE98f73942b3d5f9c0';
  return SHA256.hex(key1 + key2);
};
```

Mit diesem Key können wir jetzt hoffentlich den passenden Hash bilden!

```jsx react-live code
SHA1.b64_hmac(
  'b31915ace892f5a826fafe260c6547a4deda9597dd49595149014e973556145f',
  '/unauth/fahrplanservice/v1/standorte/Z2020-05-11'
);
```

`OuBQb0492/Bcv3miISF6LYu3UsI=` Moment... Immer noch nicht?! Aber wir haben doch jetzt alles richtig gemacht? Oder doch nicht?

Wer es ausprobieren möchte: (insecure weil self-signed certificate)

```
curl "https://active.vnext.app.sbb.ch/unauth/fahrplanservice/v1/standorte/Z?onlyHaltestellen=false" \
     --insecure \
     -H 'X-API-DATE: 2020-05-11' \
     -H 'X-API-AUTHORIZATION: TlORvYApPQ1Wj1T4NAU0Bz6wC5Y=' \
     -H 'User-Agent: SBBmobile/10.5.0.build-152 iOS/13.4.1 (apple;iPad7,3)'
```

Error `FIS-1015` doof.  
Und das ist der Stand den ich dann gestern Abend hatte. Etwas frustiert warum es nicht klappt. Ich bin noch mal den smali Code durchgegangen. Aber alles sollte genau so funktionieren.

Jetzt dürft ihr ein mal überlegen woran es liegen könnte.

#### Die Lösung

Wir erinnern uns mal das ich einen iOS Request habe weil es für mich einfacher war Certificate Pinning auszumachen. Und das der User-Agent scheinbar relevant ist.  
Vielleicht liegt es daran? Versuchen wir doch einfach mal da Android rein zu schreiben?

```
curl "https://active.vnext.app.sbb.ch/unauth/fahrplanservice/v1/standorte/Z?onlyHaltestellen=false" \
     --insecure \
     -H 'X-API-DATE: 2020-05-11' \
     -H 'X-API-AUTHORIZATION: TlORvYApPQ1Wj1T4NAU0Bz6wC5Y=' \
     -H 'User-Agent: SBBmobile/10.5.0.build-152 Android'
```

Siehe da. Es funktioniert! Also war die Überlegung und implementierung richtig. Nur das iOS wohl einen anderen static Key hat.  
Für meine Konkrete Implementation hab ich noch einen echten User-Agent gesniffed, soll ja echt aussehen.

#### Fazit

Die SBB scheint weitaus interessierter daran zu sein das leute nicht ihre API nutzen. Die DB hat zwar auch Tokens aber da war es weitaus einfacher alles zu finden. Desweiteren wird sich das ganze wohl ändern wenn das Certificate getauscht wird. Das ist aber erst mal bis `Not After : Oct 1 07:50:01 2035 GMT` gültig. Vielleicht wirds ja auch erst dann geändert.

Details zu meiner implementierung gibts hier: https://github.com/marudor/BahnhofsAbfahrten/pull/334
