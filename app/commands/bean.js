// A meme command which picks a img or gif of beans from beans array in images and returns it

// Get the bean image link array from images folder
const beanArray = require('../images/beans').array;
const Util = require('../util');

module.exports = {
    name: 'beans',
    description: 'returns a image or gif of beans',
    execute(message) {
        index = Util.getRandomInt(0, beanArray.length - 1);
        message.channel.send({ files: [beanArray[index]]});
    }
}