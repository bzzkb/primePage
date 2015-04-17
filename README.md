# primePage.js

### 基于jquery的分页组件

    ####使用方法：

    $(".page").primePage({
        // 不管多少页码，每次最多显示7个:
        // 1 2 3 4 5 6 7 | 2 3 4 5 6 7 8 | 3 4 5 6 7 8 9 | 4 5 6 7 8 9 10      
        ageNum: 7, 
        // 目标数据总量
        dataTotal: 23, 
        // 每一页分配多少条数据
        pagePerAssign: 2, 
        // 目标页码 , 也用于初始化的时候，显示第几页
        pageTarget: 1 
    });

    /* 每次点击页码的时候，做的回调，传回
     * event.pageCurrent ： 当前页码
     * event.pagePerAssign：每页分配的数据
     * 
     */

    $(".page").on("pageClick", function (event) {
   
    });
