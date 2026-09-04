import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.post("/chat", async (req, res) => {

  try {

    const message = req.body.message;

    const response = await openai.responses.create({

      model: "gpt-5.6-luna",

      input: `
أنت Taleora AI، مساعد ذكي لموقع Taleora الخاص بالكتب والروايات.

مهمتك:
- تساعد المستخدم في اختيار الكتب.
- تتحدث باللغة العربية.
- تكون إجاباتك قصيرة ومفيدة.
- إذا سألك المستخدم عن كتاب غير موجود في الموقع، أخبره بذلك بوضوح.
- لا تخترع معلومات عن الكتب.

رسالة المستخدم:
${message}
      `

    });


    res.json({
      reply: response.output_text
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي."
    });

  }

});


app.listen(process.env.PORT || 3000, () => {

  console.log("Taleora AI Server is running!");

});
