let stopwordStr = `
a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your"
`;
var stopwords = new Set();
stopwordStr.replace(/\n|\r/g, "").split(",").forEach(function (r) {
    stopwords.add(r);
});

exports.getRegexForSearch = function (keywords) {
    keywords = decodeURIComponent(keywords);
    if (!keywords) return /.*/;
    var regex = keywords.split(" ")
        .filter((s) => s.length)
        .filter((s) => !stopwords.has(s))
        .join("|");
    if (!regex.length) return null;
    return new RegExp(regex, 'i');
};

exports.pagination = function (list, start, limit = 10) {
    if (!start) return list;
    start = Math.max(0, start);
    limit = limit < 0 ? 10 : limit;
    return list.slice(start, start + limit);
};

