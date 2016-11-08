
function setCookie(cname,val){
			var date=new Date();
			date.setDate(date.getDate()+1);
			document.cookie=cname+"="+val+";expires="+date.toGMTString();
}
function getCookie(cname){
			var str=document.cookie;
			var i=str.indexOf(cname);
			if(i!=-1){
				i+=(cname.length+1);
				var endi=str.indexOf(";",i);
				return str.slice(i,endi!=-1?endi:str.length);
			}
}
var game={
  data:null,//保存r行*c列的二维数组
  RN:3, CN:3,
  CSIZE:100,//保存格子的大小
  OFFSET:16,//保存格子间的距离
  score:0,//保存当前得分
  top:0,
  state:1,//保存游戏状态
  RUNNING:1,
  GAMEOVER:0,
//强调:
  //1. 对象的方法用到对象自己的属性，必须加this.
  //2. 每个属性和方法之间，都要用逗号分隔
  //根据RN和CN动态生成前景div和背景div
  init:function(){
    for(var r=0,arr=[];r<this.RN;r++)
      for(var c=0;c<this.CN;c++)
        arr.push(""+r+c);
    var html='<div id="g'+
      arr.join(
        '" class="grid"></div><div id="g'
      )+'" class="grid"></div>';
    html+='<div id="c'+
      arr.join(
        '" class="cell"></div><div id="c'
      )+'" class="cell"></div>';
    //查找id为gridPanel的div，设置其内容为html
    var gp=document.getElementById("gridPanel");
    gp.innerHTML=html;
    //计算容器宽width:CN*(CSIZE+OFFSET)+OFFSET
    var width=this.CN*(this.CSIZE+this.OFFSET)
            +this.OFFSET;
    //计算容器高height:RN*(CSIZE+OFFSET)+OFFSET
    var height=this.RN*(this.CSIZE+this.OFFSET)
            +this.OFFSET;
    //设置id为gridPanel的div的style的宽为width
    gp.style.width=width+"px";
    //设置id为gridPanel的div的style的高为height
    gp.style.height=height+"px";
  },
  start:function(){//启动游戏
	this.top=getCookie("top")||0;
    this.init();
    this.score=0;//重置分数为0
    this.state=this.RUNNING;//重置游戏状态为运行
    //创建空数组保存到data属性中
    this.data=[];
    //r从0开始，到<RN结束
    for(var r=0;r<this.RN;r++){
      //向data中压入一个空数组
      this.data.push([]);
      //c从0开始，到<CN结束
      for(var c=0;c<this.CN;c++){
        //向data中r行的子数组压入一个0
        this.data[r].push(0);
      }
    }
    //调用randomNum随机生成一个数
    this.randomNum();
    //调用randomNum随机生成一个数
    this.randomNum();
    //调用updateView方法，将data数据更新到页面
    this.updateView();
    //为页面绑定键盘按下
    document.onkeydown=(function(e){
      //this默认->document,被bind替换为game
      //判断按键编号e.keyCode:
      switch(e.keyCode){
        //是37,就moveLeft
        case 37: this.moveLeft(); break;
        //是38,就moveUp
        case 38: this.moveUp(); break;
        //是39,就moveRight
        case 39: this.moveRight(); break;
        //是40,就moveDown
        case 40: this.moveDown(); break;
      }
    }.bind(this));
  },
  //在data中一个随机的空位置，生成2或4
  randomNum:function(){
    while(true){//反复
      //在0~RN-1之间生成一个随机整数，保存在r中
      var r=parseInt(Math.random()*this.RN);
      //在0~CN-1之间生成一个随机整数，保存在c中
      var c=parseInt(Math.random()*this.CN);
      //如果data中r行c列为0
      if(this.data[r][c]==0){
        //将data中r行c列赋值为:
          //0~1随机生成一个小数，如果<0.5?就赋值为2,否则赋值为4
          //退出循环
        this.data[r][c]=Math.random()<0.5?2:4;
        break;
      }
    }
  },
  updateView:function(){//将data的数据更新到页面
    //遍历data
    for(var r=0;r<this.RN;r++){
      for(var c=0;c<this.CN;c++){
        //查找id为"c"+r+c的div,保存在变量div中
        var div=document.getElementById("c"+r+c);
        //如果data中r行c列不是0
        if(this.data[r][c]!=0){
          //设置div的内容为data中r行c列的值
          div.innerHTML=this.data[r][c];
          //设置div的className属性为:
            //"cell n"+data中r行c列的值
          div.className="cell n"+this.data[r][c];
        }else{//否则
          //设置div的内容为""
          div.innerHTML="";
          //设置div的className属性为"cell"
          div.className="cell";
        }
      }
    }
    //找到id为score的div，设置其内容为score
    document.getElementById("score")
            .innerHTML=this.score;
	document.getElementById("top")
            .innerHTML=this.top;
    //找到id为gameOver的div保存在变量gameOver中
    var gameOver=
      document.getElementById("gameOver");
    //如果游戏的状态为GAMEOVER
    if(this.state==this.GAMEOVER){
      //设置gameOver的style的display为"block"
      gameOver.style.display="block";
      //找到id为fScore的span，设置其内容为score
      document.getElementById("fScore")
              .innerHTML=this.score;
    }else{//否则
      //设置gameOver的style的display为"none"
      gameOver.style.display="none";
    }
  },
  moveLeft:function(){//左移所有行
    this.move(function(){
      //遍历data中每一行
      for(var r=0;r<this.RN;r++){
        //调用moveLeftInRow左移第r行
        this.moveLeftInRow(r);
      }//(遍历后)
    }.bind(this));
    //this.move(()=>{.this.xxx.});
    //两个this是完全等效
  },
  moveLeftInRow:function(r){//左移第r行
    //遍历data中r行每个元素，到<CN-1结束
    for(var c=0;c<this.CN-1;c++){
      //调用getNextInRow方法，查找下一个不为0的位置，保存在nextc中
      var nextc=this.getNextInRow(r,c);
      //如果nextc等于-1，就退出循环
      if(nextc==-1){break;}
      else{//否则
        //如果c位置的值为0
        if(this.data[r][c]==0){
          //将nextc位置的值替换c位置的值
          this.data[r][c]=this.data[r][nextc];
          //将nextc位置的值置为0
          this.data[r][nextc]=0;
          c--;//c留在原地
        }else if(this.data[r][c]
                  ==this.data[r][nextc]){
          //否则，如果c位置的值等于nextc位置的值
          //将c位置的值*2
          this.data[r][c]*=2;
          this.score+=this.data[r][c];
          //将nextc位置的值置为0
          this.data[r][nextc]=0;
        }
      }
    }
  },
  //查找r行c列右侧下一个不为0的位置
  getNextInRow:function(r,c){
    //nextc从c+1开始，遍历data中r行的每个元素,到<CN结束
    for(var nextc=c+1;nextc<this.CN;nextc++){
      //如果nextc位置的值不为0
      if(this.data[r][nextc]!=0)
        return nextc//返回nextc
    }//(遍历结束)
    return -1;//返回-1
  },
  move:function(fun){    
    var before=String(this.data);//为data拍照
    fun();//没有用任何对象调用的函数this->window
    var after=String(this.data);//为data拍照
    //如果before!=after
    if(before!=after){
      //调用randomNum随机生成一个数
      this.randomNum(); 
      //如果游戏结束
      if(this.isGameOver()){      
        //就修改游戏状态为GAMEOVER
        this.state=this.GAMEOVER;
      }
	  if(this.score>this.top){
		setCookie("top",this.score);
	  }
      this.updateView();//更新页面
    }
  },
  isGameOver:function(){
    //遍历data
    for(var r=0;r<this.RN;r++){
      for(var c=0;c<this.CN;c++){
        //如果当前元素是0
        if(this.data[r][c]==0){
          return false;//返回false
        }
        //如果c<CN-1&&当前元素等于右侧元素
        if(c<this.CN-1
          &&this.data[r][c]==this.data[r][c+1]){
          return false;//返回false
        }
        //如果r<RN-1&&当前元素等于下方元素
        if(r<this.RN-1
          &&this.data[r][c]==this.data[r+1][c]){
          return false;//返回false
        }   
      }
    }//(遍历结束)
    return true;//返回true
  },
  moveRight:function(){//左移所有行
    this.move(function(){
      for(var r=0;r<this.RN;r++){//遍历data中每一行
        //调用moveRightInRow右移第r行
        this.moveRightInRow(r);
      }//(遍历后)
    }.bind(this));
    //this.move(()=>{.this.xxx.});//ES6 箭头函数
    //两个this是完全等效
  },
  moveRightInRow:function(r){//左移第r行
    //c从CN-1开始，反向遍历data中r行每个元素，到>0结束
    for(var c=this.CN-1;c>0;c--){
      //调用getPrevInRow方法，查找前一个不为0的位置，保存在prevc中
      var prevc=this.getPrevInRow(r,c);
      //如果prevc等于-1，就退出循环
      if(prevc==-1){break;}
      else{//否则
        //如果c位置的值为0
        if(this.data[r][c]==0){
          //将prevc位置的值替换c位置的值
          this.data[r][c]=this.data[r][prevc];
          //将prevc位置的值置为0
          this.data[r][prevc]=0;
          c++;//c留在原地
        }else if(this.data[r][c]
                  ==this.data[r][prevc]){
        //否则，如果c位置的值等于prevc位置的值
          //将c位置的值*2
          this.data[r][c]*=2;
          this.score+=this.data[r][c];
          //将prevc位置的值置为0
          this.data[r][prevc]=0;
        }
      }
    }
  },
  //查找r行c列右侧下一个不为0的位置
  getPrevInRow:function(r,c){
    //prevc从c-1开始，反向遍历data中r行的每个元素,到>=0结束
    for(var prevc=c-1;prevc>=0;prevc--){
      //如果prevc位置的值不为0
      if(this.data[r][prevc]!=0)
        return prevc;//返回prevc  
    }//(遍历结束)
    return -1;//返回-1
  },
  moveUp:function(){
    //调用move:传入匿名函数:
    this.move(
      //遍历data中每一列
        //调用moveUpInCol上移第c列
    //并为匿名函数提前绑定this
      function(){
        for(var c=0;c<this.CN;c++){
          this.moveUpInCol(c);
        }
      }.bind(this)
    );
  },
  moveUpInCol:function(c){
    //遍历每一行,到r<RN-1结束
    for(var r=0;r<this.RN-1;r++){
      //查找r位置下方下一个不为0的位置nextr
      var nextr=this.getNextInCol(r,c);
      //如果没找到,就退出循环
      if(nextr==-1){break;}
      else{//否则  
        //如果r位置的值为0
        if(this.data[r][c]==0){
          //将nextr位置的值赋值给r位置
          this.data[r][c]=this.data[nextr][c];
          //将nextr位置置为0
          this.data[nextr][c]=0;
          r++;//r留在原地
        }else if(this.data[r][c]
                  ==this.data[nextr][c]){
        //否则，如果r位置的值等于nextr位置的值
          //将r位置的值*2
          this.data[r][c]*=2;
          this.score+=this.data[r][c];
          //将nextr位置置为0
          this.data[nextr][c]=0;
        }
      }
    }
  },
  getNextInCol:function(r,c){
    //nextr从r+1开始，到<RN结束
    for(var nextr=r+1;nextr<this.RN;nextr++){
      //如果nextr位置不等于0
      if(this.data[nextr][c]!=0)
        return nextr;//返回nextr位置
    }//(遍历结束)
    return -1;//返回-1
  },
  moveDown:function(){
    //调用move:传入匿名函数:
    this.move(
      //遍历data中每一列
        //调用moveDownInCol下移第c列
    //并为匿名函数提前绑定this
      function(){
        for(var c=0;c<this.CN;c++){
          this.moveDownInCol(c);
        }
      }.bind(this)
    );
  },
  moveDownInCol:function(c){
    //r从RN-1开始，反向遍历每一行,到r>0结束
    for(var r=this.RN-1;r>0;r--){
      //查找r位置上方前一个不为0的位置prevr
      var prevr=this.getPrevInCol(r,c);
      //如果没找到,就退出循环
      if(prevr==-1){break;}
      else{//否则  
        //如果r位置的值为0
        if(this.data[r][c]==0){
          //将prevr位置的值赋值给r位置
          this.data[r][c]=this.data[prevr][c];
          //将prevr位置置为0
          this.data[prevr][c]=0;
          r++;//r留在原地
        }else if(this.data[r][c]
                  ==this.data[prevr][c]){
        //否则，如果r位置的值等于prevr位置的值
          //将r位置的值*2
          this.data[r][c]*=2;
          this.score+=this.data[r][c];
          //将prevr位置置为0
          this.data[prevr][c]=0;
        }
      }
    }
  },
  getPrevInCol:function(r,c){
    //prevr从r-1开始，反向遍历每一行，到>=0结束
    for(var prevr=r-1;prevr>=0;prevr--){
      //如果prevr位置不等于0
      if(this.data[prevr][c]!=0)
        return prevr;//返回prevr位置
    }//(遍历结束)
    return -1;//返回-1
  },
}
//页面加载后，自动启动游戏
window.onload=function(){ game.start(); }
//debug:
//1. debugger: 让程序停在关键位置，鼠标移入可能出错的变量，实时查看变量值。
//2. 打桩: 在程序关键位置，输出关键变量的值