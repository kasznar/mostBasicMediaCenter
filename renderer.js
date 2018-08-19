// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



//HTML references

var listGroup = document.getElementById('listgroup');


//Event listeners



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

function openSelectedFile() {
    openVideo(listOfStuff[liSelected.index()].absPath);
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
        openSelectedFile();
    }
}

function addEventListeners() {
    li = $('li');
    liSelected = null;
}

$(window).keydown(function(e){
    if(e.which === 40){
        moveDownList();
    }else if(e.which === 38){
        moveUpList();
    }else if(e.which === 13){
        openItem();
    }

    e.preventDefault();
});


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

function pauseMplayer() {
    terminal.stdin.write('pause\n');
}


function openVideo(videoPath) {
    //mplayer fullscreen arg: -fs
    if(!terminal){
        terminal = require('child_process').spawn('mplayer',['-slave','-quiet',videoPath]);
    } else{
        console.log("already opened");
    }

    // output stream from process
    /*
    terminal.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    */

    terminal.on('exit', function (code) {
        console.log('child process exited with code ' + code);
        terminal = null;
    });
}


//Execute

listDirectory('/home/kasznar/Videos');


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
    pauseMplayer();
    res.send('pause');
});

app.get('/open', function (req, res) {
    openItem();
    res.send('open');
});

app.get('/exit', function (req, res) {
    terminal.stdin.write('quit\n');
    terminal.stdin.end();
    res.send('exit');
});

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});



