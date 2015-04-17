(function ($, win, doc, math, undefined) {
    "use strict";
    var PLUGIN_NAME = "primePage";
    var PrimePage = function (element, options) {
        this.element = element;
        this.$element = $(element);
        this.defaults = $.extend({}, PrimePage.defaults);
        this.options = $.extend({}, PrimePage.defaults, $.isPlainObject(options) ? options : {});

        // 页面总共需要多少页码
        this.pageTotal = null;
        // 计算相对值
        this.offset = null;
        this.slice = null;
        // 记录当前页码
        this.pageCurrent = null;
        
        this.init();
    };
    // 4. 组件的默认配置值
    PrimePage.defaults = {
        pageNum: 7, // 不管多少页码，每次最多显示7个： 1 2 3 4 5 6 7 | 2 3 4 5 6 7 8 | 3 4 5 6 7 8 9 | 4 5 6 7 8 9 10 | 页码数量都是7个     
        dataTotal: 23, // 目标数据总量
        pagePerAssign: 2, // 每一页分配多少条数据
        pageTarget: 1, // 目标页码 , 也用于初始化的时候，显示第几页
        isShowPage: false,// 是否显示首页和尾页
        isLocal: false , // 是否是本地数据
        text: {
            first: "首页",
            last: "尾页",
            prev: "上一页",
            next: "下一页"
        },
        template: {
            wrap: "<ul>{%ITEM%}</ul>",
            item: "<li data-type='primepage' class='{%ACTIVE%}'><a href='javascript:;'>{%VALUE%}</a></li>",
            around: "<li data-type='{%TYPE%}'><a href='javascript'>{%TEXT%}</a></li>"
        }
    };

    PrimePage.prototype = {
        Constructor: PrimePage,
        // 计算首尾页码
        calcHeadTail: function (pageTarget) {

            var options = this.options;
            var pageTarget = +pageTarget || options.pageTarget;// pageTarget 前面的加号，是为了转换字符串为整型
            //  纠正实际生成的页码 小于默认的 pageTotal
            if( options.pageNum > this.pageTotal ){ // 比如期望是显示 1 2 3 4 ，但是实际总页码才2，那么就要修正最大页码为实际页码
                options.pageNum = this.pageTotal;
            }
            
            if (pageTarget - this.offset <= 1) {
                this.pageStart = 1;
                this.pageEnd = options.pageNum;
            }
            else {
                if (pageTarget + this.offset < this.pageTotal) {
                    this.pageStart = pageTarget - this.offset;
                    this.pageEnd = pageTarget + this.offset+ this.slice; //偶数要加一
                }
                else {
                    //debugger;
                    this.pageStart = this.pageTotal - options.pageNum + 1;
                    this.pageEnd = this.pageTotal;
                }
            }
        },
        // 根据起始页码，创建分页代码, 然后插入到分页容器，$element里面
        // 如果有 参数，那么会添加active类
        createPage: function (pageNum) { 
            var i;
            var m;
            var item = "";
            var tag = "";
            var around = "";
            var template = this.options.template;
            //debugger;
            for (i = this.pageStart; i <= this.pageEnd; i += 1) {
                item += template.item.replace("{%VALUE%}", i).replace("{%ACTIVE%}", (i === +pageNum) ? "active" : "");
            }
            // 加入上一页，和下一页
            item = template.around.replace("{%TEXT%}", this.options.text.prev).replace("{%TYPE%}", "prev")
                    + item +
                    template.around.replace("{%TEXT%}", this.options.text.next).replace("{%TYPE%}", "next");
            // 加入首页和尾页
            if (this.options.isShowPage) {
                item = template.around.replace("{%TEXT%}", this.options.text.first).replace("{%TYPE%}", "first")
                        + item +
                        template.around.replace("{%TEXT%}", this.options.text.last).replace("{%TYPE%}", "last");
            }

            tag = template.wrap.replace("{%ITEM%}", item);

            this.element.innerHTML = tag;
            //console.log(this);
        },
        // 绑定页码事件
        // 1. 根据点击的value，重新生成页码，然后插入$element
        // 2. 触发回调事件
        bindEvent: function (num) {
            var page = "[data-type=primepage]";
            var prev = "[data-type=prev]";
            var next = "[data-type=next]";
            var first = "[data-type=first]";
            var last = "[data-type=last]";

            this.$element.on("click", page, $.proxy(this, "fireCallBack"));
            this.$element.on("click", prev, $.proxy(this, "firePrev"));
            this.$element.on("click", next, $.proxy(this, "fireNext"));

            this.$element.on("click", first, $.proxy(this, "fireFirst"));
            this.$element.on("click", last, $.proxy(this, "fireLast"));
            // 只有本地才会自动触发
            if (num && this.options.isLocal) {
                $(page, this.$element).eq(num - 1).trigger("click");
            }
            // 初始化的时候，触发哪个页码的数据

            // this.$element.find("ul li").eq(5).trigger("click") 为什么不触发pageClick？读源码
        },
        firePrev: function (event) {
            var num = this.pageCurrent;

            (!--num) && (num = -~num);
            this.fireHandler(num);
            event.preventDefault();
        },
        fireNext: function (event) {
            var num = this.pageCurrent;

            if (++num >= this.pageTotal) {
                num = this.pageTotal;
            }

            this.fireHandler(num);
            event.preventDefault();
        },
        fireFirst: function (event) {
            this.fireHandler(1);
            event.preventDefault();
        },
        fireLast: function (event) {
            this.fireHandler(this.pageTotal);
            event.preventDefault();
        },
        fireCallBack: function (event) {
            //console.log(this);
            var num = +$(event.target).text(); // 弄个加号，字符串转为int
            // 如果在当前页，重复点击，那么，就阻止它
            this.fireHandler(num);
//            console.log(event.delegateTarget); // this.$element
//            console.log(event.currentTarget ); // [data-type=primepage]
//            console.log(event.target ); // li or a 

        },
        fireHandler: function (num) {
            if (this.pageCurrent === num) {
                return;
            }
            // 保存当前页码
            this.pageCurrent = num;
            // 重新计算起始页码
            this.calcHeadTail(num);
            // 根据重新计算好的页码，重新生成代码插入容器
            this.createPage(num);
            // 绑定 回调事件
            
            var e = $.Event('pageClick', {
                pageCurrent: num,
                pagePerAssign: this.options.pagePerAssign
            });
            this.$element.trigger(e);
        },
        init: function () {
            // 1. 根据数据总量和最大页码数，算出总共有多少页：
            var options = this.options;
            this.pageTotal = math.ceil(options.dataTotal / options.pagePerAssign);
            //this.offset = math.floor(options.pageNum / 2);
            this.slice = options.pageNum%2 ? 0 : 1; // 如果为偶数，那么需要为1，是为了给计算当前尾页+1；
            this.offset = math.floor(options.pageNum / 2) + (this.slice ? -1 : 0); //偶数的offset需要减一
            //alert(this.slice);

            this.calcHeadTail();
            // 创建分页代码的时候，并让第一页，添加active类
            this.createPage(1);
            this.bindEvent(1);// 加参数且是本地数据会自动点击
            // 当前页码默认为1
            this.pageCurrent = 1;
            //debugger;
        }
    };
    $.fn[PLUGIN_NAME] = function (options) {
        var that = null;
        var method = null;
        var args = [].slice.call(arguments, 1);
 
        this.each(function () {
            var $this = $(this);
            var data = $this.data(PLUGIN_NAME);

            if (!data) {
                $this.data(PLUGIN_NAME, (data = new PrimePage(this, options)));
            }

            if (typeof options === "string" && typeof (method = data[options]) === "function") {
                that = method.apply(data, args);
            }
        });

        return (that ? that : this);
    }

})(jQuery, window, document, Math);
