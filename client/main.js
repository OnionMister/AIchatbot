import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// loading...
function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

// AI回复打字效果
function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index++);
        } else {
            clearInterval(interval);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, 20);
}

// 生成唯一ID
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    return `id-${timestamp}-${randomNumber.toString(16)}`
}

// 一条聊天记录
function chatStripe(isAi, value, uniqueId) {
    return (
        `
            <div class='wrapper ${isAi ? 'ai' : ''}'>
                <div class='chat'>
                    <div class='profile'>
                        <img
                            src='${isAi ? bot : user}'
                            alt='${isAi ? 'bot' : 'user'}'
                        />
                    </div>
                    <div class='message' id='${uniqueId}'>${value}</div>
                    ${
                        isAi ? `
                            <span class='ai_btn'>
                                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                            </span>
                        ` : ''
                    }
                </div>
            </div>
        `
    )
}

async function handleSubmit(e) {
    e.preventDefault();

    const data = new FormData(form);

    // 用户信息累加入聊天框
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    form.reset();

    // AI信息累加入聊天框
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    // AI信息框增加loading
    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);

    // 请求服务
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    });
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();
        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();
        console.log('err: ', err);
        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
        handleSubmit(e);
    }
});

// 自适应textarea
// 最小高度
let minRows = 1;
// 最大高度，超过则出现滚动条
let maxRows = 8;
function autoResize({ target: t }) {
    console.log('t: ', t);
    if (t.scrollTop == 0) t.scrollTop = 1;
    while (t.scrollTop == 0) {
        if (t.rows > minRows)
            t.rows--;
        else
            break;
        t.scrollTop = 1;
        if (t.rows < maxRows)
            t.style.overflowY = "hidden";
        if (t.scrollTop > 0) {
            t.rows++;
            break;
        }
    }
    while (t.scrollTop > 0) {
        if (t.rows < maxRows) {
            t.rows++;
            if (t.scrollTop == 0) t.scrollTop = 1;
        }
        else {
            t.style.overflowY = "auto";
            break;
        }
    }
}
document.querySelector('textarea').addEventListener('keyup', autoResize)