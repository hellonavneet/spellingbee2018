const fs = require('fs');
const say = require('say')
const readline = require('readline');
const prompt = require('prompt');

const filename = ".\\wordtext.txt";

prompt.start({
    noHandleSIGINT: true
});

process.on('SIGINT', () => process.exit());

fs.readFile(filename, 'utf8', function (err, data) {
    if (err) throw err;
    const lines = data.split("\n");
    const words = [];
    lines.reduce((list, val) => {
        val = val.trim();
        if (val) {
            const word = val.split(' ')[1];
            list.push(word);
        }
        return list;
    }, words);

    askWords(words);
});

let correctResponses = 0;
let wordsAsked = 0;

function askWords(words) {
    if (words.length > 0) {
        const index = randomInt(0, words.length - 1);
        const word = words[index];
        promptWord(word, () => {
            wordsAsked++;
            correctResponses++;
            words.splice(index, 1);
            askWords(words);
        }, () => {
            wordsAsked++;
            askWords(words);
        });
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getSchema() {
    const schema = {
        properties: {
            word: {
                description: `(Score: ${correctResponses}/${wordsAsked}): Spell It`,
                pattern: /^[a-zA-Z]+$/,
                message: 'Word must be only letters.',
                required: false
            }
        }
    };

    return schema;
}

function promptWord(word, onCorrect, onIncorrect, count = 0) {
    if (count > 0) {
        console.log("Try again...");
    }
    say.speak(word, 'Alex', 0.5);
    const callAgain = () => promptWord(word, onCorrect, onIncorrect, count);

    prompt.get(getSchema(), (err, result) => {
        if (err || !result.word) {
            callAgain();
            return;
        } else if (result.word === word) {
            onCorrect();
            return;
        } else {
            if (count >= 3) {
                console.log("Correct spelling is :" + word);
                onIncorrect();
                return;
            }
            count++;
            callAgain();
            return;
        }
    });
}