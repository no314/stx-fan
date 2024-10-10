const poems = [
  {
    lines: [
      "Stackers and artists,",
      "bla, bla, bla, bla, bla, bla, bla,",
      "Thank you for your time."
    ],
    shortID: "75551975",
    longID: "22336a6279730b4312afa3607bebd054232454c9e227cdc20c47c6ca0e69ddfdi0"
  },
  {
    lines: [
      "Waste not one bitcoin,",
      "On a second hand shitcoin,",
      "Work solely for Stacks."
    ],
    shortID: "75551970",
    longID: "4fe3034ab211b38191a022aef411729f61d456141a1e14b267db7fe14ca72164i0"
  },
  {
    lines: [
      "Parents lost their way,",
      "Greed led them astray each day,",
      "Kids in disarray."
    ],
    shortID: "75551972",
    longID: "db845bd2cfe93dd824d04246805e215fb4d1960f5f857baca3407670940b7984i0"
  },
  {
    lines: [
      "Banks took homes and dreams,",
      "Silent cries, broken schemes,",
      "Kids built hopeful themes."
    ],
    shortID: "75551968",
    longID: "186727bcdee09b6bf1c1f06ed111c34eeb081d41ac31c6f009cbe1890a380b5di0"
  },
  {
    lines: [
      "Why buy EN EF TEE?",
      "Baked air or value unseen,",
      "Mere illusions gleam."
    ],
    shortID: "75551967",
    longID: "9d46592912a6c32539b7fbe01d9d2551085affa6c82d22a0e697aa98ff700a5ai0"
  },
  {
    lines: [
      "Mom for sale, I'd say,",
      "Diamond hands I'll never keep,",
      "Wolves thrive while sheep stray."
    ],
    shortID: "75551971",
    longID: "b2684bf4c63f0452caa70adf55ae1ff7c8d212f130a16c92d33638b1e5a15a68i0"
  },
  {
    lines: [
      "Building for decades,",
      "Not just for short term profit,",
      "But for true freedom."
    ],
    shortID: "75552451",
    longID: "104afe8b73e25e2a63294b619886019c02f3b4840d87e1d8ac2a1f6f97cf17dei0"
  },
  {
    lines: [
      "Slow comp's are zen!",
      "We should all be more like them.",
      "At least now and then."
    ],
    shortID: "75552412",
    longID: "5baac3d162a14aecc0f8fbef6316629abc662590f4b0751e8cb6e879b9407213i0"
  },
  {
    lines: [
      "Crypto or Money?",
      "Same shit but different day.",
      "Abolish all debt."
    ],
    shortID: "75551965",
    longID: "3efdaef87b2a9dc3085a53aed441ea6c8a800fc837e8aa637f4c0850475f601bi0"
  },
  {
    lines: [
      "Dearest paper hands,",
      "If your mom was a token,",
      "Would you sell her too?"
    ],
    shortID: "75551974",
    longID: "58ce75b5476904c1a736c4c6cb6b49907144baa86d61e39e755ac3c204a71cefi0"
  },
  {
    lines: [
      "Be like a stoic!",
      "Needing stuff to feel worthy,",
      "And hap is so sick."
    ],
    shortID: "75551969",
    longID: "e6dd7e1f48c6cfaa9cd2c396d7b977b5009895b0a48c93ee34987a486656fe60i0"
  },
  {
    lines: [
      "Love's tender refrain,",
      "Time lost, no chance to regain,",
      "Oops, hearts feel the pain."
    ],
    shortID: "75552429",
    longID: "6bab24fbd1def117c8df2622fd4045209cbf7ca560c300dadfe9945904623585i0"
  },
  {
    lines: [
      "We're All Gon Make It?",
      "If you spend all day trading,",
      "What are you making?"
    ],
    shortID: "75552407",
    longID: "9d2d295452a37c25347a8207169302f5ed756ecc5e269fa5f34a3190f8d74103i0"
  },
  {
    lines: [
      "We're All Gon Make It?",
      "What are you making for Stacks?",
      "...Nothing, I just free ride."
    ],
    shortID: "75552433",
    longID: "03591439a28d3d336c00ebbc83cca1ab999a778a5b8c239e9e9a32f2a96b499ci0"
  },
  {
    lines: [
      "True believer price;",
      "Market down ~eighty percent,",
      "...And you're still buying."
    ],
    shortID: "75552409",
    longID: "10301fb8891b675f80305a863df3f84e66fd7892d17b82cbe9875c0eb0c33807i0"
  },
  {
    lines: [
      "Block by block we grow,",
      "The chain, step by step ...we walk,",
      "The brick by brick road!"
    ],
    shortID: "75552408",
    longID: "1b4df0a7b8c5605b820361e5c583d19cfeb9c1b54a8afc146544344afc6ca604i0"
  },
  {
    lines: [
      "Embrace decentral,",
      "Bitcoin's power to excel,",
      "Problems bid farewell."
    ],
    shortID: "75552423",
    longID: "1850415f293b4cfeb7814849d04c8235b31665e43fa96f4cf8402736b98d9b42i0"
  },
  {
    lines: [
      "Live like a cockroach,",
      "When the markets are bearish,",
      "Just build like Muneeb!"
    ],
    shortID: "75552440",
    longID: "536e4f47ac4842a1b6bf6d0be5e0b0e29acbaa3b023b8acc8b1cafbaf878e2b4i0"
  },
  {
    lines: [
      "Freeze peach for the troll?",
      "But I can't eat frozen peach.",
      "Yea freeze fuckin peach!"
    ],
    shortID: "75552432",
    longID: "e2a415c266ddc34bc5018e7242e4e567e5f760cc5705279934625a223d700298i0"
  },
  {
    lines: [
      "Pardon my bluntness?",
      "In light of diversity,",
      "I won't change a thing."
    ],
    shortID: "75552425",
    longID: "9cc1c8724199666eacbba3c8a360997eda6828f795d0ee6365379cae49d2285di0"
  },
{
    lines: [
      "Angry peeps sell off,",
      "While others build through winters.",
      "...Regrets in summer."
    ],
    shortID: "75552447",
    longID: "bde884feece6302b8bc3f3d0055b60ca3f938875986530f68c06438ad2b553cai0"
  },
  {
    lines: [
      "Swedish FinTech dev?",
      "Your neighbor taking... all credits.",
      "Let's call it SweTech?"
    ],
    shortID: "75551966",
    longID: "e35b9e0a2c1731fe5769a6f234534712c86997be69df96935252144ad9eb1338i0"
  },
  {
    lines: [
      "We're All Gon Make It?",
      "What are you making for Stacks?",
      "...Community, punk!"
    ],
    shortID: "75552442",
    longID: "b8becdac1d0d2dd4b8b4a163f23b4afc61b12741c595f9ad2c36c17562c73bbfi0"
  },
  {
    lines: [
      "We all know it, right?",
      "Holding Bitcoin has its risks.",
      "Holding none... riskier!"
    ],
    shortID: "75552439",
    longID: "70cac82b206b9db40a5bc3df76fbb427e79a4760f40ef158beb959e27f07b3b4i0"
  },
  {
    lines: [
      "Bitcoin is zero?",
      "...Because eventually,",
      "You won't notice it."
    ],
    shortID: "75552418",
    longID: "716affa1ff413ea6109af30ff2e12190508fcc043676dc49e07bbc9f64ee332ai0"
  },
  {
    lines: [
      "From hero to code,",
      "In Leather, secrets bestowed,",
      "Warden's quiet node."
    ],
    shortID: "75552448",
    longID: "2703ff04fc5c1912bfc3caf2c17eb7f8464c0d0001476982821d3333dd1392cbi0"
  },
  {
    lines: [
      "Imitation is:",
      "The sincerest form of... uuh?",
      "Online scammary."
    ],
    shortID: "75552428",
    longID: "fe156383b8b7e220e5f57bb9bc3ab3fc615ce1031a8ee723bf7e4cc293b58566i0"
  },
  {
    lines: [
      "In blockchain's realm,",
      "Time moves much faster than you,",
      "Innovation flows."
    ],
    shortID: "75552438",
    longID: "8b44b76b493e6ac446cc362dea178cf8ed203496758060589c8be3e05dbfbaafi0"
  },
  {
    lines: [
      "In crypto's wild heat,",
      "Stay out of the kitchen's beat,",
      "Else you'll face defeat."
    ],
    shortID: "75552434",
    longID: "9fcaf9d4dd52e888b82b21d47a2fac11b7cfcf25ae4186f37aa4880951f58aa8i0"
  },
  {
    lines: [
      "Amidst war's cruel fight,",
      "My heart aches with helpless fright,",
      "Friends trapped, out of sight."
    ],
    shortID: "75552421",
    longID: "42d0b90167a42d9eace2bdf65042eb178bdf836ffb62dff3e0e8a4ba412ef23bi0"
  },
  {
    lines: [
      "Bad bets lost their cash.",
      "Kids had to endure the crash.",
      "They made their own stash."
    ],
    shortID: "75552452",
    longID: "2e67291dd2206596ee8b50c22557ee9fcf2c294559c3beed2736656f84db90eci0"
  },
  {
    lines: [
      "In crypto's embrace;",
      "Developers set the pace,",
      "Projects rise in grace."
    ],
    shortID: "75552450",
    longID: "a4c75358f4bb8fffbc2998b67dc6ba2dee641196e1d92c7979c3e744a2b8ddcei0"
  },
  {
    lines: [
      "In the crypto cold,",
      "Trust Machines' stories unfold,",
      "Bitcoin tales retold."
    ],
    shortID: "75552422",
    longID: "5302c4a9ba1f9e78877fc66d0bf5dfdbff851485abcbce84853e51242bd92b41i0"
  },
  {
    lines: [
      "Keys held by the hand,",
      "User's fault, security's brand,",
      "Weak link, understand."
    ],
    shortID: "75552456",
    longID: "29d4f128776a30aaf038b279d46c0ef063b9dcc553da2719e7dda5bd3eda00f1i0"
  },
  {
    lines: [
      "From genesis, worth shines,",
      "Nothing to plenty, aligns,",
      "Existence refines."
    ],
    shortID: "75552415",
    longID: "f999c8fe373fdc616a1c152d29d809cb4df397b7dacc8c7cb07ac6e159363924i0"
  },
  {
    lines: [
      "Across miles, we sway,",
      "Messages flood night and day,",
      "Silent retreat, stay."
    ],
    shortID: "75552454",
    longID: "9faed9de6411e5605be24bb360fe49822f03b44757466745b6bd79885b0128eei0"
  },
  {
    lines: [
      "From the ashes, rise,",
      "Young hearts with determined eyes,",
      "New paths, clear blue skies."
    ],
    shortID: "75552427",
    longID: "cf482a1612981122164a294848c33e227ee75928c24e475eef74b0c774f1cc65i0"
  },
  {
    lines: [
      "Bitcoin's layers spread,",
      "Rivals falter, fear ahead,",
      "One eighty-seven's tread."
    ],
    shortID: "75552414",
    longID: "75498cdcedaf158511ec7c438ffc3da98454213d23f8b879845fd0418b5de216i0"
  },
  {
    lines: [
      "Rust's guise deceives sight,",
      "Within, code shines pure and bright,",
      "New paths, safety's light."
    ],
    shortID: "75552424",
    longID: "6a98fa9b137a3dca71ca536dc9611b5849bbbb454ccfb42b87d503967c6e6f5bi0"
  },
  {
    lines: [
      "Runes carved, ancient lore,",
      "Whispers of fate's hidden core,",
      "Ruin waits, forevermore."
    ],
    shortID: "75552435",
    longID: "cc9465d213f3af986c11a70e51c7b009d49d6d72c23c9ba6eb980cfb71ea04abi0"
  },
  {
    lines: [
      "Shilling's silent bane,",
      "Community fuels the gain,",
      "Ethics drowned in rain."
    ],
    shortID: "75552411",
    longID: "f05e761a214b66c3c9475ec5e16dfe033e778781cc9d50ff106dc14bad705713i0"
  },
  {
    lines: [
      "A year's gone, still wait,",
      "Faith in community's fate,",
      "Shit happens, we state."
    ],
    shortID: "75552410",
    longID: "71041c97e60c9597f6ba7deb5973a03cd197b357f819697c1752c0c8b570870bi0"
  },
  {
    lines: [
      "Mojo finds its sway,",
      "In layer two's subtle play,",
      "Whispers of the day."
    ],
    shortID: "75552444",
    longID: "49c6a67740ce6089a2f307dd63245a193dbeab410ffebc6403a22a1653d170c5i0"
  },
  {
    lines: [
      "Silence softly slips,",
      "Still, eyes stay on the block,",
      "Soon, the drop will lock."
    ],
    shortID: "75552453",
    longID: "5414613c777b1d9b947725449286cae8d719428eddd6cf10c3ae3ea023e17dedi0"
  },
  {
    lines: [
      "Runes etched in old walls,",
      "Ruins stand as time recalls,",
      "Burning air enthralls."
    ],
    shortID: "75552413",
    longID: "3cd153fb329a0e3cc114eb150a5da23368a7b0ce2c29c51cb6d4b15c39bb4015i0"
  },
  {
    lines: [
      "In stardust's whisper,",
      "Dreams emerge, glow and glister,",
      "Hopes burn, never blister."
    ],
    shortID: "75552416",
    longID: "4165080e9a5193d6dce375a3ad1d61ef2704aabb92618b854193f8c61ec72328i0"
  },
  {
    lines: [
      "Through time's flowing stream,",
      "Moments merge, form life's grand scheme,",
      "In light's gentle gleam."
    ],
    shortID: "75552443",
    longID: "d766a2abf11ae0f17215b71c5551f4224ad0e0c418ef7a1319540d7431994cc2i0"
  },
  {
    lines: [
      "From shadows to day,",
      "Resilience paves the way,",
      "Love's light will not sway."
    ],
    shortID: "75552458",
    longID: "c62e98c4a10f77914ddf76b02d58fcd20938ef4d68ea01ebdf757723f94ad7fbi0"
  },
  {
    lines: [
      "In dusk's amber hue,",
      "Fantasies we misconstrue,",
      "Glimmers that subdue."
    ],
    shortID: "75552437",
    longID: "2d3a29fc2f07aabce08d4b21c1d915c16c6fecbc8d0fde719df3de84cf2c4dafi0"
  },
  {
    lines: [
      "Hopes waver and bend,",
      "Illusions we can't defend,",
      "Phantoms that transcend."
    ],
    shortID: "75552455",
    longID: "3669935f8ceca1497a949ef30d76be329c81b5a588d5c1ec49592bf4be8e38eei0"
  },
  {
    lines: [
      "Stars' luster abates,",
      "Radiance that dissipates,",
      "Yearning conjugates."
    ],
    shortID: "75552426",
    longID: "165b5229c3ce3df9ebfadcb8ba34362bb7d8c26ea977f3a83b4b475c416c8f64i0"
  },
  {
    lines: [
      "With Stacks, heights we scale,",
      "Clarity's language prevails,",
      "Safety in detail."
    ],
    shortID: "75552457",
    longID: "b0b82f1c3488473b0e5fc2c2da08a44dd67ef6f4d6802e1fc5d44d8a064e14f7i0"
  },
  {
    lines: [
      "In code, futures blend,",
      "Smart contracts that never bend,",
      "Trust in every send."
    ],
    shortID: "75552419",
    longID: "3a8f05da3ac3ae866c63b88ea137ca9eaa7a34f56c4fed56b6305bfb0ff6c530i0"
  },
  {
    lines: [
      "Clarity's pure code,",
      "Guides us on a safer road,",
      "Trust, the true payload."
    ],
    shortID: "75552459",
    longID: "5f619ccb8c2cbad2bed3730d20ffbc68588a81f085e8b10af76fd110e1d246fei0"
  },
  {
    lines: [
      "Guard your private key,",
      "Multisig adds layers deep,",
      "Peace of mind to keep."
    ],
    shortID: "75552445",
    longID: "9face8e5a42df1541c1c67023d6cbdec2f1c1b501b49fa7e36cc7f28247776c7i0"
  },
  {
    lines: [
      "Hardware wallets stand,",
      "Fortress in your steady hand,",
      "Strong as shifting sand."
    ],
    shortID: "75552446",
    longID: "34f2b9893d81fa609e7001e883f50d39c7fe9fce9a3ffdb72c31fcd0f17d9bc9i0"
  },
  {
    lines: [
      "Lessons learned through loss,",
      "Experience pays the cost,",
      "Caution's line is crossed."
    ],
    shortID: "75552460",
    longID: "2baa2302efc888b826bc0262be9846566c5f5637beca9fbec52b5ecf4638a3ffi0"
  },
  {
    lines: [
      "Prevention's the aim,",
      "Multisig and hardware frame,",
      "Users take the blame."
    ],
    shortID: "75552441",
    longID: "1ce98235e562d8bd74a409365ebadf70cf9ebb201e59c05363352a83f41fa9bdi0"
  },
  {
    lines: [
      "Knowledge is the shield,",
      "Informed minds won't easily yield,",
      "To the risks revealed."
    ],
    shortID: "75552417",
    longID: "704edc8f9028ef62b68c00ebe0a7b04b11aa495b515388581c86084c161e4728i0"
  },
  {
    lines: [
      "Teach, and they'll secure,",
      "Awareness makes safety sure,",
      "Future's path is pure."
    ],
    shortID: "75552431",
    longID: "cdad1861c3506018295df6b9736c8138de0a396b458c5c7d214d5f7040700995i0"
  },
  {
    lines: [
      "Code weaves through the net,",
      "Silent threads that intersect,",
      "New dawns quietly set."
    ],
    shortID: "75552571",
    longID: "565e32365238843fa1ff4f434d1534301dc66ad83ac976492ca2fc5817594efei0"
  },
  {
    lines: [
      "Signals soft and clear,",
      "Through the digital frontier,",
      "Change is drawing near."
    ],
    shortID: "75552449",
    longID: "be8cf8ca471987af5ff8bb5c4fcdc8738c9d3cacc47897c52e1c59d1717cb9cdi0"
  },
  {
    lines: [
      "Voices join as one,",
      "Echoing what must be done,",
      "Solid as the sun."
    ],
    shortID: "75552420",
    longID: "eedd9c58c97c652dd5b5d310181ec416d2aaa05c94ed95af5311be1c8dc41339i0"
  },
  {
    lines: [
      "Open minds, wide flow,",
      "Together they build and grow,",
      "Decades, not just show."
    ],
    shortID: "75552543",
    longID: "fe5cba222bcc1c5f910996c005c850c7c0a2e7c6f57858bd9bb52be2bb2bd69bi0"
  },
  {
    lines: [
      "Threads merge, unseen hand,",
      "Crafting patterns, strands expand,",
      "Woven by command."
    ],
    shortID: "75552528",
    longID: "16fe49379190063ff9242ffb6f35149d3e8565605f0adc7803e646e43be7ae46i0"
  },
  {
    lines: [
      "Underneath it all,",
      "Complex layers rise and fall,",
      "Standing silent, tall."
    ],
    shortID: "75552556",
    longID: "39145c19e452a167b3f32d253748ae67bad68e22efd6f538c333675408f830c3i0"
  },
  {
    lines: [
      "Handen die vormen,",
      "Klei wordt leven in zijn grip,",
      "Beelden vol verhaal."
    ],
    shortID: "75552430",
    longID: "8d8891a635cc949baa7ba4f68ff6ec941974eefceeba47d5990d828c4098fb87i0"
  },
  {
    lines: [
      "Elke penseelstreek,",
      "Een geheim in stilte diep,",
      "Kleuren dansen daar."
    ],
    shortID: "75552565",
    longID: "4a67a441fafcb42e387f55f175e64c184b03207b2aa242aca51845342ff609e7i0"
  },
  {
    lines: [
      "Woorden als sculptuur,",
      "Gedachten die verbeelden,",
      "Verzen als natuur."
    ],
    shortID: "75552539",
    longID: "0010385110a495550680458b9adecdf0a6c1ec4d2e8a3f67a87be94a97952292i0"
  },
  {
    lines: [
      "In steen en op doek,",
      "Ligt het hart van de maker,",
      "Dromen openbaar."
    ],
    shortID: "75552545",
    longID: "fd7080e06b3869b72ae92db7b872f4eb54749d480af8a6110ce27fa2ea6814a3i0"
  },
  {
    lines: [
      "Met muziek zo puur,",
      "Raakt hij snaren diep vanbin',",
      "Klanken die blaken."
    ],
    shortID: "75552561",
    longID: "1e7232808c73124254fd46d76632693c3658fbdd4d8a262a8f32dc90ca4c36d3i0"
  },
  {
    lines: [
      "Dans en beweging,",
      "Spreekt een ziel zonder woorden,",
      "Lichaam als gebaar."
    ],
    shortID: "75552524",
    longID: "2676a9f3453b2f94e18b720ee28f57794decf48e464a3b3bb7f571a1813f9d38i0"
  },
  {
    lines: [
      "Is een kunstenaar.",
      "Is een, is een kunstenaar.",
      "Is een kunstenaar."
    ],
    shortID: "75552542",
    longID: "d4142f440179519248d15a49155c247d2a16874af55f9749a716e414e3f43299i0"
  },
  {
    lines: [
      "星光启思维，",
      "创新梦无边界，",
      "爱舞在光中。"
    ],
    shortID: "75552523",
    longID: "eeb4677de09ffbdd6d10276409b2d46388aa3cfee1441e2daff715269c273330i0"
  },
  {
    lines: [
      "梦想如泉涌，",
      "创造画情深，",
      "未来图在展。"
    ],
    shortID: "75552531",
    longID: "78ca6de80565455bcbdea33f49dff93eeec917ce9a78f464ea5ab62eb6044454i0"
  },
  {
    lines: [
      "情热如火燃，",
      "梦爱创光明，",
      "世界无尽展。"
    ],
    shortID: "75552548",
    longID: "8266bfd2c51794fad004f1f3ce404a1f5261fe9e78f4265b9ba9a0a16b85dea5i0"
  },
  {
    lines: [
      "Wie emotie zaait,",
      "In het hart van een ander,",
      "Is een kunstenaar."
    ],
    shortID: "75552557",
    longID: "27489e67af35264030f3555d842f8268ad361a433249a44f303c9525a772acd1i0"
  },
  {
    lines: [
      "创新引领前路，",
      "爱渲染天边际，",
      "光芒新世界。"
    ],
    shortID: "75552526",
    longID: "2ac3b0121f02bdf397b1556fd407cbf39a857915fa186f3be67421b9b1fca93ei0"
  },
  {
    lines: [
      "爱添创意翼扬，",
      "共飞跨时间海，",
      "心醒在深海。"
    ],
    shortID: "75552544",
    longID: "6fd4e2717da59b831b13d9001978514881affb34aa425d2bf894980a52716e9ci0"
  },
  {
    lines: [
      "Far away, safe shores,",
      "Fleeing sounds of endless wars,",
      "Heart split, torn by sores."
    ],
    shortID: "75552527",
    longID: "123b8a6cfdd0da234ab657154466a171437df20be6f21e34a80a099eb9fe5344i0"
  },
  {
    lines: [
      "Called to distant lands,",
      "Leaving home's demanding hands,",
      "Peace, in foreign sands."
    ],
    shortID: "75552521",
    longID: "b626306148a804ac95e778accdeb0a78e7a861cfc6faf1d41ab4043fee9aaf16i0"
  },
  {
    lines: [
      "Some stay, bound by oath,",
      "Guarding kin, lands, and both,",
      "Pride swells, 'spite the loath."
    ],
    shortID: "75552529",
    longID: "12979ac749da395efdcc57b6493e9924742366592016962e036a0eabaa94004ci0"
  },
  {
    lines: [
      "Fires blaze, night's new norm,",
      "Through the chaos, spirits form,",
      "Stand firm in the storm."
    ],
    shortID: "75552541",
    longID: "5b482bfe270f51896af3d3f3817887e40ddf69326a2ff77c40a3d76b6a08e397i0"
  },
  {
    lines: [
      "Dawn breaks, war's grim face,",
      "Talks of peace begin to pace,",
      "Hope mends broken lace."
    ],
    shortID: "75552547",
    longID: "d88e5306b99ee76cf516f18534284eeacce40682242e845ea5a0c299303146a4i0"
  },
  {
    lines: [
      "Fields once green now grey,",
      "Silence speaks where children play,",
      "Too much price to pay."
    ],
    shortID: "75552552",
    longID: "7c4b1e88a09e8c89d0393bcad05d2d20e25f926cf3b3952da0d3a5b33c30a2aci0"
  },
  {
    lines: [
      "War fades, dreams ignite,",
      "Lost friends step into the light,",
      "No winners in fight."
    ],
    shortID: "75552550",
    longID: "a90119dc0afa42f5ecced10b4af3c90b70f732c928af7c4c92a120c3bb5d0aa7i0"
  },
  {
    lines: [
      "Dreams ignite, reach high,",
      "Investors watch, keen to try,",
      "Ventures now in sky."
    ],
    shortID: "75552564",
    longID: "f49cc384186453b4b7b0428d3e88a1c0c7c0aef4dd9ce6b1621c01f8b2ecfee4i0"
  },
  {
    lines: [
      "爱添创意翼扬，",
      "共飞跨时间海，",
      "心醒在深海。"
    ],
    shortID: "75552519",
    longID: "947a84a6a5b6d2f49b1470379b720ff2d818d1eca3696d166ec9cde6c4298101i0"
  },
  {
    lines: [
      "Haste slows, visions grow,",
      "True paths, only few know,",
      "Roots deep, strong below."
    ],
    shortID: "75552533",
    longID: "05b093e6ac7afbdba994780994c3ab1a294feb40e9134ff0570610debfe88160i0"
  },
  {
    lines: [
      "Code weaves, silence now,",
      "Through night's calm, minds endow,",
      "Ideas start to plough."
    ],
    shortID: "75552525",
    longID: "b3531f288d27d5b582595fd1328ab653ae1bc8f8f0125ca32a19e5003959963bi0"
  },
  {
    lines: [
      "Visions true, deeply sewn,",
      "In ventures old and new grown,",
      "Value firm, well-known."
    ],
    shortID: "75552557",
    longID: "b056edee8ed63ff995f42fb72ea957579888f7d7fa6630ed77e6b063568873c8i0"
  },
  {
    lines: [
      "Users come, seek joy,",
      "Tools for Engagement deploy,",
      "Trust builds, none destroy."
    ],
    shortID: "75552560",
    longID: "3b773e3a7fb43ea5efdfe6a944a6ac3549338b8b1d343ddb6c3ef665c0e107d3i0"
  },
  {
    lines: [
      "Useful at its brim,",
      "Growth steady yet never dim,",
      "Future's chances slim."
    ],
    shortID: "75552520",
    longID: "6731a85aac85bb8daae32e41f4822f95ad1b735f38cd51a84a71233a0f91fa05i0"
  },
  {
    lines: [
      "Paths clear, goals replete,",
      "Challenges we meet and beat,",
      "Insight makes us fleet."
    ],
    shortID: "75552569",
    longID: "191f672012040e41e10e3449badb8bc88a91e7330dacb7656f569a5724ad20f8i0"
  },
  {
    lines: [
      "Time reveals the how,",
      "Its worth more than gold to plow,",
      "Success all endow."
    ],
    shortID: "75552522",
    longID: "4230d575a73369e2626a1b593087dc4961fc745595297cb8f1c1eb381d7efa1di0"
  },
  {
    lines: [
      "Market finds its calm rhythm,",
      "Speculation's end,— wisdom,",
      "Growth chants, new anthem."
    ],
    shortID: "75552536",
    longID: "15e6272c26363bc29503ea51667de7c11538d895c98a771a119bb4fe2ec5c677i0"
  },
  {
    lines: [
      "New heights take their place,",
      "Thoughts and efforts interlace,",
      "Victory bears its face."
    ],
    shortID: "75552554",
    longID: "1504c23275590f3640094a1e161cc820a3430b08844855f6f6444821401834b7i0"
  },
  {
    lines: [
      "Neon pulses through,",
      "New York's data rivers mesh—",
      "Dawn breaks, silence fresh."
    ],
    shortID: "75552551",
    longID: "2f73e791882d33de14f609756650ef8b69337fc46aa89dc82da97727e1f9f7aai0"
  },
  {
    lines: [
      "In Georgia's red clay,",
      "Secrets of tech roots convey—",
      "Break time, children play."
    ],
    shortID: "75552559",
    longID: "87ba4c09e86c83e7daafa27eafd018ccf8863a04e6b5e99afc881d2cb98970d2i0"
  },
  {
    lines: [
      "Cali's fog whispers,",
      "Silicon dreams rise as mist—",
      "Surf break, can't resist."
    ],
    shortID: "75552567",
    longID: "9885d7d113b13d06e11fa449d2dbe01564acbb02efadd988a644e5121c4b36ebi0"
  },
  {
    lines: [
      "As the world turns, find,",
      "Moments of peace, left behind—",
      "Sync lost, peace of mind."
    ],
    shortID: "75552562",
    longID: "ac205f27b74fe80ec9a4672c65ab1a8e2b0944fd78126630993eb24713684bd6i0"
  },
  {
    lines: [
      "Past Dutch windmills spin,",
      "Green tech dreams begin within—",
      "Bike ride, wind on skin."
    ],
    shortID: "75552566",
    longID: "c401516f2802d1df4e1857db896741469b8d505423249d45ce242b41ce6e76e9i0"
  },
  {
    lines: [
      "Air crisp in high peaks,",
      "Andorra dreams, visions seek—",
      "Logs crack, respite sleek."
    ],
    shortID: "75552546",
    longID: "0037ebaf84f318a44514819686da2c7b8e00d0eeb10e54e2a5e703627fbb96a3i0"
  },
  {
    lines: [
      "Heartbeats in bytes glow,",
      "Barcelona's passion shows—",
      "Berlin's calm moon, slow."
    ],
    shortID: "75552568",
    longID: "4654c3ee430285165f4d0df46be1090c62ff96a4557e9827633566dea6121ff8i0"
  },
  {
    lines: [
      "French vineyards, quiet,",
      "Robots tend with care, not riot—",
      "Stars out, tech on diet."
    ],
    shortID: "75552626",
    longID: "6e192cf05653c0cc0aa4e49c43ffc5b4a4a8b9ce078196cd1c60f3fe814f9ffei0"
  },
  {
    lines: [
      "Plains to peaks, 'States vast,",
      "Tech threads weave through every cast—",
      "Screens off, sleep at last."
    ],
    shortID: "75552540",
    longID: "c600e2dab544a4d5949707510d9504f9f2106ec171de1d4b8f2473eb28625b97i0"
  },
  {
    lines: [
      "Choice to mute, we make,",
      "In silence, peace we partake—",
      "Stillness ours to wake."
    ],
    shortID: "75552563",
    longID: "2234e9e459cf08f16782919937d624ecec1938da0fb2f636a3a6ecd43bb6a6e3i0"
  },
  {
    lines: [
      "Old coins fade away,",
      "Bitcoin's path, we all obey,",
      "Stacks rise by the day."
    ],
    shortID: "75552532",
    longID: "2b4a9c8d2dad461391f07144aaa2f4c3db057b433fab10815a2f4eacbb40095ei0"
  },
  {
    lines: [
      "Firm with Bitcoin's chain,",
      "On Stacks craft laws that remain,",
      "Secured gains, no pain."
    ],
    shortID: "75552555",
    longID: "7d3b0227943714757e9cecb131013b1e2d83354a0faac1448ebd550b70b523b8i0"
  },
  {
    lines: [
      "Chasing coins no more,",
      "Bitcoin's throne forever sure,",
      "In Stacks, wealth we store."
    ],
    shortID: "75552538",
    longID: "ecdac2e4829e033e834d8445feb36fec2b1034bf9032fbf19939ad51dab1848di0"
  },
  {
    lines: [
      "Bitcoin's golden rule,",
      "Build the future, smart and cool,",
      "Stacks, the power tool."
    ],
    shortID: "75552535",
    longID: "47e60b440ae7a85056be26baf918c1dde5eca1b765c2473fa5c0c0babfe57674i0"
  },
  {
    lines: [
      "Bitcoin's trust we stack,",
      "On its chain, no turning back,",
      "Smart laws, no crack."
    ],
    shortID: "75552553",
    longID: "4980631ffdccaa54fbe6aa391ee88fd06594cb21bd38dcc656aece02dbe0afadi0"
  },
  {
    lines: [
      "Shadows stretch, grow long,",
      "Searching through a sea of grey,",
      "Silence before dawn."
    ],
    shortID: "75552530",
    longID: "39441a8a19792dc6afd8c66e9d2d0115db6a81a602c4649f66f1244bbcba7d4ei0"
  },
  {
    lines: [
      "Sunset paints the sky,",
      "Structures wait, half-built, half-seen,",
      "Stakes high, as time flies."
    ],
    shortID: "75552549",
    longID: "c8434cfe53ade4609f8d7223864c3f792079852e86d7ea6e5344485367bb13a6i0"
  },
  {
    lines: [
      "Time's hand, unyielding,",
      "Carving legacies, shielding,",
      "What remains, remains."
    ],
    shortID: "75552605",
    longID: "651e7e854b12a2509577a5cbadac49815a1be50f29402b7cf334653436abb916i0"
  },
  {
    lines: [
      "Shapes now shift to place,",
      "Square block perfect in its grace,",
      "Sealed space, final trace."
    ],
    shortID: "75552610",
    longID: "c90f334294e369b68f1657e205e3dfea6baa814db7ca3271093c861084375a59i0"
  },
  {
    lines: [
      "Whispers in the dust,",
      "Lost scrolls yield to time's harsh trust,",
      "Secrets sleep in stone."
    ],
    shortID: "75552534",
    longID: "c55bd854fcbaf6dbb217cc16ea6a0f7e8572675edf51c0bca0d02662c73ce560i0"
  },
  {
    lines: [
      "Ocean depths conceal,",
      "Chance saves tales the old reveal,",
      "Echoes of life, flown."
    ],
    shortID: "75552613",
    longID: "d503ee14274d216c8c57fe3c780548ddd4cbeae074b40faeef03ef73d877bebci0"
  },
  {
    lines: [
      "Morning voices drift,",
      "Spoken words now lost in mist,",
      "Echoes without form."
    ],
    shortID: "75552604",
    longID: "c2be6ee61e87e8f295a27304fb23eac8d44baf019cd20445aaddf25684cc4f15i0"
  },
  {
    lines: [
      "Breath and sound, a plea,",
      "Fleeting whispers set seeds free,",
      "Wisdom's silent storm."
    ],
    shortID: "75552570",
    longID: "6f6e3dfe646e2b357f70ea5b87b0c4ae8a682b13a1e873eec3fffd1a319a4ffdi0"
  },
  {
    lines: [
      "Shadows dance in light,",
      "Vanish with the coming night,",
      "Memory blurs soft."
    ],
    shortID: "75552606",
    longID: "fcb4a30159f3bcb0d2a2ac05790839202cc80b5c5d709b380b076e20e169bc35i0"
  },
  {
    lines: [
      "Art lives on unseen,",
      "Steps where dancing feet have been,",
      "Echoes loft aloft."
    ],
    shortID: "75552609",
    longID: "e54e38213071c08af98ed7440e4b41ac54d2f47c5ee92d14612d44ea9b81894fi0"
  },
  {
    lines: [
      "Hands carve into stone,",
      "Marks known, storms might yet disown,",
      "No form guaranteed."
    ],
    shortID: "75552607",
    longID: "501dd511c7b3d6765fd6c73f61789c6f0bd963d19c8c35933a7daa971619883ci0"
  },
  {
    lines: [
      "We build and confess,",
      "Our creations might be less,",
      "Our mess outlast deed."
    ],
    shortID: "75552624",
    longID: "9099b99818abb41691462b43d306acbb1b37c71b87a4646e8f9a55b05feb4cfai0"
  },
  {
    lines: [
      "Eyes on Mars' dust plains,",
      "Celestial chains, solar wanes,",
      "Legacies in test."
    ],
    shortID: "75552625",
    longID: "82b08971a680afe1a53aed29fbd3a2c650874561729fb90ad5010f594a08c1fci0"
  },
  {
    lines: [
      "Eons pass like dreams,",
      "For enduring schemes it seems,",
      "Survival must quest."
    ],
    shortID: "75552608",
    longID: "86a05c3b3f22812a9d33b1351e93f45bbd0147f758b2694b4b3556b23c049a41i0"
  },
  {
    lines: [
      "Time's hand, unyielding,",
      "Carving legacies, shielding,",
      "What remains, remains."
    ],
    shortID: "75552605",
    longID: "651e7e854b12a2509577a5cbadac49815a1be50f29402b7cf334653436abb916i0"
  },
  {
    lines: [
      "                 ",
      "                 ",
      "                 "
    ],
    shortID: "75552612",
    longID: "654a3f0c5cf104aee2ab935b170c47555024ab13857ff6e6681fca661f333ba7i0"
  }
];