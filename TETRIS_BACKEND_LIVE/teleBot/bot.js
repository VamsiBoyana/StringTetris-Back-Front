const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");


// const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });


// Your web app URLs (replace with real ones or localhost tunnel for testing)

// Your React app URL (deployed or localhost tunnel for testing)
const WEBAPP_URL = "https://stringtetris.com/";
const ABOUT_URL = "https://yourapp.com/announcements";
const TWITTER_URL = "https://x.com/StringTetris";
const ANNOUNCEMENT_URL = "https://t.me/stringtetris";
const COMMUNITY_URL = "https://t.me/stringtetris_chat";




bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const caption = `
🎮 Join Tetris and Start Earning String Tokens 🎮

First Play 2 Earn Game on Telegram with Instant Withdraw to TON

How to Earn Tokens:
- Play Games💎
- Complete Daily Tasks 📝
- Invite Friends 👥 (1 Invite = $0.05 USDT)

100k Tokens = $1 USDT

Join now and Start winning FREE USDT (TON Network)
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [
        { text: "X (Twitter)", url: TWITTER_URL },
        { text: "💬 Community", url: COMMUNITY_URL },
        { text: "📢 Announcement", url: ANNOUNCEMENT_URL },
      ],
      [
        { text: "🎮 Play", web_app: { url: WEBAPP_URL } },
      ],
    ],
  };

  // Send ONLY the banner with caption + buttons (no extra text message)
  bot.sendPhoto(chatId, "https://ik.imagekit.io/49k5bd1tth/Tetris_Logo%201.png?updatedAt=1755170945589", {
    caption,
    reply_markup: keyboard,
  });
});


