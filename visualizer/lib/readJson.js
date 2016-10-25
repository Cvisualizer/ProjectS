/*
<処理の流れ>
read()でjsonデータを逐次読み込んで行く
内容がグローバル変数か、関数か、ローカル変数か、命令コードかを判定してそれに応じた処理をする
グローバル変数であれば即座にmakeObject()する
関数であればその関数の情報を記録しておき、call命令が読み込まれたタイミングでmakeObjectする
call命令時には関数をmakeObjecta()し、内包する引数とローカル変数をmakeObject()するとともにに関数の子要素として登録する
*/

var gc=0; //globalの読み込み回数
var lc=0; //localの読み込み回数
var cc=0; //codeの読み込み回数
var mode=0;
var is_read=false;
var value_label={
	obj:new Array(),
	parent:new Array(),
	num:0
};
var func_list=new Array();
var local_list=new Array();
var local_list_num=0;
var func_count=0;
var param_num=0;
var var_num=0;
var child_num={
	variable:0,
	param:0
};
var param_len=0;
var local_column=0;
var local_line=0;
var local_scale=0;
var current_func=new Array();
var return_count=0;
var func_pos_list=new Array();
var local_var_list=new Array();
var globalElements=new Array();
var var_max=0;
var var_min=0;
var is_start=false;
var g_len=0; //globalの個数
var l_len=0; //localの個数
var is_end=false;
var scales=new Array();
var target;
var pos_list=new Array();
var line_num=0;
var is_parent=new Array();
var dying=null;
var var_name="";
var first_max=0;
var replay=false;
var relation={
	num:0,
	dis:0,
	x:new Array(),
	y:new Array(),
	width:new Array(),
	height:new Array(),
	parent:new Array(),
	child:new Array()
};

for(var i=0;i<100;i++){
	local_var_list[i]=0;
}

//jsonを逐次読み込み
function read(){
		if(generate_count>0){
			for(var i=0;i<rects.length;i++){
				if(i<dataset.global.length+dataset.local.length){
					//checkScale(i);
				}
			}
		}
		if(is_start==false){
			var_max=dataset.info.max;
			var_min=dataset.info.min;
			setMap();
			is_start=true;
		}
		if(mode==0&&dataset.global.length>0){
			var size=0;
			if(dataset.global[gc].class=="var"){
				size=50;
				//setLocal(dataset.global[gc].name,"null","var");
				makeObject(0,dataset.global.name);
			}
			else{
				addFunc(dataset.global[gc].name,10);
				func_pos_list[func_count-1]=150+gc*120;
				/*size=100;
				makeObject(1);*/
			}
		}

		if(mode==1&&dataset.local.length>0){
			//var size=40;
			//makeObject(2);
			if(dataset.local[lc].class=="var"){
				setLocal(dataset.local[lc].var,dataset.local[lc].function,"var");
			}
			else{
				setLocal(dataset.local[lc].var,dataset.local[lc].function,"param");
			}
		}

		if(mode==2&&dataset.code.length>0){
			checkCode(dataset);
		}

		checkJson(dataset);
}

//読み込みのフェーズを管理する
function checkJson(dataset){
	var next;
	if(mode==0){
		if(gc<dataset.global.length-1){
			next=dataset.global[gc+1];
			if(next.class=="function"){
				exec_speed=1;
			}
			else{
				exec_speed=def_speed;
			}
			gc++;
		}
		else{
			mode++;
			exec_speed=1;
			return 0;
		}
	}
	if(mode==1){
		if(lc<dataset.local.length-1){
			lc++;
		}
		else{
			mode++;
			exec_speed=def_speed;
			return 0;
		}
	}
	if(mode==2){
		if(cc<dataset.code.length-1){
			next=dataset.code[cc+1];
			if(next.ref||next.printf){
				exec_speed=1;
			}
			else{
				exec_speed=def_speed;
			}
			cc++;
		}
		else{
			mode=0;
			svg.zpd();
			is_read=false;
			is_start=false;
			is_end=true;
		}
	}
}

/*
関数仮登録
nameが関数名、objが関数の実体、numは関数の識別子
objはcall時に追加するので、nullのままにしておく
*/
function addFunc(name,len){
	func_list[func_count]={
		name:name,
		obj:new Array(),
		num:gc,
		depth:1
	};
	func_count++;
}

function addVar(name){
	for(var i=0;i<func_list.length;i++){
		if(name==func_list[i]){
			local_var_list[i]++;
			return i;
		}
	}
}

/*
ローカル変数or引数の仮登録
classは変数or引数
functionは所属する関数のid
nameは変数名
objは実体(動的に書き換える)
*/
function setLocal(variable,func,type){
	local_list[local_list_num]={
		class:type,
		function:func,
		name:variable,
		obj:new Array(),
		depth:1
	}
	local_list_num++;
}

//命令コードの種類に応じて処理
function checkCode(dataset){
	if(dataset.code[cc].assign){
		assignValue();
	}

	if(dataset.code[cc].call){
		param_num=0;
		var_num=0;
		param_len=dataset.code[cc].call.param.length-1;
		makeObject(1,dataset.code[cc].call.function);
	}

	if(dataset.code[cc].return){
		var past_func=current_func[return_count-2];
		var return_value=dataset.code[cc].return;
		ghost(current_func[return_count-1],past_func,return_value,0,null);
		//remove(current_func[return_count-1]);
		current_func[return_count-1]=null;
		return_count--;
	}

	if(dataset.code[cc].printf){
		outputLog(dataset.code[cc].printf);
	}
}

function checkNumber(){
	var top=0;
	var func_num=0;
	var func_num_num=0;
	var global_num=0;
	var numbers=new Array();
	for(var i=0;i<dataset.code.length;i++){
		if(dataset.code[i].call){
			func_num++;
			numbers[func_num_num]=func_num;
			func_num_num++;
		}
		if(dataset.code[i].return){
			func_num--;
			numbers[func_num_num]=func_num;
			func_num_num++;
		}
	}
	for(var i=1;i<numbers.length;i++){
		if(numbers[i]>numbers[i-1]){
			top=i;
		}
	}
	for(var i=0;i<dataset.global.length;i++){
		if(dataset.global[i].class=="var"){
			global_num++;
		}
	}
	var_len=global_num;
	func_len=numbers[top];
	return var_len+func_len;
}

//描画基盤となるグリッドを作成
function setMap(){
	if(is_play==false){
		obj_num=checkNumber();
		is_play=true;
	}
	else{
		//reset();
	}
	checkMax();
	mapping();
}

//各要素の実体を生成する
function makeObject(mode,name){
	var random=Math.floor(Math.random());
	var scale=0;
	var rectCol;
	switch(mode){
		case 0:
			scale=0.8;
			rectCol="#606060";
			break;
		case 1:
			scale=1;
			if(name=="main"){
				rectCol="#000";
			}
			else{
				rectCol="#000";
			}
			break;
		case 2:
			scale=0.3;
			rectCol="#606060";
			break;

		case 3:
			scale=0.3;
			rectCol="#606060";
			break;
	}
	if(mode<2){
		makeGlobal(name,scale,rectCol,mode,random);
	}
	else{
		makeLocal(name,scale,rectCol,mode);
	}
}

//関数内部の引数と変数を生成する
function makeFunction(name){
	for(var i=0;i<local_list.length;i++){
		if(local_list[i].function==name&&local_list[i].class=="var"){
			var_name=local_list[i].name;
			makeObject(2,local_list[i].function);
			var_num++;
		}
		
		if(local_list[i].function==name&&local_list[i].class=="param"){
			var_name=local_list[i].name;
			makeObject(3,local_list[i].function);
			param_num++;
		}
	}
}

//子要素の数を数える
function countChild(name){
	child_num.variable=0;
	child_num.param=0;
	for(var i=0;i<local_list.length;i++){
		if(local_list[i].function==name&&local_list[i].class=="var"){
			child_num.variable++;
		}
		if(local_list[i].function==name&&local_list[i].class=="param"){
			child_num.param++;
		}
	}
}

function checkChild(func){
	var num=0;
	for(var i=0;i<local_list.length;i++){
		if(local_list[i].function==func){
			num++;
		}
	}
	return num;
}

function checkScale(i){
	if(i<dataset.global.length){
		if(dataset.global[i].class=="var"){
			scales[i]=250;
		}
		else{
			scales[i]=500;
		}
	}
	else
	if(i>=dataset.global.length&&i<dataset.global.length+dataset.local.length){
		scales[i]=200;
	}
	resize(rects[i],scales[i]/dataset.global.length,scales[i]/dataset.global.length,100);
}

function outputLog(log){
	if(document.getElementById("console").value==""){
		document.getElementById("console").value+=log;
	}
	else{
		document.getElementById("console").value+="\n"+log;
	}
}

function makeValueLabel(parent_obj){
	//value_label.obj[value_label.num]=labelUI(Number(parent.attr("x"))+rectW[mode]/3,Number(parent.attr("y"))+rectH[mode]/2,label_scale+"px","HelveticaNeue","0","#fff");
	value_label.parent[value_label.num]=parent_obj;
	value_label.num++;
}

function searchValueLabel(obj){
	for(var i=0;i<value_label.parent.length;i++){
		if(value_label.parent[i]==obj){
			return value_label.obj[i];
		}
	}
	return null;
}

function checkReturn(){
	for(var i=0;i<ghosts.obj.length;i++){
		if(ghosts.obj[i]!=null&&ghosts.obj[i].inAnim().length==0){
			if(ghosts.mode[i]==0){
				remove(dyings[i]);
			}
			else{
				target_label.obj[i].attr("text",target_label.value[i]);
				repaint(target_param[i],ghosts.obj[i].attr("fill"),target_param[i].attr("opacity"),100);
				remove(ghosts.obj[i]);
			}
			ghosts.obj[i]=null;
			is_return--;
			is_stop=false;
		}
	}
}

function checkMax(){
	max_value=dataset.info.max;
	min_value=dataset.info.min;
	for(var j=0;j<dataset.code.length;j++){
		if(dataset.code[j].return){
			if(dataset.code[j].return>max_value){
				max_valur=dataset.code[j].return;
			}
			if(dataset.code[j].return<min_value){
				min_value=dataset.code[j].return;
			}
		}
	}
}

function checkPos(i){
	pos_list[i]+=scales[i]+10;
	trans(rects[i],pos_list[i],100);
}

function erase(){
	for(var i=0;i<label_count;i++){
		//remove(new_label[i]);
	}
	for(var j=0;i<generate_count;j++){
		//removeElement("rect");
	}
	label_count=0;
	generate_count=0;
}

function assignValue(){
	var path_max=0;
	if(dataset.code[cc].assign.global==true){
		var path=dataset.code[cc].assign.addr;
		ghost(current_func[return_count-1],rects[path],dataset.code[cc].assign.value,1,searchValueLabel(rects[path]));
	}
	else{
		var current_func_name;
		/*for(var j=0;j<func_list.length;j++){
			for(var k=0;k<func_list[j].obj.length;k++){
				if(func_list[j].obj[k]==current_func[return_count-1]){
					current_func_name=func_list[j].name;
					break;
				}
			}
		}*/
		current_func_name=getFunctionName(dataset.code[cc].assign.path);
		var path_seed=dataset.code[cc].assign.addr-dataset.code[cc].assign.first;
		var path=searchFunction(path_seed,current_func_name);
		for(var i=0;i<local_list.length;i++){
			if(dataset.local[path].var==local_list[i].name&&dataset.local[path].function==local_list[i].function){
				//var assign_depth=1;
				if(local_list[i].depth>0){
					var assign_depth=stringCounter(dataset.code[cc].assign.path,local_list[i].function);
				}
				ghost(current_func[return_count-1],local_list[i].obj[assign_depth],dataset.code[cc].assign.value,1,searchValueLabel(local_list[i].obj[assign_depth]));
			}
		}
	}
}

function searchFunction(path,func){
	var path_num=0;
	for(var i=0;i<dataset.local.length;i++){
		if(dataset.local[i].function==func){
			if(path_num==path){
				return i;
			}
			path_num++;
		}
	}
}

function makeGlobal(name,scale,rectCol,mode,random){
	var margineX=0;
	var margineY=0;
	if(mode==0){
		margineX=rectW[0]*0.1;
		margineY=rectH[0]*0.1;
	}
	if(on_rise[random]==false&&rise_type[random]==mode){
		generate(riseX[random]+margineX,riseY[random]+Number(rises[random].attr("height"))*0.05+margineY,250+100/obj_num*scale,250+100/obj_num*scale,rectCol,0.85,"black",0);
		on_rise[random]=true;
	}
	else{
		while(on_rise[random]==true||rise_type[random]!=mode){
			random=Math.floor(Math.random()*obj_num);
		}
		generate(riseX[random]+margineX,riseY[random]+Number(rises[random].attr("height"))*0.05+margineY,250+100/obj_num*scale,250+100/obj_num*scale,rectCol,0.85,"black",0);
		on_rise[random]=true;
	}
	var target=rects[generate_count-1];
	var label_scale=target.attr("width")/8;
	if(label_scale>20){
		label_scale=20;
	}
	rects[generate_count-1].id+="func";
	var func_len=checkChild(name);
	if(func_len>0){
		resize(rects[generate_count-1],rectW[mode]*scale,rectH[mode]*scale,500);
	}
	else{
		resize(rects[generate_count-1],rectW[mode]*scale,rectH[mode]*scale,500);
	}
	if(mode==0){
		globalElements[gc]=0;
		var_name=dataset.global[gc].name;
		label(Number(target.attr("x"))+rectW[0]/10,Number(target.attr("y"))+rectH[0]/4,label_scale+"px","HelveticaNeue",var_name,"#fff");
		value_label.obj[value_label.num]=labelUI(Number(target.attr("x"))+rectW[0]/3,Number(target.attr("y"))+rectH[0]/2,label_scale+"px","HelveticaNeue","0","#fff");
		makeValueLabel(target);
	}
	else{
		local_column=Number(rects[generate_count-1].attr("x"));
		local_line=Number(rects[generate_count-1].attr("y"))*1.05;
		local_scale=rectW[mode]*scale;
		for(var i=0;i<func_list.length;i++){
			if(func_list[i].name==name){
				func_list[i].obj[func_list[i].depth]=rects[generate_count-1];
				current_func[return_count]=rects[generate_count-1];
				return_count++;
				globalElements[func_list[i].num]=0;
				if(func_list[i].depth==1){
					label(Number(target.attr("x"))+rectW[1]*0.1,Number(target.attr("y"))+rectH[1]*scale/1.05,label_scale+"px","HelveticaNeue-Light",name,"#fff");
					setParent(labels[label_count-1],target);
				}
				else{
					label(Number(target.attr("x"))+rectW[1]*0.1,Number(target.attr("y"))+rectH[1]*scale/1.05,label_scale+"px","HelveticaNeue-Light",name+"("+func_list[i].depth+")","#fff");
					setParent(labels[label_count-1],target);
				}
				func_list[i].depth++;
			}
		}
		countChild(name);
		makeFunction(name);
	}
}

function makeLocal(name,scale,rectCol,mode){
	var num=0;
	var reduction=0;
	for(var i=0;i<func_list.length;i++){
		if(name==func_list[i].name){
			var obj=func_list[i].obj[func_list[i].depth-1];
			var childW=rectW[1]*scale;
			var top_margine=0;
			if(mode==2){
				if(child_num.variable>0){
					reduction=1.4-((child_num.variable-1)/child_num.variable);
				}
				top_margine=obj.attr("height")*scale/4*reduction;
				childW=rectH[1]*scale*reduction;
				//generate(Number(obj.attr("x")),obj.attr("y")*1.05+var_num*(rectH*scale*reduction*1.1)+top_margine,childW,rectH*scale*reduction,rectCol,0.9,"black",0);
				generate(local_column,local_line+top_margine,childW,rectH[1]/2*scale*reduction,rectCol,0.9,"black",0);
				target=rects[generate_count-1];
				var label_scale=target.attr("width")/3;
				value_label.obj[value_label.num]=labelUI(Number(target.attr("x"))+rectW[1]*scale/2.5,Number(target.attr("y"))+rectH[1]*scale/2,label_scale/2+"px","HelveticaNeue","0","#fff");
				makeValueLabel(target);
				local_column+=Number(target.attr("width"))*1.1;
				if(local_column+Number(target.attr("width"))>Number(obj.attr("x"))+local_scale){
					local_column=Number(obj.attr("x"));
					local_line+=Number(target.attr("height"))*1.1;
				}
				//trans(target,Number(target.attr("x"))+relation.dis,target.attr("y"),300);
			}
			if(mode==3){
				if(child_num.param>0){
					reduction=1.3-((child_num.param-1)/child_num.param);
				}
				generate(Number(obj.attr("x"))+relation.dis+param_num*(childW*1.3*reduction)+param_num*5,obj.attr("y")-(rectH[1]*scale/5*reduction),childW*1.3*reduction,rectH[1]/1.5*scale*reduction,rectCol,0.9,"black",0);
				target=rects[generate_count-1];
				//trans(target,Number(target.attr("x"))+relation.dis+param_num*Number(target.attr("width"))+param_num*5,Number(obj.attr("y"))-Number(target.attr("height"))/2,0);
				var param_value=dataset.code[cc].call.param[param_len];
				param_len--;
				var label_scale=Number(target.attr("width"))/1;
				value_label.obj[value_label.num]=labelUI(Number(target.attr("x"))+rectW[1]*scale/2,Number(target.attr("y"))+rectH[1]*scale/2.5,label_scale/5+"px","HelveticaNeue","0","#fff");
				makeValueLabel(target);
				ghost(current_func[return_count-2],target,param_value,1,searchValueLabel(target));
			}
			for(var j=0;j<local_list.length;j++){
				if(local_list[j].function==name&&var_name==local_list[j].name){
					if(local_list[j].obj[local_list[j].depth]!=null){
						local_list[j].depth++;
					}
					local_list[j].obj[local_list[j].depth]=target;
				}
			}
			if(label_scale>=15){
				label_scale=15;
			}
			label(target.attr("x"),Number(target.attr("y"))+rectH[1]/2.5*scale,label_scale+"px","HelveticaNeue-Light",var_name,"#fff");
			setParent(labels[label_count-1],target);
			target.attr("r",5);
			setParent(target,obj);
			//resize(target,rects[i].attr("width")*0.7,rectH*scale,500);
			globalElements[func_list[i].num]++;
		}
	}
}

function reset(){
	window.localStorage.setItem("replay",true);
	window.localStorage.setItem("code",document.getElementById("textArea").value);
	location.reload();
}