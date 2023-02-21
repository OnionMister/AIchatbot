import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

// 获取环境变量
config();

const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY,
});
const openAI = new OpenAIApi(configuration);

const app = express();
app.use(cors()); // 允许跨域
app.use(express.json()); // 允许前端向此服务传输json

app.get('/', (req, res) => {
     res.status(200).send({
        message: 'Hello from chatbot-server',
     });
})

app.post('/', async (req, res) => {
    try {
        // 用户输入
        const prompt = req.body.prompt;
    
        const response = await openAI.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        });
    } catch(err) {
        console.log(err);
        res.status(500).send({ err })
    }
});

app.listen(5000, () => { console.log('服务已启动：http://localhost:5000'); });
