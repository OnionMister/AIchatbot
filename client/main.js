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
// form.addEventListener('keyup', (e) => {
//     if (e.code === 'Enter') {
//         handleSubmit(e);
//     }
// });