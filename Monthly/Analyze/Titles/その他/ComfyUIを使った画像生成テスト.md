# ComfyUIを使った画像生成テスト

## 2026/06/24 (ComfyUIを使った画像生成テスト)

前回Geminiにプロンプトを出してもらってそれなりのクオリティの画像が生成できるところまではお話しましたが、Gemma4も生成AIのポテンシャルとしてはGeminiには及ばないものの準ずるくらいあるわけで、指示を改良してみました。

具体的には画像生成をするためのプロンプトを出す前提条件をGeminiに出してもらい、それを食わせたあとで指示をするって方式ですね。  
これで出来上がったのがこちら

> Geminiに依存しないでOllama＋ComfyUIの完全ローカルで画像生成が出来ないか試してる  
> Gemma4:latestの性能が良くなってるので起動したてで一発目で生成した最初期に比べてかなりいいものが出来てるような・・・気がする [pic.twitter.com/oKghsNZ1m6](https://t.co/oKghsNZ1m6)
> 
> — ひらりん (@hirarira617) [June 22, 2026](https://x.com/hirarira617/status/2069128003486093705?ref_src=twsrc%5Etfw)

続いては参考となるキャラクターを与えて、指示したポーズの通りに構図を変えてもらうのを試してみました。  
ちなみに入力として与えたのはオリキャラの「エリダヌス・ラーン」ちゃんです。

[![画像](https://assets.st-note.com/img/1782319458-F824cvpIlYyHViDg5PGj3uXB.png?width=1200)](https://assets.st-note.com/img/1782319458-F824cvpIlYyHViDg5PGj3uXB.png?width=2000&height=2000&fit=bounds&quality=85)

入力として与えたラーンちゃん

[![画像](https://assets.st-note.com/img/1782319424-lMQrcAins2tT4emd60RYyFaJ.png?width=1200)](https://assets.st-note.com/img/1782319424-lMQrcAins2tT4emd60RYyFaJ.png?width=2000&height=2000&fit=bounds&quality=85)

出来上がったのはこちらでして、ラーンちゃんの服や髪型、ジト目なんかは再現してくれましたね。  
まあ、トレードマークのリボンはどっか行っちゃいましたが・・・

あとやりたいことは色々あるので、引き続き研究していこうかなと思います。

---

