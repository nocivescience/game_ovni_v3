const gameEl=document.getElementById('games');
const ctx=gameEl.getContext('2d');
gameEl.width=window.innerWidth;
gameEl.height=window.innerHeight;
const shipSize=30;
const roid_size=50;
const colors=[
    'firebrick',
    'teal',
    'tomato',
    'goldenrod',
    'honeydew',
];
var ship, level, score, roidTotal;
document.addEventListener('keydown',keyDown);
document.addEventListener('keyup',keyUp);
newGame()
setInterval(update,25)
newGame();
function newShip(){
    return {
        x:gameEl.width/2,
        y:gameEl.height/2,
        a: 90/180*Math.PI,
        r:shipSize/2,
        blinkNum:Math.ceil(30),
        blinkTime: Math.ceil(3),
        canShoot:true,
        dead:false,
        explodeTime:0,
        lasers:[],
        rot:0,
        thrusting:false,
        thrust:{
            x:0,
            y:0
        }
    }
}
function newRoid(x,y,r){
    var lvlMult=1+.1*level;
    var roid={
        x,
        y,
        r,
        xv:Math.random()*2*lvlMult*(Math.random()<.5?1:-1),
        yv:Math.random()*2*lvlMult*(Math.random()<.5&&1||-1),
        a:Math.random()*Math.PI*2,
        offs:[],
        vert: Math.floor(Math.random()*(10)<5&&5)
    }
    for(var i=0;i<roid.vert;i++){
        roid.offs.push(
            Math.random()*2
        )
    }
    return roid;
}
function distanceBetween(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
}
function createAsteroidBelt(){
    level=2
    roids=[];
    // roidTotal=3+level*4;
    var x,y;
    for(var i=0;i<3+level;i++){
        do{
            x=Math.floor(Math.random()*gameEl.width);
            y=Math.floor(Math.random()*gameEl.height);
        }while(distanceBetween(ship.x,ship.y,x,y)<roid_size*2+ship.r);
        roids.push(newRoid(x,y,Math.ceil(roid_size*2)))
    }
}
function drawShip(x,y,a,color='white'){
    ctx.strokeStyle=color;
    ctx.lineWidth=shipSize/5;
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(
        x+4/3*ship.r*Math.cos(a),
        y-4/3*ship.r*Math.sin(a)
    );
    ctx.lineTo(
        x-ship.r*(2/3*Math.cos(a)+Math.sin(a)),
        y+ship.r*(2/3*Math.sin(a)-Math.cos(a))
    );
    ctx.lineTo(
        x-ship.r*(2/3*Math.cos(a)-Math.sin(a)),
        y+ship.r*(2/3*Math.sin(a)+Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
};
function keyDown(eval){
    switch(eval.key){
        case 'a':
            ship.rot=360/180*Math.PI/30;
            break;
        case 'd':
            ship.rot=-360/180*Math.PI/30;
            break;
        case 'p':
            shootLaser();
            break;
        case 'w':
            ship.thrusting=true;
            break;
    }
}
function keyUp(eval){
    switch(eval.key){
        case 'a':
            ship.rot=0
        case 'd':
            ship.rot=0
        case 'p':
            ship.canShoot=true;
            break;
        case 'w':
            ship.thrusting=false;
            break;
    }
}
function destroyAsteroid(index){
    var x=roids[index].x;
    var y=roids[index].y;
    var r=roids[index].r;
    for(var i=2;i<7;i+=2){
        if(r==Math.ceil(roid_size/i)){
            roids.push(newRoid(x,y,Math.ceil(roid_size/(i*2))));
            roids.push(newRoid(x,y,Math.ceil(roid_size/(i*2))));
            score+=i*100
        }
        if(roids.length==0){
            level++;
            newLevel;
        }
    };
    roids.splice(index,1)
}
function thrustingShip(){
    if(ship.thrusting){
        ship.thrust.x+=.1*Math.cos(ship.a);
        ship.thrust.y-=.1*Math.sin(ship.a);
        ctx.fillStyle='red';
        ctx.strokeStyle='yellow';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(
            ship.x-ship.r*(2/3*Math.cos(ship.a)+.5*Math.sin(ship.a)),
            ship.y+ship.r*(2/3*Math.sin(ship.a)-.5*Math.cos(ship.a))
        );
        ctx.lineTo(
            ship.x-ship.r*(5/3+Math.random()*1.4)*Math.cos(ship.a),
            ship.y+ship.r*(5/3+Math.random()*1.4)*Math.sin(ship.a)
        );
        ctx.lineTo(
            ship.x-ship.r*(2/3*Math.cos(ship.a)-.5*Math.sin(ship.a)),
            ship.y+ship.r*(2/3*Math.sin(ship.a)+.5*Math.cos(ship.a)),
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }else{
        ship.thrust.x-=.01*ship.thrust.x;
        ship.thrust.y-=.01*ship.thrust.y;
    }
    if(ship.x>gameEl.width) ship.x=0;
    if(ship.x<0) ship.x=gameEl.width;
    if(ship.y>gameEl.height) ship.y=0;
    if(ship.y<0) ship.y=gameEl.height;
}
function newLevel(){
    createAsteroidBelt()
}
function drawLaser(){
    for(var i=0;i<ship.lasers.length;i++){
        if(ship.lasers[i].x<0) ship.lasers[i].x=gameEl.width;
        if(ship.lasers[i].x>gameEl.width) ship.lasers[i].x=0;
        if(ship.lasers[i].y<0) ship.lasers[i].y=gameEl.height;
        if(ship.lasers[i].y>gameEl.height) ship.lasers[i].y=0;
        ctx.fillStyle='aqua';
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x,ship.lasers[i].y,10*Math.random()<7?7:10*Math.random(),0,2*Math.PI,true);
        ctx.fill();
    }
}
function shootLaser(){
    if(ship.canShoot&&ship.lasers.length<12){
        ship.lasers.push({
            y: ship.y-3*ship.r*Math.sin(ship.a),
            x: ship.x+3*ship.r*Math.cos(ship.a),
            xv: 40*Math.cos(ship.a)/30,
            yv: -40*Math.sin(ship.a)/30,
            dist: 0,
            explodeTime:0,
        })
    };
    ship.canShoot=false;
}
function newGame(){
    ship=newShip();
    createAsteroidBelt();
}
function update(){
    var exploding=ship.explodeTime>0
    ctx.clearRect(0,0,gameEl.width,gameEl.height);
    var blinkOn=ship.blinkNum%2==0;
    //draw roids
    var a,r,x,y, offs,vert;
    for(var i=0;i<roids.length;i++){
        ctx.fillStyle=colors[i%colors.length]
        ctx.strokeStyle='slategrey';
        ctx.lineWidth=3;
        a=roids[i].a;
        r=roids[i].r;
        x=roids[i].x;
        y=roids[i].y;
        offs=roids[i].offs;
        vert=roids[i].vert;
        ctx.beginPath();
        ctx.moveTo(
            x+r*offs[0]*Math.cos(a),
            y+r*offs[0]*Math.sin(a),
        );
        for(var j=1;j<vert;j++){
            ctx.lineTo(
                x+r*offs[j]*Math.cos(a+j*Math.PI*2/vert),
                y+r*offs[j]*Math.sin(a+j*Math.PI*2/vert),
            )
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
    //move roids
    for(var i=0;i<roids.length;i++){
        roids[i].x+=roids[i].xv;
        roids[i].y+=roids[i].yv;
        if(roids[i].x>gameEl.width+roids[i].r){
            roids[i].x=0;
        }else if(roids[i].x<-roids[i].r){
            roids[i].x=gameEl.width;
        }else if(roids[i].y<-roids[i].r){
            roids[i].y=gameEl.height;
        }
        else if(roids[i].y>gameEl.height+roids[i].r){
            roids[i].y=0;
        }
    }
    //draw ship 
    drawShip(ship.x,ship.y,ship.a);
    drawLaser();
    thrustingShip();
    ship.a+=ship.rot
    ship.x+=ship.thrust.x;
    ship.y+=ship.thrust.y;
    for(var i=ship.lasers.length-1;i>=0;i--){
        if(ship.lasers[i].dist>gameEl.width/10){
            ship.lasers.splice(i,1);
            continue;
        }
        if(!exploding){
            ship.lasers[i].x+=ship.lasers[i].xv*3;
            ship.lasers[i].y+=ship.lasers[i].yv*3;
            ship.lasers[i].dist+=Math.sqrt(Math.pow(ship.lasers[i].xv,2)+Math.pow(ship.lasers[i].yv,2)) 
        }else{
            ship.explodeTime--;
        }
    }
}