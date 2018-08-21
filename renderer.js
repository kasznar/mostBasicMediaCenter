// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



//HTML references

var listGroup = document.getElementById('listgroup');
var popUpContent = document.getElementById('pop-up-content');


//Event listeners

var isItRaspberry = "true";

var liSelected;
var li;
var listGroupTop = 0;

function checkPosition() {

    var itemTop = liSelected.offset().top;
    var itemHeight = liSelected.outerHeight();
    var winH = window.innerHeight;

    if(winH < itemTop + itemHeight) {
        listGroupTop -= itemTop + itemHeight - winH;
        $( ".list-group" ).offset({ top: listGroupTop, left: 0 });
    }

    if (0 > liSelected.offset().top) {
        listGroupTop += -itemTop;
        $( ".list-group" ).offset({ top: listGroupTop, left: 0 });

    }

}

function moveDownList() {
    if(liSelected){
        liSelected.removeClass('active');
        next = liSelected.next();
        if(next.length > 0){
            liSelected = next.addClass('active');
        }else{
            liSelected = li.eq(0).addClass('active');
        }
    }else{
        liSelected = li.eq(0).addClass('active');
    }
    checkPosition();
}

function moveUpList() {
    if(liSelected){
        liSelected.removeClass('active');
        next = liSelected.prev();
        if(next.length > 0){
            liSelected = next.addClass('active');
        }else{
            liSelected = li.last().addClass('active');
        }
    }else{
        liSelected = li.last().addClass('active');
    }
    checkPosition();
}



function openItem() {
    const fs = require('fs');
    var selectedPath = listOfStuff[liSelected.index()].absPath;
    if(fs.lstatSync(selectedPath).isDirectory()){
        listDirectory(selectedPath);

        if (liSelected){
            liSelected.removeClass('active');
            liSelected = li.eq(0).addClass('active');
        } else {
            liSelected = li.eq(0).addClass('active');
        }
        checkPosition();
    } else {
        openVideo(listOfStuff[liSelected.index()].absPath);
    }

}

function addEventListeners() {
    li = $('li');
    liSelected = null;
}



$(window).keydown(function(e){
    if(e.which === 40){
        handleInput('down');
        //moveDownList();
    }else if(e.which === 38){
        handleInput('up');
        //moveUpList();
    }else if(e.which === 13){
        handleInput('enter')
        //openItem();
    }else if(e.which === 8){
        handleInput('secondary');
    }

    e.preventDefault();
});







var activeState = 'start'


function handleInput(input) {
    switch (activeState) {
        case 'start':
            switch (input){
                case 'enter':
                    console.log('close start screen');
                    $('#pop-up').fadeOut()
                    activeState = 'fileList';
                    break;
            }
            break;
        case 'fileList':
            switch (input) {
                case 'up':
                    moveUpList();
                    break;
                case 'down':
                    moveDownList()
                    break;
                case 'enter':
                    openItem();
                    break;
                case 'secondary':
                    $('#pop-up').fadeIn();
                    activeState = 'start';
                    break;
            }
            break;
        case 'player':
            switch (input){
                case 'enter':
                    pausePlayer();
                    break;
                case 'secondary':
                    quitPlayer();
                    break;
            }
            break;

        default:
            console.log('There \' no: ' + expr + ' state.');
    }

}





//Global variables

var listOfStuff = [];
var terminal;



function ListItem(title, absPath, itemType){
    this.title = title;
    this.absPath = absPath;
    this.itemType = itemType;
}

function updateListView() {
    listGroup.innerHTML = '';

    listOfStuff.forEach((e)=>{
        var iconHTML = '';

        if(e.itemType == 'folder'){
            iconHTML = '<img src="assets/icons/baseline_folder_white_48dp.png">';
        }

        if(e.itemType == 'back'){
            iconHTML = '<img src="assets/icons/baseline_arrow_back_white_48dp.png">';
        }
        listGroup.innerHTML += '<li class="list-group-item">' + iconHTML + e.title + '</li>';
    })

    addEventListeners();
}

function listDirectory(directoryPath){
    const fs = require('fs');

    listOfStuff = [];

    var path = require('path');
    //Return the directries:
    var parentPath = path.dirname(directoryPath);

    listOfStuff.push(new ListItem('BACK', parentPath, 'back'));

    fs.readdirSync(directoryPath).forEach(file => {
        var itemType = 'file';
        //skip hidden files
        if(file.charAt(0) != "."){
            //check if directory
            if(fs.lstatSync(directoryPath + '/' + file).isDirectory()){
                itemType = 'folder';
            }
            listOfStuff.push(new ListItem(file, directoryPath + '/' + file, itemType));

        }
    });

    updateListView();
}

function quitPlayer() {
    if(isItRaspberry){
        terminal.stdin.write('q');
    }else{
        terminal.stdin.write('quit\n');
    }
    terminal.stdin.end();
}

function pausePlayer() {
    if(isItRaspberry){
        terminal.stdin.write('p');
    }else{
        terminal.stdin.write('pause\n');
    }
}


function openVideo(videoPath) {
    //mplayer fullscreen arg: -fs
    if(!terminal){
        if(isItRaspberry){
            terminal = require('child_process').spawn('omxplayer',[videoPath]);
        }else{
            terminal = require('child_process').spawn('mplayer',['-slave','-fs','-quiet',videoPath]);
        }
    } else{
        console.log("already opened");
    }

    // output stream from process
    terminal.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });


    terminal.on('exit', function (code) {
        console.log('child process exited with code ' + code);
        terminal = null;
        activeState = 'fileList';
        $('#overlay').hide();
    });

    activeState = 'player';
    $('#overlay').show();

}


//Execute

listDirectory('/home/');


//Express Server

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.sendFile(__dirname +'/remote-control/index.html');
});






app.get('/list-down', function (req, res) {
    moveDownList();
    res.send('list-down');
});

app.get('/list-up', function (req, res) {
    moveUpList();
    res.send('list-up');
});

app.get('/pause', function (req, res) {
    pausePlayer();
    res.send('pause');
});

app.get('/open', function (req, res) {
    openItem();
    res.send('open');
});

app.get('/exit', function (req, res) {
    quitPlayer();
    terminal.stdin.end();
    res.send('exit');
});




app.get('/remote-up', function (req, res) {
    handleInput('up');
    res.send('remote up');
});

app.get('/remote-down', function (req, res) {
    handleInput('down');
    res.send('remote down');
});

app.get('/remote-left', function (req, res) {
    handleInput('left');
    res.send('remote left');
});

app.get('/remote-right', function (req, res) {
    handleInput('right');
    res.send('remote right');
});

app.get('/remote-enter', function (req, res) {
    handleInput('enter');
    res.send('remote enter');
});

app.get('/remote-secondary', function (req, res) {
    handleInput('secondary');
    res.send('remote secondary');
});









var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});


getIpAddress();


function getIpAddress() {
    var os = require('os');
    var ifaces = os.networkInterfaces();

    var ipAddress = "";

    console.log(ifaces);

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
                ipAddress = iface.address;
            } else {
                // this interface has only one ipv4 adress
                console.log(ifname, iface.address);
                ipAddress = iface.address;
            }
            ++alias;
        });
    });

    popUpContent.innerHTML = "Visit " + ipAddress + ":" + "8081" + " for remote control";
}



