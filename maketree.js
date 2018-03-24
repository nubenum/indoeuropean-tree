var svg;
var defs;

function shuffleArray(arr) {
    for (var i=arr.length-1;i>0;i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
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

function getRandomLemmataForLang(lang)
{
    lemmata = getAllLemmataForLang(lang);
    shuffleArray(lemmata);
    return lemmata;
}

function fillTreeWithLemmata(branch)
{
    branch.lemmata = getRandomLemmataForLang(branch.l);
    
    if (!branch.langs) return;
    for (var i=0;i<branch.langs.length;i++)
    {        
        fillTreeWithLemmata(branch.langs[i]);
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

function calcLeavesPos(branch) {
    var leaves = getLeaves(branch);
    var degDistance = TREE_SPREAD_DEG / (leaves.length - 1);
    for (var i=0;i<leaves.length;i++) {
        var degPos = (-TREE_SPREAD_DEG / 2 + degDistance * i) / 180 * Math.PI;
        var x = Math.sin(degPos)*CROWN_SIZE+CROWN_SIZE;
        var y = CROWN_SIZE-Math.cos(degPos)*CROWN_SIZE;
        leaves[i].pos = [x, y];   
        drawDot(x,y,'black');     
    }
}

function euklidianDist(pos1, pos2)
{
    return Math.sqrt(
        Math.pow(pos1[0]-pos2[0], 2) + 
        Math.pow(pos1[1]-pos2[1], 2)
    );
}

function calcBranchPos(branch)
{
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
    if (!branch.pos)
    {
        x += data.tree.pos[0];
        y += data.tree.pos[1];
        branch.pos = [x/i, y/i];
    }    

    for(i=0;i<branch.langs.length;i++)
    {
        branch.langs[i].dist = euklidianDist(branch.langs[i].pos, branch.pos);
    }

    drawDot(branch.pos[0], branch.pos[1], 'black');
}

function calcTreePos()
{
    calcLeavesPos(data.tree);
    data.tree.pos = [CROWN_SIZE, CROWN_SIZE+TRUNK_HEIGHT]
    calcBranchPos(data.tree);
}

function getContinuousThreadsInterval(branch, threadCountPerBranch)
{
    var distBetweenThreads = branch.langs.length*threadCountPerBranch/(threadCountPerBranch+1);
    return Math.max(Math.floor(distBetweenThreads), 1);
}

function fillUpThreads(branch, continuousThreads, threadCountPerBranch, threadDeg)
{
    var lemmata;
    var lemmataCount = 0;
    for(var i=continuousThreads.length;i<threadCountPerBranch;i++)
    {
        lemmata = fillDistWithLemmata(branch, lemmataCount);
        lemmataCount += lemmata.length;
        continuousThreads.push([{"branch" : branch, "deg" : threadDeg, "lemmata": lemmata}]);
        threadDeg += THREAD_DEG_INTERVAL;
    }
    return continuousThreads;   
}

function isThreadToBeContinued(i, j, continuousThreads, threadCountPerBranch, continuousThreadsInterval)
{
    return (i*threadCountPerBranch+j) % continuousThreadsInterval == 0 && continuousThreads.length < threadCountPerBranch+1;
}

function fillDistWithLemmata(branch, start)
{
    var dist = branch.dist;
    var lemmata = [];
    var coveredLength = 0;
    for(var i=start;i<branch.lemmata.length;i++)
    {
        var lemma = branch.lemmata[i];
        coveredLength += (lemma.w.length+1)*GLYPH_SIZE;
        if (coveredLength > branch.dist && i != 0)
        {
            break;
        }
        lemmata.push(lemma);
    }
    return lemmata;
}

function calcThreads(branch, threadCountPerBranch, threadDeg)
{   
    var continuousThreads = [];
    if (!branch.langs) 
    {
        return fillUpThreads(branch, continuousThreads, threadCountPerBranch, 0);         
    }
    
    var continuousThreadsInterval = getContinuousThreadsInterval(branch, threadCountPerBranch);
    threadDeg += -THREAD_DEG_INTERVAL * ((threadCountPerBranch-1)*branch.langs.length-1) / 2;
    var lemmata;
    var lemmataCount = 0;

    for (var i=0;i<branch.langs.length;i++)
    {
        var threads = calcThreads(branch.langs[i], Math.max(threadCountPerBranch-1, 1), 0);
        
        for(var j=0;j<threads.length;j++)
        {            
            if (branch != data.tree && isThreadToBeContinued(i, j, continuousThreads, threadCountPerBranch, continuousThreadsInterval))
            {
                lemmata = fillDistWithLemmata(branch, lemmataCount);
                lemmataCount += lemmata.length;
                threads[j].push({"branch" : branch, "deg" : threadDeg, "lemmata": lemmata});
                continuousThreads.push(threads[j]);
            }
            else
            {
                threads[j].push({"branch" : branch, "deg" : threadDeg, "lemmata": []});
                drawThread(threads[j]);
            }
            threadDeg += THREAD_DEG_INTERVAL;
        }
    }
    return continuousThreads;
}

function orderThread(thread)
{
    if (thread[0].branch.pos[0] > thread[thread.length-1].branch.pos[0])
    {
        thread.reverse();
        return true;
    }
    return false;
}

function applyOffset(threadElement)
{
    var xDiff = data.tree.pos[0]-threadElement.branch.pos[0];
    var yDiff = data.tree.pos[1]-threadElement.branch.pos[1];
    var branchDeg = 0;
    if (yDiff != 0)
    {
        branchDeg = Math.atan(xDiff/yDiff);
    }
    
    var deg = threadElement.deg/180*Math.PI-branchDeg;
    var x = Math.sin(deg)*THREAD_DIST;
    var y = -Math.cos(deg)*THREAD_DIST;
    
    var newX = threadElement.branch.pos[0]+x;
    var newY = threadElement.branch.pos[1]+y;

    var relativeDist = euklidianDist(threadElement.branch.pos, data.tree.pos)/THREAD_DIST;
    if (relativeDist != 0)
    {
        newX += xDiff/relativeDist;
        newY += yDiff/relativeDist;
    }
    else
    {
        newY += THREAD_DIST;
    }
    return [newX, newY];
}

function makeExplanation(lemma)
{
    var lang = data.langs[lemma.l][LANG];

    var text = lemma[LANG];
    if (text.length > 0)
    {
        text = ' ('+text+')';
    }


    var shift = lemma.sh;
    if (shift.length > 0)
    {
        shift = ' ' + DICT.shift[LANG] + ' ' + lemma.sh.replace('->', '→') + '.';
    }
    
    return lemma.w + text + ': ' + lang + '.' + shift;
}

function drawTree()
{
    initSvg();
    fillTreeWithLemmata(data.tree.langs[0], 0);
    calcTreePos();
    console.log(data.tree);   
    calcThreads(data.tree, TRUNK_LEMMATA, 0);
}
