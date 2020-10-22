const socket = io('http://localhost:3000');

const messagesArea = document.getElementById('messages-area');
const sendForm = document.getElementById('send-form');
const messageContainer = document.getElementById("message-container");
const currentUsers = document.getElementById('online');

const modal = document.querySelector(".modal-outer");
const userNameInput = document.getElementById('name');
const userNameSubmit = document.querySelector(".modal-button");


//new user
var name
userNameSubmit.addEventListener("click", () => {
    name = userNameInput.value;
    modal.classList.add("remove-modal");
    socket.emit('send-new-user', name, roomName);
});
// let name = prompt('what is your name?');
// while (name == '' || name == null) {
//     name = prompt('please choose a valid name\nwhat is your name?')
// }

socket.on('receive-new-user', (data) => {
    appendMessage(`${data} has joined the chat`);
});

//user disconnects
socket.on('user-disconnect', data => {
    appendMessage(`${data} has left the chat`);
})

//send message
sendForm.addEventListener('submit', e => {
    e.preventDefault();
    message = messageContainer.value;
    socket.emit('message', message, roomName);
    appendMessage(`You: ${message}`)
    messageContainer.value = "";
});

//recieving new message
socket.on('new-message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});

function appendMessage(data) {
    const messageDivElement = document.createElement('div');
    messageDivElement.innerHTML = data;
    messagesArea.append(messageDivElement);
};

//online users
socket.on('update-users', data => {
    currentUsers.innerHTML = "";
    data.forEach(element => {
        if (element != name) {
            const userDivElement = document.createElement('div');
            userDivElement.innerHTML = element;
            currentUsers.append(userDivElement);
        }
    });
});