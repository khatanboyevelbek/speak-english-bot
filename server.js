const dotenv = require('dotenv');
dotenv.config();
const {Telegraf} = require('telegraf');
const axios = require('axios');
const googletrans = require('googletrans');
const token = process.env.TOKEN;
const bot = new Telegraf(token);
const appId = process.env.APP_ID;
const appKey = process.env.APP_KEY;
const language = 'en-gb';

const start = () => {
    bot.start(async ctx => {
        const firstname = ctx.from.first_name;
        return await ctx.reply(`Welcome ${firstname}.Send me valid a word`);
    });
    bot.on('message', async ctx => {
        try {
            const chatId = ctx.chat.id;
            const message = ctx.update.message.text;
            const url = `https://od-api.oxforddictionaries.com:443/api/v2/entries/${language}/${message.toLowerCase()}`;
            const data = await axios({
                method: 'get',
                url: url,
                headers: {
                    app_id: appId,
                    app_key: appKey
                }
            });
            let audio = data.data.results[0].lexicalEntries[0].entries[0].pronunciations[0].audioFile;
            const senses = data.data.results[0].lexicalEntries[0].entries[0].senses;
            const definitionsList = [];
            for(let i in senses){
                definitionsList.push(senses[i].definitions[0]);
            }
            const filteredDefinitions = definitionsList.map(definition => `\n 👉 ${definition}`);
            await ctx.telegram.sendMessage(chatId, `Definitions ${[...filteredDefinitions]}`);
            return await ctx.telegram.sendAudio(chatId, audio);
        } catch (error) {
            return await ctx.reply('Data not found');
        }
    })
    bot.launch();
}
start();