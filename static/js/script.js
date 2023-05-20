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

$(document).ready(function() {
    // console.log('start');
    showMenu();
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

    console.log(title);
    console.log(files);

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
            window.location.reload();
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

function getSelectedImages() {
    var imageInput = document.getElementById('imageInput');
    var selectedImages = imageInput.files;
  
    // Melakukan iterasi pada setiap file yang dipilih
    for (var i = 0; i < selectedImages.length; i++) {
      var file = selectedImages[i];
      
      // Mengakses informasi file
      console.log('Nama File:', file.name);
      console.log('Tipe File:', file.type);
      console.log('Ukuran File:', file.size, 'byte');
      console.log('Terakhir Diubah:', file.lastModifiedDate);
    }
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