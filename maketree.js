var data = {
    "lemmata" : [
        {
            "color": "indigo",
            "langs": [
                {"l":"pio", "w":"*pH₂tér", "en":"", "de":"", "fr":""},
                {"l":"pge", "w":"*fader-", "en":"", "de":"", "fr":""},
                {"l":"en", "w":"father", "en":"", "de":"", "fr":""},
                {"l":"de", "w":"Vater", "en":"", "de":"", "fr":""},
                {"l":"fr", "w":"père", "en":"", "de":"", "fr":""},
                {"l":"es", "w":"padre", "en":"", "de":"", "fr":""},
                {"l":"la", "w":"pater", "en":"", "de":"", "fr":""},
                {"l":"uk", "w":"батько", "en":"Batko", "de":"Batko", "fr":"Batko"},
                {"l":"el", "w":"πατέρας", "en":"patéras", "de":"patéras", "fr":"patéras"},
                {"l":"ga", "w":"athair", "en":"", "de":"", "fr":""},
                {"l":"fa", "w":"پدر", "en":"pedr", "de":"pedr", "fr":"pedr"}
            ]
        },
        {
            "color": "orange",
            "langs": [
                {"l":"pio", "w":"*k̂won-", "en":"", "de":"", "fr":""},
                {"l":"pge", "w":"*hunda-", "en":"", "de":"", "fr":""},
                {"l":"en", "w":"hound", "en":"", "de":"", "fr":""},
                {"l":"de", "w":"Hund", "en":"", "de":"", "fr":""},
                {"l":"fr", "w":"chien", "en":"", "de":"", "fr":""},
                {"l":"la", "w":"canis", "en":"", "de":"", "fr":""},
                {"l":"el", "w":"κύων", "en":"kúōn", "de":"kúōn", "fr":"kúōn"},
                {"l":"cy", "w":"ci", "en":"", "de":"", "fr":""}
            ]
        },
        {
            "color": "firebrick",
            "langs": [
                {"l":"pio", "w":"*k̂erd-", "en":"", "de":"", "fr":""},
                {"l":"pge", "w":"*herton-", "en":"", "de":"", "fr":""},
                {"l":"en", "w":"heart", "en":"", "de":"", "fr":""},
                {"l":"de", "w":"Herz", "en":"", "de":"", "fr":""},
                {"l":"fr", "w":"cœur", "en":"", "de":"", "fr":""},
                {"l":"es", "w":"corazón", "en":"", "de":"", "fr":""},
                {"l":"la", "w":"cor", "en":"", "de":"", "fr":""},
                {"l":"el", "w":"καρδιά", "en":"kardiá", "de":"kardiá", "fr":"kardiá"},
                {"l":"ru", "w":"сердце", "en":"serdce", "de":"serdce", "fr":"serdce"}
            ]
        }
    ],
    "tree" : {
        "langs" : [
            {
                "l": "pio",
                "langs": [
                    { 
                        "l": "pce",
                        "langs": [
                            {"l": "ga"}, {"l": "cy"}
                        ]                    
                    },
                    {
                        "l": "la",
                        "langs": [
                            {"l": "fr"}, {"l": "es"}
                        ]                    
                    },
                    {
                        "l": "pge",
                        "langs": [
                            {"l": "en"}, {"l": "de"}
                        ]
                    },            
                    {
                        "l": "psl" ,
                        "langs": [
                            {"l": "uk"}, {"l": "ru"}
                        ]
                    },
                    {"l": "el"},            
                    {"l": "fa"}
                ]
            }
        ]
    },
    "langs" : {
        "pio" : {"en":"Indoeropean", "de":"Indoeuropäisch", "fr":"Indoeuropéen"},
        "pge" : {"en":"Proto-Germanic", "de":"Urgermanisch", "fr":"Proto-germanique"},
        "en" : {"en":"English", "de":"Englisch", "fr":"Anglais"},
        "de" : {"en":"German", "de":"Deutsch", "fr":"French"},
        "fr" : {"en":"", "de":"", "fr":""},
        "es" : {"en":"", "de":"", "fr":""},
        "la" : {"en":"", "de":"", "fr":""},
        "uk" : {"en":"Batko", "de":"Batko", "fr":"Batko"},
        "el" : {"en":"patéras", "de":"patéras", "fr":"patéras"},
        "ga" : {"en":"", "de":"", "fr":""},
        "fa" : {"en":"pedr", "de":"pedr", "fr":"pedr"},
        "cy" : {"en":"", "de":"", "fr":""},
        "ru" : {"en":"", "de":"", "fr":""},

    }
}

TRUNK_LEMMATA = 3;
THREAD_DIST = 50;
TRUNK_HEIGHT = 200;
CROWN_SIZE = 200;
TREE_SPREAD_DEG = 200;

var svg;
var defs;

function getRandInt(min, max)
{
    return Math.floor(Math.random() * (max - min)) + min;
}

function getAllLemmataForLang(lang)
{
    lemmata = []
    for (var i=0;i<data.lemmata.length;i++) 
    {
        lemma = data.lemmata[i]
        for (var j=0;j<lemma.langs.length;j++)
        {
            if (lemma.langs[j].l == lang)
            {
                lemma.langs[j].color = lemma.color;
                lemmata.push(lemma.langs[j]);
            }
        }            
    }
    return lemmata;
}

function getRandomLemmataForLang(lang, minCount)
{
    lemmata = getAllLemmataForLang(lang);
    if (minCount >= lemmata.length)
        return lemmata;

    //count = getRandInt(minCount, lemmata.length + 1)
    count = minCount;
    randomLemmata = []
    for (var i=0;i<count;i++)
    {
        var lemma = lemmata.splice(getRandInt(0, lemmata.length), 1);
        randomLemmata.push(lemma[0]);
    }
    return randomLemmata;
}

function fillTreeWithLemmata(branch, depth)
{
    var neededLemmata = Math.max(TRUNK_LEMMATA - depth, 1);
    
    //branch.lemmata = getRandomLemmataForLang(branch.l, neededLemmata);
    branch.lemmata = getAllLemmataForLang(branch.l);
    
    if (!branch.langs) return;
    for (var i=0;i<branch.langs.length;i++)
    {        
        fillTreeWithLemmata(branch.langs[i], depth + 1);
    }    
}

function getLeaves(branch) {
    var leaves = [];
    if (!branch.langs) return [branch];
    for (var i=0;i<branch.langs.length;i++)
    {
        tip = getLeaves(branch.langs[i]);
        leaves = leaves.concat(tip);
    }
    return leaves;
}

function drawDot(x, y)
{
    var dot = svgElement('circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    svg.appendChild(dot);
}

function calcLeavesPos(branch) {
    var leaves = getLeaves(branch);
    var degDistance = TREE_SPREAD_DEG / (leaves.length - 1);
    for (var i=0;i<leaves.length;i++) {
        var degPos = (-TREE_SPREAD_DEG / 2 + degDistance * i) / 180 * Math.PI;
        var x = Math.sin(degPos)*CROWN_SIZE+CROWN_SIZE;
        var y = CROWN_SIZE-Math.cos(degPos)*CROWN_SIZE;
        leaves[i].pos = [x, y];   
        drawDot(x,y);     
    }
}

function calcBranchPos(branch) {
    var x = 0;
    var y = 0;
    var i = 0;
    if (!branch.langs) return [branch.pos];
    while (i<branch.langs.length)
    {
        calcBranchPos(branch.langs[i]);
        x += branch.langs[i].pos[0];
        y += branch.langs[i].pos[1];
        i++;
    }
    i++;
    if (branch.pos) return [branch.pos];
    x += data.tree.pos[0];
    y += data.tree.pos[1];
    branch.pos = [x/i, y/i];

    drawDot(branch.pos[0], branch.pos[1]);
}

function calcTreePos()
{
    calcLeavesPos(data.tree);
    data.tree.pos = [CROWN_SIZE, CROWN_SIZE+TRUNK_HEIGHT]
    calcBranchPos(data.tree);
}

function getDistBetweenContinuousThreads(branch, threadCountPerBranch)
{
    var distBetweenThreads = branch.langs.length*threadCountPerBranch/(threadCountPerBranch+1);
    return Math.max(Math.floor(distBetweenThreads), 1);
}

function fillUpThreads(branch, continuousThreads, threadCountPerBranch, dx, degDistance)
{
    for(var i=continuousThreads.length;i<threadCountPerBranch;i++)
    {
        continuousThreads.push([[branch, dx, i]]);
        dx += degDistance;
    }
    return continuousThreads;   
}

function isThreadToBeContinued(i, j, continuousThreads, threadCountPerBranch, distBetweenContinuousThreads)
{
    return (i*threadCountPerBranch+j) % distBetweenContinuousThreads == 0 && continuousThreads.length < threadCountPerBranch+1;
}

function drawBranches(branch, threadCountPerBranch)
{
    var degDistance = TREE_SPREAD_DEG/10;
   
    var continuousThreads = [];
    if (!branch.langs) 
    {
        return fillUpThreads(branch, continuousThreads, threadCountPerBranch, 0, degDistance);         
    }
    
    var distBetweenContinuousThreads = getDistBetweenContinuousThreads(branch, threadCountPerBranch);
    var dx = -degDistance * (threadCountPerBranch*branch.langs.length-1) / 2;

    for (var i=0;i<branch.langs.length;i++)
    {
        var threads = drawBranches(branch.langs[i], Math.max(threadCountPerBranch-1, 1), dx);
        
        for(var j=0;j<threads.length;j++)
        {
            threads[j].push([branch, dx, j]);
            if (branch != data.tree && isThreadToBeContinued(i, j, continuousThreads, threadCountPerBranch, distBetweenContinuousThreads))
            {
                continuousThreads.push(threads[j]);
            }
            else
            {
                drawThread(threads[j]);
            }
            dx += degDistance;
        }
    }
    return fillUpThreads(branch, continuousThreads, threadCountPerBranch, dx, degDistance);
}

function toSvgDString(data, cmds)
{
    str = '';
    for(var i=0;i<data.length;i++)
    {
        str += cmds[i] + ' ' + Math.round(data[i][0]) + ' ' + Math.round(data[i][1]) + ' ';
    }
    return str;
}

function orderBranch(thread)
{
    if (thread[0][0].pos[0] > thread[thread.length-1][0].pos[0])
    {
        thread.reverse();
        return true;
    }
    return false;
}

function applyOffset(thread, i)
{
    var deg = thread[i][1]/180*Math.PI;
    var x = Math.sin(deg)*THREAD_DIST;
    var y = -Math.cos(deg)*THREAD_DIST;
    
    var newX = thread[i][0].pos[0]+x;
    var newY = thread[i][0].pos[1]+y;

    return [newX, newY];
}

function calcPathCoord(thread, i)
{
    var dStr = '';
    if (i > 0)
    {   
        var next = applyOffset(thread, i);
        var x = applyOffset(thread, i-1)[0];
        x = next[0]+(x-next[0])/2;
        dStr = toSvgDString([[x,next[1]],next], ['Q', ',']);
    }
    else
    {
        dStr = toSvgDString([applyOffset(thread, 0)], ['M']);
    }
    return dStr;
}

function makePath(threadId)
{
    var path = svgElement('path');
    path.setAttribute('id', 'i'+threadId);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'black');
    defs.appendChild(path);

    return path;
}

function makeTextPath(thread, threadId)
{
    var text = svgElement('text');
    var textPath = svgElement('textPath');
    
    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#i'+threadId);
    textPath.setAttribute('spacing', 'auto');
    if (!orderBranch(thread))
    {
        textPath.setAttribute('startOffset', '100%');
        textPath.setAttribute('style', 'text-anchor:end');
    }

    text.appendChild(textPath);
    svg.appendChild(text);

    return textPath;
}

function makeTspan(thread, i)
{
    var lemma = thread[i][0].lemmata[thread[i][2]];
    var span = svgElement('tspan');
    span.setAttribute('fill', lemma.color);
    span.setAttribute('dy', '2');
    span.innerHTML = '&nbsp;&nbsp;&nbsp;'+lemma.w;

    return span;
}

threadCounter = 0;
function drawThread(thread)
{    
    var path = makePath(threadCounter);
    var textPath = makeTextPath(thread, threadCounter);
    
    var dStr = '';
    for (var i=0;i<thread.length;i++)
    {
        dStr += calcPathCoord(thread, i);
        if (thread[i][0].lemmata == undefined || thread[i][0].lemmata.length <= thread[i][2]) continue;
        var span = makeTspan(thread, i);
        textPath.appendChild(span);
    }

    path.setAttribute('d', dStr);    
    
    threadCounter++;
    return textPath;
}

function svgElement(name)
{
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function initSvg()
{
    svg = svgElement('svg');
    //svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', CROWN_SIZE*2);
    svg.setAttribute('height', CROWN_SIZE+TRUNK_HEIGHT);
    defs = svgElement('defs');

    svg.appendChild(defs);
    //defs = svg;
    document.body.appendChild(svg);
}

function drawTree()
{
    initSvg();
    fillTreeWithLemmata(data.tree.langs[0], 0);
    calcTreePos();
    console.log(data.tree);
    
    drawBranches(data.tree, TRUNK_LEMMATA, 0);
}


