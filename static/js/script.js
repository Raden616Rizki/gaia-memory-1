const cards = document.querySelectorAll('.card');

let menu = "gems";

let matchedCard = 0;
let cardOne, cardTwo;
let disableDeck = false;
let flipCount = 0;

// get Music Background
const music = document.getElementById('bg-music');

// get sound effects
const match = new Audio("../../static/music/matched-card.mp3");
const notMatch = new Audio("../../static/music/not-matched-card.wav");
const complete = new Audio("../../static/music/complete-game.wav");
const chatSound = new Audio("../../static/music/chat.mp3")

const animalList = ['anoa', 'bekantan', 'cicak', 'dugong', 'elang', 'flaktivus', 'gajah', 'harimau', 'iguana', 'jaguar', 'kalong', 'merak', 'nyambek', 'orangutan', 'penyu', 'quda', 'rusa', 'sriti', 'tuna', 'vinguin', 'walrus', 'xigung', 'yuyu', 'zebra'];

const wordList = ['bersin', 'berdasi', 'cantik', 'cengeng', 'galau', 'jomblo', 'ketawa', 'lompat', 'lari', 'nangis', 'panik', 'pingsan', 'qlilipan', 'rindu', 'solutip', 'setia', 'skiding', 'terbang', 'uzur', 'xixi', 'nyantai', 'woles'];

// let expirationDate = new Date();
// expirationDate.setTime(expirationDate.getTime() + (60 * 60 * 1000));
let username = 'anonim404';

let inputUsername = document.getElementById('username');
let inputChat = document.getElementById('chat');

inputUsername.addEventListener('keydown', function(event) {
    // console.log(event);
    if (event.key === 'Enter') {
        saveUsername();
    }
});

inputChat.addEventListener('keydown', function(event) {
    // console.log(event);
    if (event.key === 'Enter') {
        sendChat();
    }
});

$(document).ready(function() {
    // console.log('start');
    showMenu();
    if (isCookieEmpty()) {
        username = getRandomUsername(animalList, wordList);
        document.cookie = "username=" + username;
    } else {
        username = getCookieValue();
    }

    showUsername();
    // scrollToBottom();
    showChat();
    getLeaderboard();
    setInterval(function() {
        receiveChat();
    }, 20000);
    // setInterval(function() {
    //     showChat();
    // }, 2000);
    // for (var i = 0; i < 2; i++) {
    //     showChat();
    // }
    // refreshContent();
    // setInterval(refreshContent, 1000);
});

function flipCard(e) {
    // play music
    music.play();

    // startTimer
    if (!isTimeRunning) {
        startTimer();
    }

    // console.log(e.target);
    let clickedCard = e.target; // getting user clicked card

    if (clickedCard !== cardOne && !disableDeck) {
        clickedCard.classList.add('flip');

        flipCount++;
        document.getElementById('flip').textContent = flipCount;

        if (!cardOne) {
            // return the cardOne value to clickedCard
            return cardOne = clickedCard;
        }
        cardTwo = clickedCard;
        // console.log(cardOne, cardTwo);

        disableDeck = true;

        let cardOneImg = cardOne.querySelector('img').src;
        let cardTwoImg = cardTwo.querySelector('img').src;
        matchCards(cardOneImg, cardTwoImg);
    }
}

function matchCards(img1, img2) {
    // console.log(img1, img2);
    if (img1 == img2) { // if two cards are matching
        // play match sound
        match.play();

        // return console.log('Matched cards');
        matchedCard++; // increment matched value by 1

        if (matchedCard == 8) {
            // play complete sound
            complete.play();

            // Stop time
            stopTimer();
            music.pause();

            var time_now = document.getElementById("time");
            var time = time_now.innerText;
            // console.log(time);
            saveLeaderboard(time);
        }

        cardOne.removeEventListener('click', flipCard);
        cardTwo.removeEventListener('click', flipCard);

        cardOne = cardTwo = ''; // blank value both variables
        return disableDeck = false;
    }
    // play not match sount
    notMatch.play();

    // if two card not matched
    setTimeout(() => {

        // adding shake class both card after 400ms
        cardOne.classList.add('shake');
        cardTwo.classList.add('shake');
    }, 400);

    // remove both class (shake and flip) after 1200 ms if two card not matched
    setTimeout(() => {
        // adding shake class both card after 400ms
        cardOne.classList.remove('shake', 'flip');
        cardTwo.classList.remove('shake', 'flip');

        cardOne = cardTwo = ''; // blank value both variables

        disableDeck = false;
    }, 1200);
}

function refreshGame() {
    music.pause();
    setTimeout(() => {
        return shuffleCard();
    }, 500);
}

function shuffleCard() {

    flipCount = 0;
    document.getElementById('flip').textContent = flipCount;

    matchedCard = 0;
    cardOne = cardTwo = '';

    disableDeck = false;

    // creating array of 16 items and each item is repeated twice
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];

    arr.sort(() => Math.random() > 0.5 ? 1 : -1); // sorting array item randomly

    // removing flip class from all cards and passing random image to each card
    cards.forEach((card, index) => {
        card.classList.remove('flip');
        let imgTag = card.querySelector("img");
        imgTag.src = `../static/images/${menu}/img-${arr[index]}.png`;
        card.addEventListener('click', flipCard);
    });
}

// Change menu value
function changeMenu(theme) {
    menu = theme;
    // console.log(menu);
    shuffleCard();
    resetTimer();
}

function openForm() {
    $('#form-add').css('display', 'block');
    $('.add').css('display', 'none');
    $('.close').css('display', 'block');
}

function closeForm() {
    $('#form-add').css('display', 'none');
    $('.add').css('display', 'block');
    $('.close').css('display', 'none');
}

function addCard() {
    let title = $('#title').val();
    let files = $('#images').prop('files');

    // console.log(title);
    // console.log(files);

    if (!title) {
        return alert('Title is Required!!!');
    }

    if (files.length < 8) {
        return alert('Images are Required!!!, Need 8 Images');
    } else if (files.length > 8) {
        return alert('Images are full!!!, Just Need 8 Images');
    }

    let form_data = new FormData();
    form_data.append('title', title);

    for (let i = 1; i <= files.length; i++) {
        form_data.append(`img-${i}`, files[i-1]);
    }

    $.ajax({
        type: 'POST',
        url: '/add-card',
        data: form_data,
        contentType: false,
        processData: false,
        success: function (response) {
            // window.location.reload();
            showMenu();
            alert(response.message);
        }
    });
}

function showMenu() {
    $.ajax({
        type: 'GET',
        url: '/show-menu',
        data: {},
        success: function (response) {
            let menu = response['menu'];
            // console.log(menu[0]['title']);
            // console.log(menu.title);

            for (let i = 0; i < menu.length; i++) {
                let title = menu[i]['title'];

                let temp_html = `
                <tr onclick="changeMenu('${title}')">
                    <td><img src="../static/images/${title}/img-1.png"  id="image-menu"></td>
                    <td id="menu-text">${title}</td>
                </tr>
                `;

                $('#table-menu').append(temp_html);
            }
        }
    });
}

function editUsername() {
    $('#username-column').css('display', 'flex');
    $('#edit-username').css('display', 'none');
}

function closeUsername() {
    $('#username-column').css('display', 'none');
    $('#edit-username').css('display', 'block');
}

function saveUsername() {
    var user = $('#username').val();

    // console.log(username);

    if (!user) {
        return alert('Username is Required!!!');
    }

    username = user;
    document.cookie = "username=" + username;

    let form_data = new FormData();
    form_data.append('username', username);
    closeUsername()

    $.ajax({
        type: 'POST',
        url: '/save-username',
        data: form_data,
        contentType: false,
        processData: false,
        success: function (response) {
            // window.location.reload();
            showUsername();
            alert(response.message);
        }
    });
}

function showUsername() {
    document.getElementById("edit-username").textContent = username;
    // let user;
    // $.ajax({
    //     type: 'GET',
    //     url: '/get-cookies',
    //     data: {},
    //     success: function (response) {
    //         let cookies = response['cookies'];
    //         // console.log(cookies);
    //         let usernamePlayer = cookies['username'];
    //         // console.log(usernamePlayer);
    //         var username = usernamePlayer;
    //         // console.log(username);
    //         document.getElementById("edit-username").textContent = username;
    //     }
    // });
    // var xhr = new XMLHttpRequest();
    // xhr.open('GET', '/get-cookies', true);

    // xhr.onload = function() {
    //     if (xhr.status === 200) {
    //         userName = JSON.parse(xhr.responseText)['cookies']['username'];
    //         // console.log(userName);
    //         document.getElementById("edit-username").textContent = userName;
    //     }
    // }
    // xhr.send();
    // fetch('/get-cookies')
    // .then(response => response.json())
    // .then(data => {
    //     user = data['cookies']['username']
    //     console.log(user);
    // })
    // .catch(error => {
    //     console.error('404 not found');
    // });
    // console.log(user);
}

function startChat() {
    $('.new-chat').css('display', 'none');
    $('#form-chat').css('display', 'block');
    $('#close-form-chat').css('display', 'block');
}

function closeChat() {
    $('.new-chat').css('display', 'block');
    $('#form-chat').css('display', 'none');
    $('#close-form-chat').css('display', 'none');
}

function sendChat() {
    var chat = $('#chat').val();

    if (!chat) {
        alert("Do you have keyboard?");
        return;
    }

    closeChat();

    // console.log(chat);
    let form_data = new FormData();
    form_data.append('sender', username);
    form_data.append('chat', chat);

    $.ajax({
        type: 'POST',
        url: '/send-chat',
        data: form_data,
        contentType: false,
        processData: false,
        success: function (response) {
            // window.location.reload();
            // showChat();
            showChat();
            chatSound.play();
            scrollToBottom();
        }
    });
}

function showChat() {
    $.ajax({
        type: 'GET',
        url: '/get-chat',
        data: {},
        success: function (response) {
            let chat = response['chat'];
            // let userNow = response['user_now'];
            // console.log(chat);
            const default_html = `
            <li>
                <p><b>> testoater1</b> <i>2023-05-20 23:12:01</i></p>
                <span class="chat-content">
                    Welcome to Gaia Memory 1   
                </span>
            </li>
            `;
            $('.chat').html(default_html);

            for (let i = 0; i < chat.length; i++) {

                let sender = chat[i]['sender'];
                let time = chat[i]['time'];
                let chatContent = chat[i]['chat'];
                // console.log(userNow, sender)
                // if (userNow == sender) {
                //     $('.chat span').css('border-radius', '4px 0px 4px 4px');
                // } else {
                //     $('.chat span').css('border-radius', '0px 4px 4px 4px');
                // }

                addNewChat(sender, time, chatContent);
            }
            scrollToBottom();
        }
    });
}

function receiveChat() {
    $.ajax({
        type: 'GET',
        url: '/new-chat',
        data: {},
        success: function (response) {
            var new_chat = response['new_chat'];
            // console.log(new_chat);
            if (new_chat) {
                var sender = new_chat['sender']
                var time = new_chat['time'];
                var chatContent = new_chat['chat'];
                addNewChat(sender, time, chatContent);
                scrollToBottom();
                chatSound.play();
            }
        }
    });
}

function addNewChat(sender, time, chatContent) {
    let temp_html = `
        <li>
            <p><b>> ${sender}</b> <i>${time}</i></p>
            <span class="chat-content">
                ${chatContent} 
            </span>
        </li>
    `;

    $('.chat').append(temp_html);
}

function scrollToBottom() {
    var chat = $('.chat-space');
    var list = $('.chat');

    chat.scrollTop(list.height());
}

function getRandomUsername(animal, word) {
    var randomIndexAnimal = Math.floor(Math.random() * animal.length);
    var randomIndexWord = Math.floor(Math.random() * word.length);
    var randomAnimal = animal[randomIndexAnimal];
    var randomWord = word[randomIndexWord];
    var min = 1;
    var max = 16;
    var randomNumber = Math.random() * (max - min) + min;
    randomNumber = Math.round(randomNumber);
    var username = randomAnimal + '_' + randomWord + '_' + randomNumber;
    // console.log(username);
    return username;
}

function isCookieEmpty() {
    var result = document.cookie.trim() === '';
    // console.log(result);
    return result;
}

function getCookieValue() {
    var cookie = document.cookie;
    var cookies = cookie.split('=');
    var value = cookies[1];
    return value;
}

function saveLeaderboard(time) {
    if (time === '0') {
        return alert('sorry, something went wrong')
    }

    let form_data = new FormData();
    form_data.append('user', username);
    form_data.append('menu', menu);
    form_data.append('time', time);
    form_data.append('flip', flipCount);

    $.ajax({
        type: 'POST',
        url: '/save-leaderboard',
        data: form_data,
        contentType: false,
        processData: false,
        success: function (response) {
            getLeaderboard();
        }
    });
}

function getLeaderboard() {
    $.ajax({
        type: 'GET',
        url: '/get-leaderboard',
        data: {},
        success: function (response) {
            var leaderboard = response['leaderboard'];
            // console.log(leaderboard);

            const default_html = ``;
            $('#table-leaderboard').html(default_html);

            for (let i = 0; i < leaderboard.length; i++) {
                var rank = i + 1
                var user = leaderboard[i]['user'];
                var menu = leaderboard[i]['menu'];
                var time = leaderboard[i]['time'];
                var flip = leaderboard[i]['flip'];
                var color = '#f8f8f8'

                if (rank == 1) {
                    // console.log('gold');
                    color = 'gold';
                    // $('#table-leaderboard td').css('background-color', 'gold');
                } else if (rank == 2) {
                    // console.log('silver');
                    color = 'silver';
                    // $('#table-leaderboard td').css('background-color', 'silver');
                } else if (rank == 3) {
                    // console.log('bronze');
                    color = '#CD7F32';
                    // $('#table-leaderboard td').css('background-color', '#CD7F32');
                }

                let temp_html = `
                    <tr>
                        <td id="rank" style="background: ${color};"><span>${rank}</span></td>
                        <td id="image-rank" style="background: ${color};"><img src="../static/images/${menu}/img-1.png"></td>
                        <td id="user-record" style="background: ${color};"><span>${user}</span></td>
                        <td id="skor" style="background: ${color};"><span>${time}</span></td>
                        <td id="skor" style="background: ${color};"><span>${flip}</span></td>
                    </tr>
                `;
                // console.log(temp_html);

                $('#table-leaderboard').append(temp_html);
            }
        }
    });
}

// Timer
let startTime;
let timerInterval;
let isTimeRunning = false;

function startTimer() {
    isTimeRunning = true;
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 10);
}

function stopTimer() {
    isTimeRunning = false;
    clearInterval(timerInterval);

}

function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById("time").textContent = "0";
}

function updateTimer() {
    let formattedTime = "0";

    let currentTime = new Date().getTime();
    let elapsedTime = currentTime - startTime;

    let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    let minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((elapsedTime % (1000 * 60) / 1000));

    if (hours !== 0) {
        formattedTime = hours + ":" + minutes + ":" + seconds;
    } else if (minutes !== 0) {
        formattedTime = minutes + ":" + seconds;
    } else {
        formattedTime = seconds;
    }

    document.getElementById("time").textContent = formattedTime;
}

document.getElementById("start-time").addEventListener("click", resetTimer);

// Shuffle Card
shuffleCard();

cards.forEach(card => { // adding click event to all cards
    // card.classList.add('flip');
    card.addEventListener("click", flipCard);
});