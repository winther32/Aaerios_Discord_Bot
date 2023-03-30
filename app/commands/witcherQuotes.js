const Util = require('../util');

const WITCHER_QUOTES = [
  '“Evil is evil. Lesser, greater, middling, makes no difference. The degree is arbitrary, the definitions blurred. If I’m to choose between one evil and another, I’d rather not choose at all.” - Geralt',
  '“Damn, you’re ugly!” - Geralt',
  '"Fuck" - Geralt',
  '“People linked by destiny will always find each other.” - Geralt',
  '“A true witcher should never abandon poultry in distress.” - Geralt',
  '“[to a goat] Bear! Bear! Run, you stupid piece of shit!” - Geralt',
  '“Where’d you complete your training? School of the Snail?” - Geralt',
  '“Fascinating story. Any chance you’re nearing the end?” - Geralt',
  '“Why men throw their lives away attacking an armed witcher . . . I’ll never know. Something about my face? - Geralt',
  '“[talking to his horse] Want to hear about my first monster? Wasn’t 50 miles outside of Kaer Morhen. He was huge. Stinking. Bald head. Rotten teeth. He pulled that girl from the cart, tore her dress off in front of her father and said ‘It’s time you met a real man.’ I told him it was time he met one too. It took two strikes to kill him. They weren’t clean. But they were spectacular. I turned to that girl afterwards. She was drenched in the man’s blood. She took one look at me, screamed, vomited, and passed out.” - Geralt',
  '“Wizards are all the same. You talk nonsense while making wise and meaningful faces. Speak normally.” - Geralt',
  '“I will not suffer tonight sober just because you hid your sausage in the wrong royal pantry.” - Geralt',
  '“At least when Filavandrel’s blade kissed my throat I didn’t shit myself. Which is all I can hope for you, good lords. At your final breath, a shitless death. But I doubt it.” - Geralt',
  '“What now, you piece of filth?” - Geralt',
  '“Keep the Gods out of it. Swear on your heads. Which I will take if you break your vow.” - Geralt',
  '“There’s nothing behind me. I’m a witcher, I’d have heard it. Just like I can hear your heart. Which is pounding . . . like a liar’s.” - Geralt',
  '“I want you to burst, you son of a whore.” - Geralt',
  '“A dynasty can’t survive on arrogance alone.” - Geralt',
  '“[to Ciri after the death of Vesemir] Don’t blame yourself. No Witcher’s ever died in his bed.” - Geralt',
  '“Humans? I have learned to live with them. So that I may live.” - Geralt',
  '“I need no one. And the last thing I want is someone needing me.” - Geralt',
  '“But first appearances are often deceptive. Not everything monstrous-looking is evil, and not everything fair is good… and in every fairytale, there is a grain of truth.” - Geralt',
  '“I believe in the sword.” - Geralt',
  '“Mistakes are also important to me. I don’t cross them out of my life, or memory. And I never blame others for them.” - Geralt',
  '“Hatred and prejudice will never be eradicated. And witch hunts will never be about witches. A scapegoat, that’s the key.” - Geralt',
  '“You don’t need mutations to strip men of their humanity. I’ve seen plenty of examples.” - Geralt',
  '“Chaos is the same as it’s always been. Humans just adapted better.” - Geralt',
  '“Sometimes there’s monsters, sometimes there’s money. Rarely both. That’s the life.” - Geralt',
  '“Destiny helps people believe there’s an order to this horseshit. There isn’t. But a promise made must be honored. As true for a commoner as it is for a queen.” - Geralt',
  '“States rise and fall like the tide. Nothing new.” - Geralt',
  '“No treasure is worth dying for.” - Geralt',
  '“The Trail will test you. Force you to move beyond the pain, the fear, the failure. Until you become one with the killer itself. Remember, hesitation will draw danger to you like fire. But trust the path you choose… and it will protect you. Even in darkness. As long as you listen. Always listen.” - Geralt'
];

module.exports = {
  name: 'witcherQuote',
  description: 'returns a quote from Witcher',
  execute(message) {
    index = Util.getRandomInt(0, WITCHER_QUOTES.length - 1);
    message.channel.send(WITCHER_QUOTES[index]);
  }
}