var generate_count=0;
var label_count=0;
var ghost_count=0;
var rects=new Array();
var labels=new Array();
var ghosts={
	obj:new Array(),
	mode:new Array()
};
var dyings=new Array();
var target_param=new Array();
var target_label={
	obj:new Array(),
	value:new Array()
};
var is_return=0;

function generate(posX,posY,w,h,col,op,st,stw){
	rects[generate_count]=svg.rect(posX,posY,w,h);
	rects[generate_count].attr({
		fill: col,
		opacity: op,
		stroke:st,
		strokeWidth:stw,
		r:12
	});
	objects[generate_count]=rects[generate_count];
	is_parent[generate_count]=false;
	generate_count++;
}

function generateUI(posX,posY,w,h,col,op,st,stw){
	var obj=svg.rect(posX,posY,w,h);
	obj.attr({
		fill: col,
		opacity: op,
		stroke:st,
		strokeWidth:stw,
	});
	return obj;
}

function label(posX,posY,size,family,content,col){
	labels[label_count]=svg.text(posX,posY,content);
	labels[label_count].attr({
		fontSize: size,
		fill: col,
		fontFamily: family,
		pointerEvents:"none",
		filter:shadow
	})
	label_count++;
}

function labelUI(posX,posY,size,family,content,col){
	var new_label=svg.text(posX,posY,content);
	new_label.attr({
		fontSize: size,
		fill: col,
		fontFamily: family,
		pointerEvents:"none"
	})
	return new_label;
}

function ghost(obj,obj2,value,mode,label){
	is_return++;
	var x=Number(obj.attr("x"))+Number(obj.attr("width"))/2;
	var y=Number(obj.attr("y"))+Number(obj.attr("height"))/2;
	var x2=Number(obj2.attr("x"))+Number(obj2.attr("width"))/2;
	var y2=Number(obj2.attr("y"))+Number(obj2.attr("height"))/2;
	var scale=Number(obj.attr("width"))*0.15;
	ghosts.obj[ghost_count]=svg.rect(x,y,scale,scale);
	ghosts.obj[ghost_count].attr({
		fill:chooseColor(value)+"",
		opacity:0.85,
		r:30,
		filter:blur
	});
	trans(ghosts.obj[ghost_count],x2,y2,400*def_speed/30);
	ghosts.mode[ghost_count]=mode;
	if(mode==0){
		setParent(ghosts.obj[ghost_count],obj);
		dyings[ghost_count]=obj;
	}
	else{
		target_param[ghost_count]=obj2;
		target_label.obj[ghost_count]=label;
		target_label.value[ghost_count]=value;
	}
	ghost_count++;
}

function chooseColor(value) {
	var min=min_value;
	var max=max_value;
 	var color_min = "#0000ff"//"#afeeee"; //最小値の色
 	var color_max = "#00ff00"; //最大値の色
 	var color;
 	$(function() {
  		color = $.xcolor.gradientlevel(color_min, color_max, value - min, max - min);
 	});
 	return color;
}

function repaint(obj,col,op,ms){
	obj.animate( { fill :col},ms );
}

function resize(obj,w,h,ms){
	obj.animate({
		width: w,
		height: h,
	},ms)

	if(obj.id.indexOf("parent")>-1){
		for(var i=0;i<relation.parent.length;i++){
			if(relation.parent[i]==obj.id&&relation.child[i].inAnim().length==0){
				//resize(relation.child[i],w*relation.width[i],h*relation.height[i],ms);
			}
		}
	}
}

//子要素がある場合は追従させる(子要素単独で移動した際に親との相対距離を修正する必要有り)
function trans(obj,px,py,ms){
	obj.animate({
		x: px,
		y: py
	},ms)

	if(obj.id.indexOf("parent")>-1){
		for(var i=0;i<relation.parent.length;i++){
			if(relation.parent[i]==obj.id){
				trans(relation.child[i],px+relation.x[i],py+relation.y[i],ms);
			}
		}
	}
}

function copyRect(obj1){
	var obj_clone=svg.rect();
	obj_clone.attr({
		x:obj1.attr("x"),
		y:obj1.attr("y"),
		width:obj1.attr("width"),
		height:obj1.attr("height"),
		fill: obj1.attr("fill"),
		opacity: obj1.attr("opacity"),
		stroke:obj1.attr("stroke"),
		strokeWidth:obj1.attr("strokeWidth"),
	});

	return obj_clone;
}

function copyLabel(obj1){
	var obj_clone=svg.text();
	obj_clone.attr({
		x:obj1.attr("x"),
		y:obj1.attr("y"),
		fontSize:obj1.attr("fontSize"),
		fontFamily:obj1.attr("fontFamily"),
		text:obj1.attr("text"),
		fill: obj1.attr("fill"),
		pointerEvents:"none"
	});

	return obj_clone;
}

function duplicate(obj1){
	var obj_clone;
	if(obj1.attr("width")==null){
		obj_clone=svg.text();
		obj_clone=copyLabel(obj1);
	}
	else{
		obj_clone=svg.rect();
		obj_clone=copyRect(obj1);
	}
	return obj_clone;
}

function remove(obj){
	if(obj.id.indexOf("func")>-1){
		for(var i=0;i<rises.length;i++){
			if(onTrigger(rises[i],obj)==true){
				on_rise[i]=false;
			}
		}
	}
	if(obj.id.indexOf("parent")>-1){
		for(var i=0;i<relation.parent.length;i++){
			if(relation.parent[i]==obj.id){
				remove(relation.child[i]);
			}
		}
	}
	obj.remove();
}

function onCollision(obj1,obj2){
	var x1=obj1.attr("x")-0;
	var x2=obj2.attr("x")-0;
	var y1=obj1.attr("y")-0;
	var y2=obj2.attr("y")-0;
	var lx1=obj1.attr("width")-0;
	var lx2=obj2.attr("width")-0;
	var ly1=obj1.attr("height")-0;
	var ly2=obj2.attr("height")-0;
	//console.log(x2+lx2);
	if(x1<=x2+lx2&&y1<=y2+ly2&&x2<=x1+lx1&&y2<=y1+ly1){
		var distanceX;
		var distanceY;
		if(x2-x1>=0)distanceX=x2+(lx1-(x2-x1));
		else distanceX=x2+(-lx1-(x2-x1));
		if(y2-y1>=0)distanceY=y2+(ly1-(y2-y1));
		else distanceY=y2+(-ly1-(y2-y1));
		trans(obj2,distanceX,distanceY,0);
		return true;
	}
	else{
		return false;
	}
}

function onTrigger(obj1,obj2){
	var x1=obj1.attr("x")-0;
	var x2=obj2.attr("x")-0;
	var y1=obj1.attr("y")-0;
	var y2=obj2.attr("y")-0;
	var lx1=obj1.attr("width")-0;
	var lx2=obj2.attr("width")-0;
	var ly1=obj1.attr("height")-0;
	var ly2=obj2.attr("height")-0;
	//console.log(x2+lx2);
	if(x1<=x2+lx2&&y1<=y2+ly2&&x2<=x1+lx1&&y2<=y1+ly1){
		return true;
	}
	else{
		return false;
	}
}

//親子関係を築く(リサイズ時に子要素の座標を調整する必要有り)
function setParent(child,parent){
	if(parent.id.indexOf("parent")<0){
		parent.id+="parent";
	}
	if(child.attr("width")==null){
		relation.parent[relation.num]=parent.id;
		relation.child[relation.num]=child;
		relation.x[relation.num]=(Number(child.attr("x")))-Number(parent.attr("x"));
		relation.y[relation.num]=(Number(child.attr("y")))-Number(parent.attr("y"));
		relation.num++;
	}
	else{
		relation.parent[relation.num]=parent.id;
		relation.child[relation.num]=child;
		relation.dis=Number(parent.attr("width"))-Number(parent.attr("width"))*0.7;
		relation.dis/=4;
		relation.x[relation.num]=(Number(child.attr("x"))+relation.dis)-Number(parent.attr("x"));
		relation.y[relation.num]=(Number(child.attr("y")))-Number(parent.attr("y"));
		relation.width[relation.num]=Number(child.attr("width"))/Number(parent.attr("width"));
		relation.height[relation.num]=Number(child.attr("height"))/Number(parent.attr("height"));
		relation.num++;
	}
}

var stringCounter = function(str,seq){
    return str.split(seq).length - 1;
}

function getFunctionName(text){
	var func_name="";
	for(var i=0;i<text.length;i++){
		func_name+=text[i];
		if(text[i]==","){
			func_name="";
		}
	}
	return func_name;
}

