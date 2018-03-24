var threadCounter = 0;

function toSvgDString(data, cmds)
{
    str = '';
    for(var i=0;i<data.length;i++)
    {
        str += cmds[i] + ' ' + Math.round(data[i][0]) + ' ' + Math.round(data[i][1]) + ' ';
    }
    return str;
}

function drawDot(x, y, color)
{
    if (!DEBUG) return;
    var dot = svgElement('circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('fill', color);
    svg.appendChild(dot);
}

function calcPathCoord(thread, i)
{
    var dStr = '';
    var next = applyOffset(thread[i]);
    if (i > 0)
    {   
        var last = applyOffset(thread[i-1]);
        var x = (last[0]+next[0])/2;
        var y = (last[1]+next[1])/2;
        dStr = toSvgDString([last,[x,y]], ['S', ',']);
        if (i+1 == thread.length)
        {
            dStr += toSvgDString([next], ['T']);
        }
        drawDot(x,y, 'red');
        drawDot(next[0],next[1], 'green');
    }
    else
    {
        dStr = toSvgDString([next], ['M']);
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

function makeTextPath(isReversed, startAt, threadId)
{
    var text = svgElement('text');
    var textPath = svgElement('textPath');
    var animate = svgElement('animate');
    var set = svgElement('set');
    
    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#i'+threadId);
    textPath.setAttribute('spacing', 'auto');
    animate.setAttribute('attributeName', 'startOffset');
    animate.setAttribute('begin', startAt+'s');
    animate.setAttribute('dur', (3)+'s'); 
    set.setAttribute('attributeName', 'startOffset');
    set.setAttribute('begin', '0s');
    set.setAttribute('dur', startAt+'s');     

    if (!isReversed)
    {
        textPath.setAttribute('startOffset', '100%');
        textPath.setAttribute('style', 'text-anchor:end');
        animate.setAttribute('from', '200%');
        animate.setAttribute('to', '100%');
        set.setAttribute('to', '200%');
    }
    else {
        animate.setAttribute('from', '-100%');
        animate.setAttribute('to', '0%');
        set.setAttribute('to', '-100%');
    }
    
    textPath.appendChild(animate);
    if (startAt > 0) textPath.appendChild(set);
    text.appendChild(textPath);
    svg.appendChild(text);

    return textPath;
}

function makeTooltip(lemma) 
{
    var title = svgElement('title');
    title.innerHTML = data.langs[lemma.l][LANG];
    var transcription = lemma[LANG];
    if (transcription.length > 0)
        title.innerHTML += ' ('+transcription+')';
    
    return title;
}

function makeTspan(lemma)
{
    var span = svgElement('tspan');
    span.setAttribute('fill', lemma.color);
    span.setAttribute('dy', '2');
    span.innerHTML = '&nbsp;'+lemma.w+'&nbsp;';
    span.appendChild(makeTooltip(lemma));
    return span;
}

function drawThread(thread)
{    
    var isReversed = orderThread(thread);

    var path = makePath(threadCounter);
    var textPath = makeTextPath(isReversed, 4-thread.length, threadCounter);
    
    var dStr = '';
    for (var i=0;i<thread.length;i++)
    {
        dStr += calcPathCoord(thread, i);
        for (var j=0;j<thread[i].lemmata.length;j++)
        {
            var span = makeTspan(thread[i].lemmata[j]);
            textPath.appendChild(span);
        }        
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
    svg.setAttribute('width', CROWN_SIZE*2);
    svg.setAttribute('height', CROWN_SIZE+TRUNK_HEIGHT);
    defs = svgElement('defs');

    svg.appendChild(defs);
    if (DEBUG) defs = svg;
    document.body.appendChild(svg);
}