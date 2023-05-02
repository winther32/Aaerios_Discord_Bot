const Util = require('../util');

const BREAKING_BAD_QUOTES = [
  '“Well, technically, chemistry is the study of matter. But I prefer to see it as the study of change.” - Walter White',
  '“Finding myself awake at three in the morning. But you know what? Ever since my diagnosis, I sleep just fine.” - Walter White',
  '“Yeah, Mr. White! Yeah, science!” - Jesse Pinkman',
  '“I did it for me.” - Walter White',
  '“If you don’t know who I am, then maybe your best course would be to tread lightly.” - Walter White',
  '“I am not in danger, I am the danger.” - Walter White',
  '“You know what Walt? Someone needs to protect this family from the man who protects this family.” - Skyler White',
  '“To all law enforcement entities, this is not an admission of guilt.” - Walter White',
  '“I have spent my whole life scared, frightened of things that could happen, might happen, might not happen, fifty years I spent like that.” - Walter White',
  '“The devil is in the details.” - Skyler White',
  '“I told you, Skyler, I warned you for a solid year: you cross me, and there will be consequences.” - Walter White',
  '“I want my kids back. I want my life back. Please tell me - How much is enough? How big does this pile have to be?” - Skyler White',
  '“It’s easy money. Until we catch you.” - Hank Schrader',
  '“You clearly don’t know who you’re talking to, so let me clue you in. I am not in danger, Skyler. I am the danger. A guy opens his door and gets shot, and you think that of me? No! I am the one who knocks!” - Walter White',
  '“If I have to hear one more time that you did this for the family…” - Skyler White',
  '“We’re all on the same page. The one that says, if I can’t kill you, you’ll sure as shit wish you were.” - Jesse Pinkman',
  '“Who are you talking to right now? Who is it you think you see? Do you know how much I make a year?” - Walter White',
  '“I once told a woman I was Kevin Costner and it worked because I believed it.” - Saul Goodman',
  '“Run.” - Walter White',
  '“We’ve come this far…what’s one more?” - Skyler White',
  '“Scientists love lasers.” - Saul Goodman',
  '“If you’re committed enough, you can make any story work.” - Saul Goodman',
  '“Did I say you could open your mouth? And, hands off the car!” - Hank Schrader',
  '“If you believe that there’s a hell, we’re pretty much already going there.” - Walter White',
  '“You’re the smartest guy I’ve ever met. And you’re too stupid to see… he made up his mind ten minutes ago.” - Hank Schrader',
  '“Right now, what I need, is for you to climb down out of my *ss. Can you do that? Will you do that for me, honey? Will you please, just once, get off my *ss? You know? I’d appreciate it. I really would.” - Walter White',
  '“You add plus a douchebag to a minus douchebag and you get, Like, Zero Douchebags.” - Jesse Pinkman',
  '“A guy that clean has to be dirty.” - Hank Schrader',
  '“That’s it. That’s the only good option. Hold on. Bide my time and wait.” - Skyler White',
  '“Wire…” - Jesse Pinkman',
  '“My name is ASAC Schrader - and you can go f*ck yourself.” - Hank Schrader',
  '“I need support. Me, the almost 40-year-old pregnant woman with a surprise baby on the way. And the husband with lung cancer who disappears for hours on end, and I don’t know where he goes and he barely even speaks to me anymore.” - Skyler White',
  '“Congratulations, you’ve just left your family a second-hand Subaru.” - Saul Goodman',
  '“This is my own private domicile, and I will not be harassed…b*tch!” - Jesse Pinkman',
  '“What I came to realize is that fear, that’s the worst of it. That’s the real enemy. So, get up, get out in the real world and you kick that bastard as hard you can right in the teeth.” - Walter White',
  '“There is gold in the streets just waiting for someone to come and scoop it up.” - Walter White',
  '“The fun’s over. From here on out, I’m Mr. Low Profile. Just another douche bag with a job and three pairs of Dockers. If I’m lucky, month from now, best-case scenario, I’m managing a Cinnabon in Omaha.” - Saul Goodman',
  '“We tried to poison you. We tried to poison you because you are an insane, degenerate piece of filth and you deserve to die.” - Walter White',
  '“I am speaking to my family now. Skyler, you are the love of my life. I hope you know that.” - Walter White',
  '“F*ck you and your eyebrows.” - Walter White',
  '“I’m not saying it’s not bad. It’s bad. But it could be worse.” - Saul Goodman',
  '“We’re done when I say we’re done” - Walter White',
  '“Some straight like you, giant stick up his ass, age what, 60? He’s just gonna break bad?” - Jesse Pinkman',
  '“Tread lightly.” - Walter White',
  '“Just because you shot Jesse James, don’t make you Jesse James.” - Mike Ehrmantraut',
  '“Even government doesn’t care that much about quality. You know what is okay to put in hot dogs?” - Jesse Pinkman',
  '“Say my name.” - Walter White',
  '“Oh, hey, nerdiest old dude I know, you wanna come cook crystal? Please. I’d ask my diaper-wearing granny, but her wheelchair wouldn’t fit in the RV.” - Jesse Pinkman',
  '“Did you know that there’s an acceptable level of rat turds that can go into candy bars?” - Jesse Pinkman',
  '“Walt, I’ve said it before, if you are in danger, we go to the police…” - Skyler White',
  '“Oh, no. I don’t want to hear about the police! I do not say that lightly!” - Walter White',
  '“I won.” - Walter White',
  '“Shut the f*ck up and let me die in peace.” - Mike Ehrmantraut',
  '“Tagging trees is a lot better than chasing monsters.” - Hank Schrader',
  '“Well, at least he didn’t sh*t himself this time. Guess that’s progress.” - Hank Schrader',
  '“I swear to Christ, I will put you under the jail!” - Hank Schrader',
  '“When I go in there, I’m bringing proof, not suspicion.” - Hank Schrader',
  '“The moral of the story is…I chose a half measure when I should have gone all the way. I’ll never make that mistake again. No more half measures, Walter.” - Mike Ehrmantraut',
  '“Is this just a genetic thing with you? Is it congenital? Did your mother drop you on your head when you were a baby?” - Walter White',
  '“You can go f*ck yourself.” - Hank Schrader',
  '“I learned from the best. Something tells me Hank is here because of you - and I’m not forgetting that.” - Skyler White',
  '“I am the one who knocks.” - Walter White',
  '“If you try to interfere, this becomes a much simpler matter.” - Gus Fring',
  '“And a man, a man provides. And he does it even when he’s not appreciated, or respected, or even loved. He simply bears up and he does it. Because he’s a man.” - Gus Fring',
  '“This kicks like a mule with its balls wrapped in duct tape!” - Tuco Salamanaca',
  '“Never do the same mistake twice.” - Gus Fring',
  '“You are not the guy. You’re not capable of being the guy. I had a guy, but now I don’t. You are not the guy.” - Mike Ehrmantraut',
  '“Marie, shut up!” - Skyler White',
  '“I watched Jane die. I was there. And I watched her die. I watched her overdose and choke to death. I could have saved her. But I didn’t.” - Walter White',
  '“We have discussed everything we need to discuss… I thought I made myself clear…” - Skyler White',
  '“Smoking marijuana, eating Cheetos, and masturbating do not constitute plans in my book.” - Walter White',
  '“I have lived under the threat of death for a year now. And because of that, I’ve made choices.” - Walter White',
  '“No, they’re minerals, Jesus Marie!” - Hank Schrader',
  '“It’s always been one step forward and two steps back” - Walter White',
  '“When I put everything into quicken, nothing flashed red, so that’s gotta mean it’s ok, right?” - Skyler White',
  '“Walt, please, let’s both of us stop trying to justify this whole thing and admit you’re in danger!” - Skyler White',
  '“Darth Vader had responsibilities. He was responsible for the Death Star.” - Badger',
  '“I hide in plain sight, same as you.” - Gus Fring',
  '“Stay out of my territory.” - Walter White',
  '“This is what comes from blood for blood.”&nbsp;- Gus Fring',
  '“I f*cked Ted.” - Skyler White',
  '“Hey, I’m a civilian! I’m not your lawyer anymore. I’m nobody’s lawyer.” - Saul Goodman',
  '“Does the Pope sh*t in his hat?” - Hank Schrader',
  '“I’m A blowfish! Blowfish! Yeah! Blowfishin’ this up!” - Jesse Pinkman',
  '“Sending him on a trip to Belize.” - Saul Goodman',
  '“Walter Jr., you’re my big man. There are going to be some things that you’ll come to learn about me in the next few days. But just know that no matter how it may look, I only had you in my heart. Goodbye.” - Walter White',
  '“Cause God knows she’s the one with the really important problems!” - Skyler White',
  '“Sometimes the forbidden fruit tastes the sweetest.” - Hank Schrader',
  '“Yo, Gatorade me, B*tch.” - Jesse Pinkman',
  '“I mean, it’s just..it’s the constant, it’s the cycle. Its solution, dissolution, just over and over and over. It is growth, then decay, then transformation. It is fascinating, really.” - Walter White',
  '“When you have children, you always have family.” - Gus Fring',
  '“What do I look like? Scarface?” - Jesse Pinkman',
  '“I’m in the empire business.” - Walter White',
  '“You really want to burn him down? Let’s do it together.” - Hank Schrader',
  '“Coin flip is sacred.” - Jesse Pinkman',
  '“Free food always tastes good. Free drinks even better.” - Hank Schrader',
  '“I don’t believe fear to be an effective motivator.” - Gus Fring',
  '“You got me riding shotgun to every dark recess of this state. It’d be nice if you clued me in a little.” - Jesse Pinkman',
  '“My friends, I promise you that together, we will prosper.” - Gus Fring',
  '“Now look buddy, the last thing I want to do is get you in hot water, but some meth monkey had a feeding frenzy in here.” - Hank Schrader'
];

module.exports = {
  name: 'bbQuote',
  description: 'returns quote from Breaking Bad',
  execute(message) {
    index = Util.getRandomInt(0, BREAKING_BAD_QUOTES.length - 1);
    message.channel.send(BREAKING_BAD_QUOTES[index]);
  }
}