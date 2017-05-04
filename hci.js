$(document).keypress(function(e) {
    // console.log(e.keyCode);
    // 'J' StarRing Attack!
    if (e.keyCode == 106) {
        G.StarRing.laserAttack();
    } if (e.keyCode == 118) {
        // V 切换游戏视角，第一人称或第三人称
        G.gameView = (G.gameView == 1) ? 3: 1;
    }
});
$(document).keydown(function(e) {
    // 星环号控制中心（STARRING COMMAND CENTER）
    // console.log(e.keyCode);
    switch(e.keyCode) {
        // W
        case (87):
            G.StarRing.moveForward();
            break;
        // S
        case (83):
            G.StarRing.holdAction();
            break;
        // A
        case (65):
            G.StarRing.turnLeft();
            break;
        // D
        case (68):
            G.StarRing.turnRight();
            break;
        // Q
        case (81):
            G.StarRing.leanLeft();
            break;
        // E
        case (69):
            G.StarRing.leanRight();
            break;
        // I
        case (73):
            G.StarRing.rise();
            break;
        // O
        case (79):
            G.StarRing.fall();
            break;
        default:
            break;
    }
});
$(document).keyup(function(e) {
    switch(e.keyCode) {
        // W
        case (87):
            G.StarRing.holdAction(0);
            break;
        // S
        case (83):
            G.StarRing.holdAction();
            break;
        // A
        case (65):
            G.StarRing.holdAction(1);
            break;
        // D
        case (68):
            G.StarRing.holdAction(1);
            break;
        // Q
        case (81):
            G.StarRing.holdAction(2);
            break;
        // E
        case (69):
            G.StarRing.holdAction(2);
            break;
        // I
        case (73):
            G.StarRing.holdAction(3);
            break;
        // O
        case (79):
            G.StarRing.holdAction(3);
            break;
        default:
            break;
    }
});