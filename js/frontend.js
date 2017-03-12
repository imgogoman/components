/*————————————————————————————————————————————————————
  Date:           2017.03.07
—————————————————————————————————————————————————————*/

var documentHeight;
var $window = $(window);
var debug = document.createElement("div");
debug.id = "debug";
debug.style.cssText = "position: fixed; left: 0; bottom: 0; padding: 4px; background-color: #ccc; font-size: 10px;";
document.body.appendChild(debug);

function getID(id){
  return document.getElementById(id);
}

function isWechat(){
  var ua = window.navigator.userAgent.toLowerCase();
  if(ua.match(/MicroMessenger/i) == 'micromessenger'){
    return true;
  }else{
    return false;
  }
}


//----------------------------------------------------- 获取 url 参数(start)
function getparastr(strname) {
  var hrefstr,pos,parastr,para,tempstr;
  hrefstr = window.location.href;
  pos = hrefstr.indexOf("?");
  parastr = hrefstr.substring(pos+1);

  para = parastr.split("&");
  tempstr="";
  for(i=0;i<para.length;i++){
    tempstr = para[i];
    pos = tempstr.indexOf("=");
    if(tempstr.substring(0,pos) == strname) {
      return tempstr.substring(pos+1);
    }
  }
  return null;
}
//----------------------------------------------------- 获取 url 参数(end)


//----------------------------------------------------- 查找相邻元素: siblings(start)
function getSiblings(ele, callback){
  var siblings = [], currentNode;
  //查找前一个节点
  currentNode = ele.previousSibling;
  while( currentNode ){
    if( currentNode.nodeType === 1 ){
      siblings.unshift(currentNode);
    }
    currentNode = currentNode.previousSibling;
  }

  //查找后一个节点
  currentNode = ele.nextSibling;
  while( currentNode ){
    if( currentNode.nodeType === 1 ){
      siblings.push(currentNode);
    }
    currentNode = currentNode.nextSibling;
  }

  return siblings.forEach(function(e){
    callback(e);
  });

};

/*
getSiblings(xxx[0]).forEach(function(e){
  e.classList.remove("className");
});
*/
//----------------------------------------------------- 查找相邻元素: siblings(end)


//-----------------------------------------------------内容切换: switchover(start)
//依赖 jQuery

/*
;(function($){
  window.xxx = function(selector, setDefaults){
  };
})(window.Zepto || window.jQuery);
*/

/*
  options:
  @currentNavigatorParents: 当前活动的导航菜单(父级)
  @currentNavigator: 当前活动的导航菜单
  @currentTabs: 当前活动的选项卡(父级)
  @currentTab: 当前活动的选项卡
*/

function switchover(selector, setOptions){
  this.navigator = $(selector);
  this.index = undefined;
  this.options = {
    navigatorActiveClass: 'active',
    tabActiveClass: 'active',
    currentNavigatorParents: null,
    currentNavigator: null,
    currentTabs: null,
    currentTab: null
  };

  for(var i in setOptions){
    this.options[i] = setOptions[i];
  }

  this.init();
};

switchover.prototype ={
  log: function(){
    console.log(this.options);
  },
  init: function(){
    var me = this;
    me.navigator.on('click', function(e){
      e.preventDefault();
      var thisLink = $(this);
      var javascriptReg = /j+a+v+a+s+c+r+i+p+t|:|;/i;

      if( javascriptReg.test(thisLink.attr('href')) ){
        //alert(this.text +' 的href属性包含特殊字符');
        me.goTo('', thisLink.parent());
      }else{
        me.goTo(thisLink.attr('href'), thisLink.parent());
      }

    })
  },
  goTo: function(tab, nav, callback){
    var opt = this.options;
    var tab = $(tab);
    var nav = $(nav);

    if(tab.length >0){
      this.index = tab.index();

      opt.currentTab = tab;
      opt.currentTabs = tab.parents('.tabs');

      //通过 tabs 查找相邻的 NavigatorParents
      if(opt.currentTabs.prev().is('.tabs-nav')){
        opt.currentNavigatorParents = opt.currentTabs.prev();
      }else if(opt.currentTabs.next().is('.tabs-nav')){
        opt.currentNavigatorParents = opt.currentTabs.next();
      }else{
        console.log('找不到"currentNavigatorParents"');
      }

      opt.currentNavigator = opt.currentNavigatorParents.find('.item').eq(this.index);

    }else if(nav.length >0){
      this.index = nav.index();

      opt.currentNavigator = nav;
      opt.currentNavigatorParents = nav.parents('.tabs-nav');

      //通过 NavigatorParents 查找相邻的 tabs
      if(opt.currentNavigatorParents.prev().is('.tabs')){
        opt.currentTabs = opt.currentNavigatorParents.prev();
      }else if(opt.currentNavigatorParents.next().is('.tabs')){
        opt.currentTabs = opt.currentNavigatorParents.next();
      }else{
        console.log('找不到"currentTabs"');
      }

      opt.currentTab = opt.currentTabs.children('.tab').eq(this.index);
    }else{
      console.log(nav.length + " 个nav");
      console.log(tab.length + " 个tab" );
      return false;
    }

    //before show tab
    if( typeof(this.goTo.beforeShowFunction) ==="function" ){
      this.goTo.beforeShowFunction(this);
    }

    //如果“tabs-nav”下的“data-toggle='tab'”在不同的地方，通过 find 方法查找不容易出错。
    opt.currentNavigatorParents.find("." +opt.navigatorActiveClass).removeClass(opt.navigatorActiveClass);
    opt.currentNavigator.addClass(opt.navigatorActiveClass);
    opt.currentTab.addClass(opt.tabActiveClass).siblings().removeClass(opt.tabActiveClass);

    //after show tab
    if( typeof(this.goTo.afterShowFunction) ==="function" ){
      this.goTo.afterShowFunction(this);
    }

    if(typeof(callback) === 'function'){
      //callback(this.index);
      callback(this);
    }
  },
  reset: function(resetOptions){
    //$.extend(this.options, opt);
    for(i in resetOptions){
      this.options[i] = resetOptions[i];
    }
    return this;
  },
  on: function(eventName, fun){
    if( eventName == 'beforeShow' && typeof(fun) === 'function' ){
      this.goTo.beforeShowFunction = fun;
    }
    if( eventName == 'afterShow' && typeof(fun) === 'function' ){
      this.goTo.afterShowFunction = fun;
    }
  }
};

//-----------------------------------------------------内容切换: switchover(end)

//-----------------------------------------------------检测滚动范围: scrollScope(start)

/*
@options.scrollContainer: 需要检测的容器，默认是检测整个文档
        .min: 容器中每个需处理的元素，其滚动范围从最小值开始
        .max: 到最大值结束

        .migrated: 偏移值，可以设定相邻元素的边界区域，
                   设置此值会改变min值，令相邻元素的前一个最大值与下一个最小值相交，
                   默认为0，即不相交

        .onEnter: 进入要处理的元素
        .onLeave: 离开要处理的元素
        .onLeaveFirstElement: 容器中若有多个元素，离开第一个时回调
        .onLeaveLastElement:  容器中若有多个元素，离开最后一个时回调
*/

function scrollScope(selector, setOptions){
  this.selector = document.querySelectorAll(selector);
  this.options = {
    scrollContainer: document,
    min: 0,
    max: 0,
    migrated: 0,
    onEnter: {},
    onLeave: {},
    onLeaveFirstElement: {},
    onLeaveLastElement: {}
  };

  for(var i in setOptions){
    this.options[i] = setOptions[i];
  }

  this.init();

};
scrollScope.prototype ={
  init: function(){
    var me = this;
    var o = this.options;
    o.firstElement = me.selector[0];
    o.lastElement = me.selector[me.selector.length - 1];

    //addEventListener (start)
    o.scrollContainer.addEventListener("scroll", function(){
      var scrollTop = document.body.scrollTop;
      var min, max, firstTop, lastTop;
      debug.innerHTML = '';

      // 遍历(start)
      [].forEach.call(me.selector, function(ele, index){
        o.ele = ele;
        o.index = index;
        o.scrollTop = scrollTop;
        o.min == 0 ? (min = ele.offsetTop +o.migrated) : (min = o.min +o.migrated);
        o.max == 0 ? (max = ele.offsetTop +ele.offsetHeight) : (max = o.max);

        /*
        debug.innerHTML += "ele: " +ele.id +'<br />';
        debug.innerHTML += "min: " +o.min +'<br />';
        debug.innerHTML += "max: " +o.max +'<br />';
        debug.innerHTML += '============<br />';
        */

        //进入要处理的范围，否则离开
        if( scrollTop >= min && scrollTop <= max){
          if(typeof(o.onEnter) === "function" ){
            o.onEnter(o);
          }
        }else{
          if(typeof(o.onLeave) === "function" ){
            // console.log(me.selector[0]);
            // console.log(me.selector[0].offsetTop);
            o.onLeave(o);
          }
        }
      })
      // 遍历(end)

      firstTop = o.firstElement.offsetTop;
      lastTop = o.lastElement.offsetTop + o.lastElement.offsetHeight;
      if( scrollTop < firstTop && typeof(o.onLeaveFirstElement) === "function" ){
        o.onLeaveFirstElement(o);
      }else if( scrollTop > lastTop && typeof(o.onLeaveLastElement) === "function" ){
        o.onLeaveLastElement(o);
      }
    })
    //addEventListener (end)
  }

}
//-----------------------------------------------------检测滚动范围: scrollScope(end)

/*----------------------------------------------------- 时间(start) --*/
//时间比较
function timeComparer(s1, s2){
  if( typeof(st === undefined) ){
    st = new Date().getTime();
  }
  et = Date.parse(et);
  if(s1 >= e2){
    return 1;
  }else{
    return 0;
  }
}

/*
 时间范围
 @st: start time,
 @et: end time,
*/
function timeFrame(st, et){
  st === undefined ? st = new Date().getTime() : st = Date.parse(st);
  et = Date.parse(et);
  //current time;
  var ct = new Date().getTime();

  if( ct > st && ct < et ){
    return true;
  }else{
    return false;
  }
}

console.log("现在是否在 2016-12-29,16:30:00 至 2016-12-29,17:00:00 之间？ is " +
  timeFrame("2016-12-29,16:30:00", "2016-12-29,17:00:00"));

/*----------------------------------------------------- 时间(end) --*/



/*
function imgLoader(setOptions){
  this.options = {
    urls: []
  };

  for(var i in setOptions){
    this.options[i] = setOptions[i];
  }

  this.load();
};

imgLoader.prototype = {
  load: function(){
    var me = this;
    var opt = me.options;
    var isLoad;
    var elements = [];
    var timer;


    function imgLoad(){
      opt.urls.forEach(function(el, i){
        elements[i] = new Image();
        elements[i].src = el;
        console.log( isLoad );

        if (elements[i].complete){
          isLoad = true;
        }else{
          isLoad = false;
        }

      })

    }
    if(isLoad){
      clearTimeout(timer);
      me.onLoaded();
    }else{
      timer = setTimeout(function(){
        imgLoad();
      }, 800);
    }



  },
  onLoaded: function(){
    console.log("onLoaded");
  }
}
*/

var app_panel;
if(document.getElementById('app_panel')){
  app_panel = $('#app_panel');
}

//打开“覆盖层”
var areaOverlay = $('#areaOverlay');
var openAreaOverlay = function(type){
  if(type == 'transparent'){
    areaOverlay.attr('class','app-panel-overlay');
  }else areaOverlay.removeClass('none');
  //隐藏滚动条
  $('html').css('overflow','hidden');
}

//关闭“覆盖层”
areaOverlay.on('tap', function(e){
  e.stopPropagation(); //停止冒泡

  setTimeout(closeAreaOverlay, 350);
});
function closeAreaOverlay(){
  if(app_panel){
    app_panel.removeClass('app-panel-left');
    app_panel.removeClass('app-panel-right');
    //模糊效果
    //$('.views').removeClass('filter-blur');
    off_app_panel();
  }

  $('.popup-wrap').removeClass('popup-action-view-wrap--on').removeAttr('style');

  $('html').removeAttr('style');

  areaOverlay.addClass('none');
}


/*----------------------------------------------------- 自定义弹出框(start) --*/
/*
var popup = function(opt){
  this.obj = $(opt.obj);
  this.overlay = (opt.overlay == undefined) ? true : false;
  this.ifPos = (opt.ifPos == undefined) ? true : false;
}

popup.prototype = {
  //show method(start)
  show: function(){
    //打开“覆盖层”
    if(this.overlay){
      openAreaOverlay();
    }

    //一种模拟APP的弹出行为，
    if(this.obj.hasClass('popup-action-view-wrap')){
      this.obj.addClass('popup-action-view-wrap--on');
    }else if(this.ifPos){
      //显示
      this.obj.fadeIn();

      //根据弹出框的宽高，设置其左右位置
      this.obj.css({
       'width':this.obj.width() + 'px',
       'left':'50%',
       'top':'40%',
       'margin-left':'-' + this.obj.width()/2 + 'px',
       'margin-top':'-' + this.obj.height()/2 + 'px'
      });
    }else{
      //显示
      this.obj.fadeIn();
    }
  },
  // show method(end)

  // none method(start)
  none: function(){
    this.obj.removeClass('popup-action-view-wrap--on').removeAttr('style');
    areaOverlay.addClass('none');
  }
  // none method(end)
}
*/
/*
var myPopup = new popup({
  obj : '#popup1',
  overlay : 'hied'
}).popup();
*/


//点击“关闭”按钮
$('.popup__close').on('click', function(e){
  $(this).parents('.popup-wrap').removeClass('popup-action-view-wrap--on').removeAttr('style');
  areaOverlay.addClass('none');

  e.preventDefault(); //阻止默认行为，但在tap事件下無效
})


//循环点击，显示弹出框
$('.go-popup').each(function(i){
  $(this).click(function(e){
    //alert($(this).index());
    popup($('#popup'+(i+1))); //索引号从0计起
    e.preventDefault();
  })
});



/*----------------------------------------------------- 自定义弹出框(end) --*/


/*
$('.fixed-top input[type="search"]').focus(function(){
  $('.fixed-top').css('top', 0);
})
*/



/*用户输入*/
var inputs = $('form .inp');
var btnSubmit = $('button[type="submit"]');
inputs.on('keypress', function(){
  if($(this).val() != ''){
    btnSubmit.removeAttr('disabled');
  }
});

inputs.on('blur', function(){
  if($(this).val() == ''){
    btnSubmit.attr('disabled', 'disabled');
  }
})

//回顶部(start)
var btnGoTop = $('#btnGoTop');

$window.scroll(function(){
  //_window = $(this);
  windowScrollTop = $window.scrollTop();

  if( windowScrollTop > 640 ){
    btnGoTop.show();
  }else{
    btnGoTop.removeAttr('style');
  }
})

btnGoTop.click(function(e){
  $('body').scrollTop(0);

  e.preventDefault();
})

//回顶部(end)


