let golos = require('golos-js');
let math = require('mathjs');
let parent_url;

const WIF = process.env.WIF_KEY;
const login = process.env.LOGIN;
const loto = "golos.loto";

function main() {
  if (!golos.auth.isWif(WIF)) {
    return;
  }

  // once an hour
  setInterval(() => {
    // Publish each 3 hours (Moscow time UTC+3)
    if ((new Date()).getUTCHours() % 3 === 0) {
      publish();
    }
  }, 3600)
}

function publish() {
  golos.api.getDiscussionsByBlogAsync({
    limit: 1,
    select_authors: [loto]
  })
    .then((result) => {
      if (result[0].author !== loto) {
        throw new Error("Author incorrect: " + result[0].author);
      }

      parent_url = result[0].permlink;

      return golos.api.getContentRepliesAsync(loto, parent_url);
    })
    .then(function (comments) {
      console.log('>>> total comments', comments.length);

      comments.forEach((comment) => {
        if (comment.author === login) {
          throw new Error('User ' + login + ' has already commented this post');
        }
      });

      return golos.broadcast.commentAsync(WIF, loto, parent_url, login, 're-' + parent_url + (+new Date()), '', numbersString(), {})
    })
    .then((result) => {
      console.log('>>> comment', result);

      return golos.broadcast.voteAsync(WIF, login, loto, parent_url, 10000)
    })
    .then((result) => {
      console.log('>>> vote', result);
    })
    .catch(function (err) {
      console.log('>>> error', err);
    });
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

main();