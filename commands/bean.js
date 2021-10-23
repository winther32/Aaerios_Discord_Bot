// A meme command which picks a img or gif of beans from beans array in images and returns it

// Get the bean image link array from images folder
const beanArray = require('../images/beans').array;

// min max inclusive random int func
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    name: 'beans',
    description: 'returns a image or gif of beans',
    execute(message) {
        index = getRandomInt(0, beanArray.length - 1);
        message.channel.send({ files: [beanArray[index]]});
    }
}