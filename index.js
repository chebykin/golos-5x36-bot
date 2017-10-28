require('dotenv').config();

let golos = require('golos-js');
let math = require('mathjs');
let CronJob = require('cron').CronJob;

const wif = process.env.WIF_KEY;
const login = process.env.LOGIN;
const loto = "golos.loto";

if (!wif || !login) {
  throw new Error("You should specify WIF_KEY and LOGIN env vars");
}

async function publish() {
  try {
    let result = await golos.api.getDiscussionsByBlogAsync({
      limit: 1,
      select_authors: [loto]
    });
    console.log('>>> author', result[0].author);

    if (result[0].author !== loto) {
      throw new Error("Author incorrect: " + result[0].author);
    }

    let parent_url = result[0].permlink;

    let comments = await golos.api.getContentRepliesAsync(loto, parent_url);

    console.log('>>> total comments', comments.length);

    comments.forEach((comment) => {
      if (comment.author === login) {
        throw new Error('User ' + login + ' has already commented this post');
      }
    });

    result = await golos.broadcast.commentAsync(wif, loto, parent_url, login, 're-' + parent_url + (+new Date()), '', numbersString(), {});
    console.log('>>> comment', result);

    result = await golos.broadcast.voteAsync(wif, login, loto, parent_url, 10000);
    console.log('>>> vote', result);
  } catch (e) {
    console.log('>>> error', e);
  }
}

function numbersString() {
  let string = "";

  let sortedArray = numbersArray();

  for (let i = 0; i < 5; i++) {
    string += " " + sortedArray[i] + "";
  }

  return string.trim();
}

function numbersArray() {
  let array = [];

  for (let i = 0; i < 5; i++) {
    let n;

    while (true) {
      n = math.ceil(math.random(1, 36));

      if (array.indexOf(n) === -1) {
        break;
      }
    }

    array.push(n);
  }

  return array.sort(function (a, b) {
    return a - b;
  });
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

(new CronJob({
  cronTime: '40,50 11,14,17,20,23 * * *',
  onTick: function () {
    console.log(">>> publishing...");
    (async function () {
      await sleep(30 * 1000);
      await publish();

      console.log(">>> publishing done");
    })();
  },
  start: true,
  timeZone: 'Europe/Moscow',
})).start();
