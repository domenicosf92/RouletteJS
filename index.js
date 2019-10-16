var spin = require('diceroll2019');
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
var red = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
var black = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
var passe = new Array(18);
var manque = new Array(18);
var bankCredit;
var spinValue;
var manqueNumbers = 19;
var Slot = {
    GREEN: 'green',
    RED: 'red',
    BLACK: 'black',
    EVEN: 'even',
    ODD: 'odd',
    PASSE: 'passe',
    MANQUE: 'manque'
}

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

function reset(pCredit, bCredit){
    playerCredit = pCredit;
    if(bCredit == undefined){
        return 'Player credit added';
    } else {
        bankCredit = bCredit;
    }
    return 'Added both player and bank credit';
}

function betNumbers(number, bet, numberOfBets){
    clearArrays();
    for(var i = 0; i < numberOfBets; i++){
        numbers.push(number);
        bets.push(bet);
    }
    for (var i=0; i< numbers.length; i++){
        if (playerCredit < bets[i]) {
            return 'Unsufficient Money';
        }
        playerCredit -= bets[i];
        bankCredit += bets[i];
        spinValue = spin.dicesRoll(1,36);
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

function betColor(bet, rouletteSlot){
    clearArrays();
    if (playerCredit < bet) {
        return 'Unsufficient money';
    } else {
        bets.push(bet);
    }
    playerCredit -= bets[0];
    bankCredit += bets[0];
    spinValue = spin.dicesRoll(1,36);
    for (var i=0; i < red.length; i++) {
        if ((spinValue == red[i]) && (rouletteSlot == Slot.RED)){ //
            bankCredit -= (bets[0] * 2);
            playerCredit += (bets[0] * 2);
            return playerName + ' win';
        }
        if ((spinValue == black[i]) && (rouletteSlot == Slot.BLACK)){
            bankCredit -= (bets[0] * 2);
            playerCredit += (bets[0] * 2);
            return playerName + ' win';
        }
    }
    return 'Bank win';
}

function betPasseManque(bet, rouletteSlot){
    clearArrays();
    if (playerCredit < bet) {
        return 'Unsufficient money';
    } else {
        bets.push(bet);
    }
    playerCredit -= bets[0];
    bankCredit += bets[0];
    spinValue = spin.dicesRoll(1,36);
    for (var i=0; i< passe.length; i++) {
        if (((spinValue == passe[i]) && (rouletteSlot == Slot.PASSE)) || ((spinValue == manque[i]) && (rouletteSlot == Slot.MANQUE))){
            bankCredit -= bets[0] + bets[0];
            playerCredit += (bets[0] + bets[0]);
            return playerName + ' win';
        }
    }
    return 'Bank win';
}

function betEvenOdd(bet, rouletteSlot){
    clearArrays();
    if (playerCredit < bet) {
        return 'Unsufficient money';
    } else {
        bets.push(bet);
    }
    playerCredit -= bets[0];
    bankCredit += bets[0];
    spinValue = spin.dicesRoll(1,36);
    if ((((spinValue % 2) == 0) && (rouletteSlot == Slot.EVEN)) || (((spinValue % 2) != 0) && (rouletteSlot == Slot.ODD))) {
        bankCredit -= (bets[0] + bets[0]);
        playerCredit += (bets[0] + bets[0]);
        return playerName + ' win';
    }
    return 'Bank win';
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

app.get('/betNumbers/:number/:bet/:numberOfBets', function(req,res){
    if(isNaN(req.params.number) && isNaN(req.params.bet) && isNaN(req.params.numberOfBets)){
        res.status(400).json({message: 'Invalid params'});
        return;
    }
    res.json({
        result: betNumbers(Number(req.params.number), Number(req.params.bet), Number(req.params.numberOfBets)), 
        Spin: spinValue,
        PlayerCredit: playerCredit + ' €', 
        BankCredit: bankCredit + ' €'
    });
})

app.get('/betOnSlot/:bet/:slot', function(req, res){
    if(isNaN(req.params.bet) && !isNaN(req.params.slot)){
        res.status(400).json({message: 'Invalid params'});
        return;
    }
    if(req.params.slot == 'red' || req.params.slot == 'black'){
        res.json({
            result: betColor(Number(req.params.bet), req.params.slot),
            Spin: spinValue,
            PlayerCredit: playerCredit + ' €', 
            BankCredit: bankCredit + ' €'
        });
    } else if(req.params.slot == 'passe' || req.params.slot == 'manque'){
        res.json({
            result: betPasseManque(Number(req.params.bet), req.params.slot),
            Spin: spinValue,
            PlayerCredit: playerCredit + ' €', 
            BankCredit: bankCredit + ' €'
        });
    } else if(req.params.slot == 'even' || req.params.slot == 'odd'){
        res.json({
            result: betEvenOdd(Number(req.params.bet), req.params.slot),
            Spin: spinValue,
            PlayerCredit: playerCredit + ' €', 
            BankCredit: bankCredit + ' €'
        });
    }
})

app.listen(3001);