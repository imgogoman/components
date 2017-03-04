/*————————————————————————————————————————————————————
  Date:           2017.03.04
—————————————————————————————————————————————————————*/


//-----------------------------------------------------内容切换: switchover(start)
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

    opt.currentNavigator.addClass(opt.navigatorActiveClass).siblings().removeClass(opt.navigatorActiveClass);
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
