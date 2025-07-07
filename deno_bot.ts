// deno_bot.ts
import { Bot, InlineKeyboard } from "https://deno.land/x/grammy/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
const ADMIN_CHAT_ID = 318752994;
const CHANNEL_LINK = "https://t.me/+SEUjra4YvL41Mjgy";
const WAYFORPAY_URL = "https://secure.wayforpay.com/sub/dinkafood";

var bot = new Bot(BOT_TOKEN)!;
bot.init();


var userLanguage = new Map<number, string>();
var waitingForEmail = new Set<number>();
bot.command("start", async (ctx) => {
  var keyboard = new InlineKeyboard()
    .text("Українська 🇺🇦", "lang_ua")
    .text("English 🇬🇧", "lang_en");

  await ctx.reply("Hi, cutie! Thank you for being so supportive! 🫂 Please choose your language 👇🏻", {
    reply_markup: keyboard,
  });
});

bot.callbackQuery(/^lang_/, async (ctx) => {
  var chatId = ctx.chat.id;
  var lang = ctx.match[0].split("_")[1];
  userLanguage.set(chatId, lang);

  var keyboard = new InlineKeyboard().url("📄 ", WAYFORPAY_URL);
  var confirm = new InlineKeyboard().text("✅ I’ve paid / Я оплатив(ла)", "confirm_payment");

  if (lang === "ua") {
    await ctx.reply("Смаколику, вітаю! 🍓\nТи на порозі вступу до закритого каналу...\n\nДоступ коштує 300 грн/міс.\nЩомісяця 20% з підписок я надсилаю на перевірені збори і ділюсь звітами у каналі.", {
      reply_markup: keyboard,
    });
    await ctx.reply("Після оплати тицни кнопку нижче:", {
      reply_markup: confirm,
    });
  } else {
    await ctx.reply("Hey you tasty babe! 🍓\nYou're about to enter a private space...\n\nSubscription is 300 UAH/month.\nEvery month, 20% is donated to verified causes.", {
      reply_markup: keyboard,
    });
    await ctx.reply("After payment, click the button below:", {
      reply_markup: confirm,
    });
  }
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("confirm_payment", async (ctx) => {
  var lang = userLanguage.get(ctx.chat.id) || "ua";
  waitingForEmail.add(ctx.chat.id);
  if (lang === "ua") {
    await ctx.reply("Вкажи, будь ласка, email, з якого ти здійснював(ла) оплату:");
  } else {
    await ctx.reply("Please enter the email address you used for the payment:");
  }
  await ctx.answerCallbackQuery();
});

bot.on("message:text", async (ctx) => {
  var chatId = ctx.chat.id;
  if (!waitingForEmail.has(chatId)) return;
  waitingForEmail.delete(chatId);

  var lang = userLanguage.get(chatId) || "ua";
  var email = ctx.message.text;
  var username = ctx.from?.username || "No username";

  var adminText = lang === "ua"
    ? `🔔 Дякую, тебе зареєстровано!\n\nEmail: ${email}\nUsername: @${username}`
    : `🔔 Thank you, you’re registered!\n\nEmail: ${email}\nUsername: @${username}`;

  await bot.api.sendMessage(ADMIN_CHAT_ID, adminText);

  var userText = lang === "ua"
    ? `Вітаю в закритому клубі! 🎉\nОсь лінк на канал, bon appetit 🫦: ${CHANNEL_LINK}`
    : `Welcome to the private club! 🎉\nHere is the channel link, bon appetit 🫦: ${CHANNEL_LINK}`;

  await ctx.reply(userText);
  await ctx.replyWithAnimation("https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExc293cnNpMGJja290MG81NHRneWdiZjByYXc5YXMzeWJybzF0eTdkdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9dTzXZY6qncBO/giphy.gif");
});

bot.command("language", async (ctx) => {
  var keyboard = new InlineKeyboard()
    .text("Українська 🇺🇦", "lang_ua")
    .text("English 🇬🇧", "lang_en");
  await ctx.reply("Choose your language / Обери мову:", {
    reply_markup: keyboard,
  });
});

bot.command("plans", async (ctx) => {
  var lang = userLanguage.get(ctx.chat.id) || "ua";
  var keyboard = new InlineKeyboard().url("📄", WAYFORPAY_URL);
  var text = lang === "ua"
    ? "Доступ коштує 300 грн/міс.\nЩомісяця 20% з підписок я надсилаю на перевірені збори."
    : "Subscription is 300 UAH/month.\nEvery month, 20% is donated to verified causes.";
  await ctx.reply(text, {
    reply_markup: keyboard,
  });
});

bot.command("cancel", async (ctx) => {
  var lang = userLanguage.get(ctx.chat.id) || "ua";
  var text = lang === "ua"
    ? "Щоб скасувати підписку, відкрий пошту, знайди лист від WayforPay та натисни кнопку *«Скасувати підписку»* або напиши мені 💌"
    : "To cancel your subscription, find the WayforPay confirmation email and click *'Cancel subscription'* or contact me 💌";
  await ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("ping", async (ctx) => {
  await ctx.reply("pong 🏓");
  console.log("💬 Ping received and replied");
});

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    var update = await req.json();
    await bot.handleUpdate(update);
    return new Response("OK");
  } catch (err) {
    console.error("Error handling update:", err);
    return new Response("Error", { status: 500 });
  }
});

