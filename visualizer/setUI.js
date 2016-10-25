
document.getElementById("textArea").value=window.localStorage.getItem("code");
document.getElementById("speed_changer").value=window.localStorage.getItem("exec_speed");
if(window.localStorage.getItem("replay")=="true"){
    checkExecSpeed();
    request();
    window.localStorage.removeItem("replay");
}

var console_opend=false;
        $(function(){  
         $(".sampleBox").mousedown(function(){
            document.getElementById('button').style.backgroundColor = '#0a1616';
         });
         $(".sampleBox").mouseover(function(){
            document.getElementById('button').style.backgroundColor = '#AACF7C';
         });
         $(".sampleBox").mouseout(function(){
            document.getElementById('button').style.backgroundColor = '#7BA23F';
         });
         $(".sampleBox").mouseup(function(){
            checkExecSpeed();
            if(is_play==false){
                request();
            }
            else{
                reset();
            }
            /*removeTutorial();
            document.getElementById('button').style.backgroundColor = '#7BA23F';
            window.localStorage.setItem("code",document.getElementById("textArea").value);
            socket=io.connect("http://127.0.0.1:8000/",function(){
                socket.emit('message',document.getElementById("textArea").value);
            });
            socket.emit('message',document.getElementById("textArea").value);
            socket.on('greeting',function(data){
                dataset=data;
                is_read=true;
            });*/
         });

         $(".consoleButton").mousedown(function(){
            if(console_opend==false){
                document.getElementById('consoleButton').style.backgroundColor = '#000';
                document.getElementById('console').style.opacity=0.88;
                document.getElementById('consoleText').style.color="#fff";
                console_opend=true;
            }
            else{
                document.getElementById('consoleButton').style.backgroundColor = '#FFF';
                document.getElementById('console').style.opacity=0;
                document.getElementById('consoleText').style.color="#000";
                console_opend=false;
            }
         });
        });

function request(){
    removeTutorial();
            document.getElementById('button').style.backgroundColor = '#7BA23F';
            window.localStorage.setItem("code",document.getElementById("textArea").value);
            socket=io.connect("http://127.0.0.1:8000/",function(){
                socket.emit('message',document.getElementById("textArea").value);
            });
            socket.emit('message',document.getElementById("textArea").value);
            socket.on('greeting',function(data){
                removeTutorial();
                dataset=data;
                is_read=true;
            });
}

function checkExecSpeed(){
    var e_speed=Number(document.getElementById("speed_changer").value);
    window.localStorage.setItem("exec_speed",e_speed);
    if(e_speed<=0){
        def_speed=30;
    }
    else
    if(e_speed>100){
        def_speed=100;
    }
    else{
        def_speed=e_speed;
    }
}

function removeTutorial(){
    document.getElementById('howto').style.fontSize=0;
    document.getElementById('gvalText').style.fontSize=0;
    document.getElementById('funcText').style.fontSize=0;
    document.getElementById('lvalText').style.fontSize=0;
    document.getElementById('argText').style.fontSize=0;
    document.getElementById('howtouse').style.fontSize=0;
    document.getElementById('high').style.fontSize=0;
    document.getElementById('low').style.fontSize=0;
    document.getElementById('value').style.fontSize=0;
    document.getElementById('gval').style.opacity=0;
    document.getElementById('func').style.opacity=0;
    document.getElementById('lval').style.opacity=0;
    document.getElementById('param').style.opacity=0;
    document.getElementById('colorChart').style.opacity=0;
    document.getElementById('content').style.fontSize=55;
}