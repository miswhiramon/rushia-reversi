let board = [//1:white,2:black
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
let turn = 1;//対戦のターン,1:プレイヤー,2:CPU
let s = 50;
let col;//列
let row;//行
let kururi = 0;//石が置けるか、0:石が置けない場所,1以上:石を置くと相手の石を挟める
let count = 60;//残りの打てる手数
let white = 0;//白石の数
let black = 0;//黒石の数
let flipCount = 0;//ひっくり返せる場所の数
let isAngry =0;
let currentWhite=0;
let currentBlack=0;
let patience=0;

//画面の初期設定
function setup() {
    createCanvas(400, 400);

    textSize(32);
}

//定期的に実行
function draw() {
    background(0, 140, 0);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            line(j * 50, 0, j * 50, height);
            line(0, i * 50, width, i * 50);
            //ボードの数字が１のときは白、２の時は黒が置かれる様にしてみましょう。
            if (board[i][j] == 1) {
                fill(255);
                ellipse(i * 50 + 25, j * 50 + 25, 40, 40);//円を書く
            }
            if (board[i][j] == 2) {
                fill(0);
                ellipse(i * 50 + 25, j * 50 + 25, 40, 40);//円を書く
            }
        }
    }

    if (count == 0) {//対戦結果の表示
        result();
    }

    if (turn == 2) {//CPU側が手を打つ
        //もう少し弱くする必要があるかもしれない
        let countR = [];
        let countC = [];
        let countFlip = [];
        let Max=100000;
        let minFlip=Max;
        let rC = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (getpos(i, j) == 0) {//石がない場所
                    check(i, j);//石が取れる場所を探索する
                    if (flipCount == 0) {//石が取れる場所が無かった場合
                        board[row][col] = 0;
                    } else {//石が取れる場所がある場合
                        //石が置ける場所を記録する。
                        rC++;
                        countR[rC] = row;
                        countC[rC] = col;
                        countFlip[rC] = flipCount;
                        board[countR[rC]][countC[rC]] = 0;
                        //print(countR[rC], countC[rC]);
                        if(flipCount<minFlip) minFlip=flipCount;
                    }
                }
            }
        }
        //print(rC);
        let choice;
        //ランダムではなくCPUを弱くするためにとれる石の数が最小の手を常に選ぶようにした
        for (let i=1;i<rC;i++){
            if(countFlip[i]==minFlip){
                choice = i;
                break;
            }
        }
        //置ける盤面からランダムに選択する,1以上rC未満
        if(minFlip==Max) choice = int(random(1, rC));
        print("minFlip:",minFlip,"countFlip[choice]:",countFlip[choice]);
        reverseC(countR[choice], countC[choice]);//黒に置き換え
        count_each();//black,whiteをカウント
        if(currentWhite>currentBlack){
            patience++;
        }else{
            if(patience>0) patience--;
        }
        if (patience==0){
            print("Rushia Normal.");
        }else if(patience==1){
            print("Rushia slightly angly.");
        }else if(patience==2){
            print("Rushia Angry!")
        }else if(patience>=3){
            print("Rushia Daipan!")
            patience=0;
        }
        print("patience:",patience);
    }
}


//指定位置row,columnを2:黒に置き換える
//置き換えたのち黒で挟める石をひっくり返す
function reverseC(ro, co) {
    board[ro][co] = 2;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            searchReverse(ro, co, i, j);
        }
    }
    count--;//残りの総手数を減らす
    turn = 1;//プレイヤーのターン
}

//石が置けるかチェックする関数
function check(r, c) {
    row = r;
    col = c;
    kururi = 0;
    flipCount = 0;//ひっくり返せる場所の数を初期化
    board[row][col] = 2;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            checkReverse(row, col, i, j);
        }
    }
}

//盤面指定位置の石の色を返す,白:1,黒:2,空:0
function getpos(x, y) {
    let xin = x >= 0 && x < 8;
    let yin = y >= 0 && y < 8;
    if (xin && yin) {
        return board[x][y];
    } else {
        return 0;
    }
}

//盤面指定位置の石の色をnumにセットする
function setpos(x, y, num) {
    let xin = x >= 0 && x < 8;
    let yin = y >= 0 && y < 8;
    if (xin && yin) {
        board[x][y] = num;
    }
}

//石が打てるか(挟めるか)をチェックする関数
function checkReverse(x, y, vx, vy) {
    let state = getpos(x, y);
    let Opponent;
    if (state == 1) {
        Opponent = 2;
    } else {
        Opponent = 1;
    }
    let hit = false;
    let step = 0;//計何回移動したか
    let stepx = x + vx;//x軸方向の移動量,-1,0,1を加算したx座標
    let stepy = y + vy;//y軸方向の移動量,-1,0,1を加算したy座標
    while (!hit) {
        if (getpos(stepx, stepy) == 0) {//移動先に石が無かった場合
            hit = true;
        }

        if (getpos(stepx, stepy) == Opponent) {//相手の石の色であれば
            stepx += vx;//x方向の総移動距離
            stepy += vy;//y方向の総移動距離
            step++;//移動総数を加算する
        }
        if (step == 0) {
            if (getpos(stepx, stepy) == state) {//移動量ゼロで移動先が自分の石の色であれば
                hit = true;
            }
        }
        if (step >= 1) {//移動量が1以上
            if (getpos(stepx, stepy) == state) {//相手の石を自分の石で挟める場合
                hit = true;
                kururi++;//挟めるか
                for (let i = 0; i < step; i++) {
                    flipCount++;//何枚挟めるか
                }
            }
        }
    }
}



//裏返せる場所(挟める部分)を探して裏返す
function searchReverse(x, y, vx, vy) {//vx,vyは-1,0,1の中から選ばれる
    let state = getpos(x, y);//x,yでの石の色
    let Opponent;
    if (state == 1) {//x,yの石の色がwhite
        Opponent = 2;
    } else {//x,yの石の色がblackまたは空
        Opponent = 1;
    }
    let hit = false;
    let step = 0;//計何回移動したか
    let stepx = x + vx;//x軸方向の移動量,-1,0,1を加算したx座標
    let stepy = y + vy;//y軸方向の移動量,-1,0,1を加算したy座標
    while (!hit) {
        if (getpos(stepx, stepy) == 0) {//移動先に石が無かった場合
            hit = true;
        }

        if (getpos(stepx, stepy) == Opponent) {//相手の石の色であれば
            stepx += vx;//x方向の総移動距離
            stepy += vy;//y方向の総移動距離
            step++;//移動総数を加算する
        }
        if (step == 0) {
            if (getpos(stepx, stepy) == state) {//移動量ゼロで移動先が自分の石の色であれば
                hit = true;
            }
        }
        if (step >= 1) {//移動量が1以上
            if (getpos(stepx, stepy) == state) {//相手の石を自分の石で挟める場合
                hit = true;
                kururi++;
                let fillx = stepx;
                let filly = stepy;
                for (let i = 0; i < step; i++) {
                    fillx -= vx;
                    filly -= vy;
                    setpos(fillx, filly, state);//盤面指定位置の石の色をstateにセット
                }
            }
        }
    }
}

//マウスで押された盤面の場所を白石に置き換える
////盤外を押したときの例外処理が必要
function mousePressed() {
    row = floor(mouseX / s);
    col = floor(mouseY / s);
    if (getpos(row, col) == 0) {//まだ石が置かれていない場所であれば
        if (turn == 1) {//プレイヤーのターン
            kururi = 0;
            board[row][col] = 1;//白石を置く

            for (let i = -1; i < 2; i++) {//x方向の移動量,-1,0,1
                for (let j = -1; j < 2; j++) {//y方向の移動量,-1,0,1
                    searchReverse(row, col, i, j);
                }
            }
            turn = 2;//次はCPUのターン

            if (kururi == 0) {//ひっくり返せる石が無かった場合はそもそも石を置くことができない
                //print("KURURI CALL")
                board[row][col] = 0;
                turn = 1;//石が置けなかったのでまたプレイヤー1のターン
                count++;//残り手数は元に戻される
            }
            count--;//残りの総手数を減らす

        } else if (turn == 2) {
            kururi = 0;
            board[row][col] = 2;

            for (let i = -1; i < 2; i++) {//x方向の移動量,-1,0,1
                for (let j = -1; j < 2; j++) {//y方向の移動量,-1,0,1
                    searchReverse(row, col, i, j);
                }
            }
            turn = 1;
            if (kururi == 0) {
                board[row][col] = 0;
                turn = 2;
                count++;
            }
            count--;//残りの総手数を減らす
        }


    }
    count_each();
}

//盤面上の白石と黒石の数をカウントする関数
function count_each(){
    let white=0;
    let black=0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
        let c = getpos(i, j);//i行,j列目の石の色
        if (c == 1) {
            white++;
        } else if (c == 2) {
            black++;
        }
        }
    }
    print("white(you):",white,"black(rushia)",black)
    currentWhite=white;
    currentBlack=black;
}

//対戦結果の表示
function result() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
        let c = getpos(i, j);
        if (c == 1) {
            white++;
        } else if (c == 2) {
            black++;
        }
        }
    }
    if (white > black) {
        fill(255, 0, 0);
        text("White Win!", 120, 200);
    } else {
        fill(255, 0, 0);
        text("Black Win!", 150, 200);
    }
}

function keyPressed() {
    if (key == 's') {
        turn++;
    }
}