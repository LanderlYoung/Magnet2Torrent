var M2B = {
    mgnInp: null,
    linkA: null,
    selectVal: null,
    header: null,
    warning:null,
    aboutText: null,
    aboutTag: null,
    linksTable: null,
    tableDiv: null,
    breath_but: null,
    records: [],
    initEle: function () {
        M2B.mgnInp = document.getElementById('magnet');
        M2B.linkA = document.getElementById('targetLink');
        M2B.selectVal = document.getElementById('selectServer');
        M2B.header = document.getElementById("header");
        M2B.warning = document.getElementById("warning");
        M2B.aboutTag = document.getElementById("aboutTag");
        M2B.aboutText = document.getElementById("aboutText");
        M2B.linksTable = document.getElementById("linksTable");
        M2B.tableDiv = document.getElementById("tableDiv");
        M2B.breath_but = document.getElementById("breath-button");
    },
    initRecords: function (records) {
        try {
            for (var i = 0 ; i < records.length ; i++) {
                M2B.records.push(records[i]);
            }
        } catch (e) {

        }
    },
    getURL: function (mgnStr) {
        var select = M2B.selectVal.value;
        try {
            mgnStr = mgnStr.replace(/^\s+/, "");
            if (mgnStr.length == 0) {
                throw "empty input";
            }
            var a1 = mgnStr.indexOf("xt=urn:btih:");
            if (a1 == -1)
                throw "Broken Magnet link!";
            var a2 = mgnStr.indexOf("&", a1);
            a1 += 12;
            if (a2 == -1) {
                mgnStr = mgnStr.substring(a1);
            } else {
                mgnStr = mgnStr.substring(a1, a2);
            }
            if (mgnStr.length == 0)
                throw "Broken Magnet link!";
            mgnStr = mgnStr.toUpperCase();
            var queryURL;
            switch (select) {
                case "2":
                    queryURL = M2B.torCacheConvert(mgnStr);
                    break;
                case "3":
                    queryURL = M2B.zoinkConvert(mgnStr);
                    break;
                default:
                    queryURL = M2B.thunderConvert(mgnStr);
            }
            //console.log(queryURL);
            return queryURL;
        } catch (e) {
            if (e != "empty input") {
                return -1;
            }
            console.log(e);
            return 0;
        }
    },
    startConvert: function () {
        if (M2B.mgnInp == null)
            M2B.initEle();
        var mgnStr = M2B.mgnInp.value;

        var queryURL = M2B.getURL(mgnStr);
        if (queryURL == -1) {
            M2B.showWarning("Bad magnet Link!");
        } else if (typeof queryURL == "string") {
            M2B.linkA.href = queryURL;
            M2B.linkA.target = "_blank";
            M2B.linkA.style.display = 'block';
            M2B.downloadURL(queryURL);
            //M2B.getDownloadFunc(queryURL)();
        } else {
            //empty input. do nothing
        }
    },
    clearInputBox: function () {
        if (M2B.mgnInp == null)
            M2B.initEle();
        M2B.mgnInp.value = "";
        M2B.linkA.style.display = 'none';
        M2B.linkA.href = '';
    },
    downloadURL: function (btUTL, btfilename) {
        var fName = btfilename || null;
        if (fName != null) {
            fName += ".torrent";
        }
        chrome.downloads.download({
            url: btUTL,
            filename: fName
        }, function (id) {
            if (typeof id == "undefined") {
                M2B.showWarning("Can't find torrent in selected server!\nid:" + id);
            } else {
                M2B.showWarning("Starting download!",
                    "rgb(255,106,0)");
                }
        });
    },
    getDownloadFunc : function(btURL, btfilename) {
        return function () {
            if (typeof btfilename != "undefined")
                return M2B.downloadURL(btURL, btfilename);
            else
                return M2B.downloadURL(btURL);
        };
    },
    thunderConvert: function (mgnHash) {
        var thunderQuerySite = "http://bt.box.n0808.com/";
        var head = mgnHash.slice(0, 2);
        var tail = mgnHash.slice(mgnHash.length - 2, mgnHash.length);
        var queryURL = thunderQuerySite + head +
        "/" + tail + "/" + mgnHash + ".torrent";
        return queryURL;
    },
    torCacheConvert: function (mgnHash) {
        var querySite = "https://torcache.net/torrent/";
        return querySite + mgnHash + ".torrent";
    },
    zoinkConvert: function (mgnHash) {
        var querySite = "https://zoink.it/torrent/";
        return querySite + mgnHash + ".torrent";
    },
    showWarning: function (warnMsg, warnColor) {
        if (M2B.header == null)
            M2B.initEle();
        var textColor = warnColor || "red";

        var displayDuration = 500;

        var header = M2B.header;
        var warningText = M2B.warning;
        if (typeof warnMsg != "undefined")
            warningText.innerHTML = warnMsg;
        header.style.display = "none";
        warningText.style.display = "block";
        warningText.style.color = textColor;
        warningText.style.opacity = 0.9;
        setTimeout(function () {
            var fadeDuration = 500;
            var steps = 70;
            var stepDuration = fadeDuration / steps;
            var stepLen = 0.7 / steps;
            var intervalHandle = setInterval(function () {
                warningText.style.opacity =
                warningText.style.opacity - stepLen;
            }, stepDuration);
            setTimeout(function () {
                clearInterval(intervalHandle);
                warningText.style.opacity = "0.9";
                header.style.display = "block";
                warningText.style.display = "none";
            }, stepDuration * steps);
        }, displayDuration);
    },
    displayMagnetLinks : function() {
        if (M2B.linksTable == null)
            M2B.initEle();
        var table = M2B.linksTable;
        function createTR(no, URL, name) {
            var tr = document.createElement("tr");
            var tdNo = document.createElement("td");
            var tdLink = document.createElement("td");
            var tdOpen = document.createElement("td");
            tdNo.appendChild(document.createTextNode(no + ""))
            tdNo.setAttribute("class", "no");
            var text = name;

            tdLink.appendChild(document.createTextNode(text));
            tdLink.setAttribute("class", "name");
            var a = document.createElement("a");
            a.appendChild(document.createTextNode("Open"));
            a.href = "#";
            a.addEventListener("click",
                M2B.getDownloadFunc(URL, name));
            tdOpen.appendChild(a);
            tdOpen.setAttribute("class", "open");

            var tipDiv = document.createElement("div");
            tipDiv.appendChild(document.createTextNode(no +
                ". " + text));
            var div = document.createElement("div");
            div.appendChild(tipDiv);
            tdNo.appendChild(div);

            tr.appendChild(tdNo);
            tr.appendChild(tdLink);
            tr.appendChild(tdOpen);


            return tr;
        }

        if (M2B.records.length > 0) {
            M2B.tableDiv.style.display = "block";
            var records = M2B.records;
            var count = 1;
            var tbody = document.createElement("tbody");
            for (var i = 0; i < records.length; i++) {
                var URL = M2B.getURL(records[i].magnet);
                if(typeof URL == "string") {
                    tbody.appendChild(
                        createTR(count, URL, records[i].name));
                    count++;
                }
            }
            table.appendChild(tbody);
        }
    },
   jellyJump: function(obj) {
        var s = 1.2;
        var displayed = obj.style.display == "block";
        if (displayed) {
            //disappear
            //obj.style.height = "0px";
            var h = obj.scrollHeight;
            var originHeight = h;
            var oh = 0;
            var dipTimes = 0;
            var alpha = Math.PI / 2;
            var step = Math.PI / 40;

            function scrollUp() {
                if (dipTimes < 2) {
                    if (alpha < Math.PI) {
                        oh = h*Math.sin(alpha);
                        obj.style.height = oh + "px";
                        alpha += step;
                    } else {
                        alpha = 0;
                        h /= 3;
                        step = Math.PI / 20;
                        dipTimes++;
                    }
                } else {
                    obj.style.display = "none";
                    window.clearInterval(IntervalId);
                }
            }
            var IntervalId = window.setInterval(scrollUp, 10);
        } else {
            //scroll down;
            obj.style.display = "block";
            var h = obj.scrollHeight;
            var oh = 0;
            //console.log("scrollDown to " + h + "px");
            obj.style.height = "0px";
            

            var jumpHeight = h - oh;
            var originHeight = jumpHeight;
            var alpha = Math.PI / 2;
            var dropTimes = 0;
            function scrollDown() {
                if (dropTimes < 2) {
                    if (alpha < Math.PI) {
                        oh = jumpHeight * Math.sin(alpha);
                        obj.style.height = (originHeight - oh) + "px";
                        alpha += Math.PI / 40;
                    } else {
                        alpha = 0;
                        jumpHeight /= 2;
                        dropTimes++;
                    }
                } else {
                    obj.style.height = originHeight + "px";
                    window.clearInterval(IntervalId);
                }
            }
            //600ms
            var IntervalId = window.setInterval(scrollDown, 10);
        }
 

    },
    breath_butEvent: function() {
        if (M2B.breath_but == null) {
            M2B.initEle();
        }
        var bre = M2B.linksTable;
        if (true) {
            //action 1
            if (bre.style.display != "block") {
                bre.style.display = "block";
            } else {
                bre.style.display = "none";
            }
        } else {
            //action 2
            M2B.jellyJump(bre);
        }
    },
    aboutTagAction: function () {
        if (M2B.aboutTag == null)
            M2B.initEle();
        var obj = M2B.aboutText;
        M2B.jellyJump(obj);
    },
    reDrawLinks: function () {
        var i = 0;
        var trs = M2B.linksTable.childNodes;
        function clearTable() {
            if (trs == null)
                return;
            while (i < trs.length) {
                if ((/tbody/i).test(trs[i].nodeName)) {
                    M2B.linksTable.removeChild(trs[i]);
                    return true;
                } else {
                    i++;
                }
            }
            return false;
        }
        M2B.showWarning("switching server", "rgb(255,106,0)");
        if (clearTable()) {
            M2B.displayMagnetLinks();
        }
    },
    addEventListeners: function () {
        document.getElementById("convertButton").addEventListener("click", M2B.startConvert);
        document.getElementById("clearButton").addEventListener("click", M2B.clearInputBox);
        document.getElementById("aboutTag").addEventListener("click", M2B.aboutTagAction);
        document.getElementById("breath-button").addEventListener("click", M2B.breath_butEvent);
        document.getElementById("selectServer").addEventListener(
            "change", M2B.reDrawLinks);
    }
};

(function () {
    window.onload = function () {
        var mgnBox = document.getElementById("magnet");
        mgnBox.addEventListener("keydown", function (evt) {
            if (evt.keyCode == 13) { // enter
                M2B.startConvert();
            }
        });

        M2B.addEventListeners();

        chrome.windows.getCurrent(function (currentWindow) {
            chrome.tabs.query({
                active: true,
                windowId: currentWindow.id
            }, function (activeTabs) {
                chrome.tabs.executeScript(
                    activeTabs[0].id, {
                        file: 'getMagnetLinks.js',
                        allFrames: false
                    });
            });
        });

        chrome.extension.onRequest.addListener(
         function (records) {
             if (typeof records == "object") {
                 M2B.initRecords(records);
                 M2B.displayMagnetLinks();
             } else {
                 console.log(records);
             }
         });
    }
})();

