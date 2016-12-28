// 主函数
var M = function(){
	if (!(this instanceof M)) {
 		return new M();
 	}
}

var m = new M();
M.prototype.test = function(){
	doc.write("你现在的环境是__ENV__");
}

m.test();