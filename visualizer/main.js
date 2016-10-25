
var svg=Snap(1500,620);
var count=0;
var span=10;
var time=30;
var num=time/span;
var rectW=0;
var rectH=0;
var rectColE="#e9546b";
var is_play=false;
var showRise=false;
var riseOp=0;
var objects=svg.group();
var count=0;
var is_pause=false;
var exec_speed=1;
var def_speed=exec_speed;
var wait_count=0;
var dataset;
var shadowRep = Snap.filter.shadow(1,1,1,"black",0.5);
var shadow = svg.filter(shadowRep);
var blurRep = Snap.filter.blur(2,2);
var blur = svg.filter(blurRep);
Math.seedrandom("test");
var is_stop=false;

checkExecSpeed();

function update(){
	if(is_return>0){
		is_stop=true;
		checkReturn();
	}
	if(count%exec_speed==0&&is_end==false&&is_read==true&&is_stop==false){
		if(wait_count<=0){
			read();
		}
	}
	if(is_pause==false&&is_read==true&&is_stop==false){
		count++;
	}
	if(wait_count>0){
		wait_count--;
	}
}

document.onkeydown = function (e){
	if(e.keyCode==13){
		if(is_pause==false){
			is_pause=true;
		}
		else{
			is_pause=false;
		}
	}
}