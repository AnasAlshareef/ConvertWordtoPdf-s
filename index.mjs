import { Telegraf } from 'telegraf';
import libre from 'libreoffice-convert';
import fs from 'fs';
import fetch from 'node-fetch';
import { promisify } from 'util';

const token = 'Enter your bot Token';
const bot = new Telegraf(token);
libre.convertAsync = promisify(libre.convert); // Promisify convert function
bot.start((ctx) => ctx.reply('Send me a Word document, and I will convert it to PDF!'));

bot.on('document', async (ctx) => {
  const fileId = ctx.message.document.file_id;
  const loadingMessage = await ctx.reply('Converting your document to PDF, please wait...');
  const fileName = ctx.message.document.file_name;
  const finallname= fileName.replace(".docx", ".pdf")
  const outputName = finallname 
  const link = await ctx.telegram.getFileLink(fileId);
  const response = await fetch(link);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  libre.convertAsync(buffer, '.pdf', undefined, (err, done) => {
    if (err) {
      ctx.reply('Failed to convert document to PDF.');
      console.error(err);
      return;
    }

    const output = Buffer.from(done);
    fs.writeFileSync(outputName, output);
    ctx.replyWithDocument({ source: outputName });
    ctx.deleteMessage(loadingMessage.message_id);
  });
});

bot.launch();
console.log('Bot has been started...');