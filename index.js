//var spin = require('diceroll2019');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var playerCredit = 500;
var playerName = 'Domenico';
var numbers = new Array();
var bets = new Array();

var roulette = new Array(37);
var colorSlot = [{
    PASSE: {
        0: 'GREEN', 1: 'RED', 2: 'BLACK', 3: 'RED', 4: 'BLACK', 5: 'RED', 6: 'BLACK', 7: 'RED', 8: 'BLACK', 9: 'RED', 
        10: 'BLACK', 11: 'BLACK', 12: 'RED', 13: 'BLACK', 14: 'RED', 15: 'BLACK', 16: 'RED', 17: 'BLACK', 18: 'RED'
    }, 
    MANQUE: {
        19: 'RED', 20: 'BLACK', 21: 'RED', 22: 'BLACK', 23: 'RED', 24: 'BLACK', 25: 'RED', 26: 'BLACK', 27: 'RED', 
        28: 'BLACK', 29: 'BLACK', 30: 'RED', 31: 'BLACK', 32: 'RED', 33: 'BLACK', 34: 'RED', 35: 'BLACK', 36: 'RED'
    }
}];
var red = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
var black = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
var passe = new Array(18);
var manque = new Array(18);
var bankCredit;
var spinValue;
var manqueNumbers = 19;

function game(credit) {
    bankCredit = credit;
    for (var i = 0; i < roulette.length; i ++){
        roulette[i] = i;
    }
    for (var i = 0; i< passe.length; i ++){
        passe[i] = i+1;
    }
    for (var i = 0; i< manque.length; i ++){
        manque[i] = manqueNumbers;
        manqueNumbers ++;
    }
}
game(1000); //to initialize arrays

function clearArrays(){
    numbers.pop();
    bets.pop();
}

function spin(){
    var spin = Math.floor(Math.random() * 36);
    return spin;
}

function reset(pCredit, bCredit){
    playerCredit = pCredit;
    if(bCredit == undefined){
        return 'Player credit added';
    } else {
        bankCredit = bCredit;
    }
    return 'Added both player and bank credit';
}

function betNumbers(number, bet){
    clearArrays();
    numbers.push(number);
    bets.push(bet);
    for (var i=0; i< numbers.length; i++){
        if (playerCredit < bets[i]) {
            return 'Unsufficient Money';
        }
        playerCredit -= bets[i];
        bankCredit += bets[i];
        spinValue = spin();
        if (spinValue == numbers[i]){
            if (numbers.length ==1 ) {
                bankCredit -= bets[i] + (bets[i] * 35);
                playerCredit = bets[i] + (bets[i] * 35); // if win, player win your bets plus 35 times the bets
            } else if (numbers.length == 2){
                bankCredit -= bets[i] + (bets[i] * 17);
                playerCredit = bets[i] + (bets[i] * 17);
            } else if (numbers.length == 3){
                bankCredit -= bets[i] + (bets[i] * 11);
                playerCredit = bets[i] + (bets[i] * 11);
            } else if (numbers.length == 6){
                bankCredit -= bets[i] + (bets[i] * 5);
                playerCredit = bets[i] + (bets[i] * 5);
            } else if (numbers.length == 12){
                bankCredit -= bets[i] + (bets[i] * 2);
                playerCredit = bets[i] + (bets[i] * 2);
            }
            return playerName + ' win';
        }
    }
    return 'Bank win';
}

function betSlot(bet, rouletteSlot){
    clearArrays();
    if (playerCredit < bet) {
        return 'Unsufficient money';
    } else {
        bets.push(bet);
    }
    playerCredit -= bets[0];
    bankCredit += bets[0];
    spinValue = spin();
    for (var i=0; i < red.length; i++) {
        if (((spinValue == red[i]) && (rouletteSlot == 'RED'))|| ((spinValue == black[i]) && (rouletteSlot == 'BLACK')) || 
        ((spinValue == passe[i]) && (rouletteSlot == 'PASSE')) || ((spinValue == manque[i]) && (rouletteSlot == 'MANQUE')) ||
        (((spinValue % 2) == 0) && (rouletteSlot == 'EVEN')) || (((spinValue % 2) != 0) && (rouletteSlot == 'ODD'))){
            bankCredit -= (bets[0] * 2);
            playerCredit += (bets[0] * 2);
            return playerName + ' win'
        }
    }
    return playerName + ' lose';
}

app.get('/resetGame/:pCredit', function(req, res){
    if(isNaN(req.params.pCredit)){
        res.status(400).json({message: 'Invalid params'})
    } else if(req.query.bCredit){
        res.send(reset(Number(req.params.pCredit), Number(req.query.bCredit)));
    } else {
        res.send(reset(Number(req.params.pCredit)));
    }
})

app.get('/betNumbers/:number/:bet', function(req,res){
    if(isNaN(req.params.number) && isNaN(req.params.bet)){
        res.status(400).json({message: 'Invalid params'});
        return;
    }
    res.json({
        result: betNumbers(Number(req.params.number), Number(req.params.bet)), 
        Spin: spinValue,
        PlayerCredit: Number(playerCredit) + ' €', 
        BankCredit: Number(bankCredit) + ' €'
    });
})

app.get('/betOnSlot/:bet/:slot', function(req, res){
    if(isNaN(req.params.bet) && !isNaN(req.params.slot)){
        res.status(400).json({message: 'Invalid params'});
        return;
    }
    res.json({
            result: betSlot(Number(req.params.bet), req.params.slot),
            Spin: spinValue,
            colorSlot,
            PlayerCredit: Number(playerCredit) + ' €', 
            BankCredit: Number(bankCredit) + ' €'
        });
});

app.listen(3003);