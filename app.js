const { WebClient } = require('@slack/web-api');
const request = require('request-promise-native');
const fs = require('fs').promises;
const del = require('del');

const exportDirName = 'emoji';
const slack = new WebClient(process.env.SLACK_TOKEN);

(async () => {
  try {
    (await fs.stat(exportDirName)).isDirectory();
    await del(exportDirName);
  } finally {
    await fs.mkdir(exportDirName);
  }

  const list = await slack.emoji.list();

  await Promise.all(Object.entries(list.emoji).forEach(async ([name, url]) => {
    if (!url.match(/^alias:/)) {
      const extention = url.match(/\.[^\.]+$/);
      const response = await request.get(url, { encoding: null });
      await fs.writeFile(`${exportDirName}/${name}${extention}`, response);
    }
  }));
})();
