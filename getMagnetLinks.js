(function () {
    var DEBUG = true;
    var records = [];
    var siteType = getHttpType();
    function getHttpType() {
        var thisURL = window.location.href;
        if ((/^(\s)*(http:\/\/)?(www\.)?torrentkitty\.com/i).test(thisURL)) {
            return 1;
        } else if ((/^(\s)*(http:\/\/)?(www\.)?btdigg\.org/i).test(thisURL)) {
            return 2;
        } else {
            return 3;
        }
    }

    function getMagnetName(megnetNode) {
        try {
            switch (siteType) {
                case 1:
                    //torrentkitty
                    var tds = megnetNode.parentNode.parentNode.childNodes;
                    for (var i = 0; i < tds.length; i++) {
                        if (tds[i].hasAttribute("class") && 
                            tds[i].getAttribute("class") == "name") {
                            return tds[i].innerText;
                        }
                    }
                    break;
                case 2:
                    //btdigg
                    break;
                default:

                    break;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
        return null;
    }

    function getLinksCommon() {
        records.splice(0);
        var links = document.getElementsByTagName("a");
        var count = 0;
        for (var i = 0; i < links.length; i++) {
            if (links[i].href.length != 0) {
                var href = links[i].href;
                if (href && href.toLowerCase().indexOf("magnet:?xt=urn:btih:") != -1) {
                    count++;
                    var record = {
                        name: getMagnetName(links[i]) ||
                            count + "." + links[i].innerText,
                        magnet: href
                    };
                    records.push(record);
                }
            }
        }
        return count;
    }

    getLinksCommon();
    chrome.extension.sendRequest(records);
})();
