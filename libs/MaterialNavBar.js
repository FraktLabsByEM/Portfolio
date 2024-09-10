/**
 * This is a FraktLabs Custom Element
 * 
 *      How to use?
 * 
 * 1. Add 'material-navigation' attribute on your element
 * 2. Add 'navigation-color' attribute on your element
 */

(() => {
    // retrieve nav bars
    const NavBars = document.querySelectorAll('[material-navigation]');
    NavBars.forEach(nav => {
        // add child event listener
        nav.querySelectorAll('a').forEach(ch => {
            let vertical = nav.getAttribute("navigation-vertical") != null;
            ch.addEventListener('mouseover', e => {
                let parent = e.target.parentNode;
                if (!parent.getAttribute("material-navigation") ?? false) parent = parent.parentNode;
                // reference to highlight element
                const hl = parent.querySelector('p');
                // match width and height
                const width = window.getComputedStyle(e.target, null).width;
                const height = window.getComputedStyle(e.target, null).height;
                console.log(vertical)
                hl.style.width = vertical ? '100%' : width;
                hl.style.height = height;
                // match position
                if (!vertical) hl.style.left = e.target.parentNode.offsetLeft + 'px';
                else hl.style.top = e.target.parentNode.offsetTop + 'px';
            })
        })
        // set position relative to navigation bar
        nav.style.position = 'relative';
        // create highlight element
        const hightlight = document.createElement('p');
        // set style
        hightlight.style = `position: absolute; 
            height: 100%; 
            width: 0px; 
            opacity: 0;
            pointer-events: none;
            transition: width 0.3s ease-in-out 0.15s, left 0.3s ease-in-out 0.15s, top 0.3s ease-in-out 0.15s, opacity 0.4s ease-in-out 0.3s;
            background-color: ${nav.getAttribute("navigation-color")}`;
        nav.insertBefore(hightlight, nav.firstChild);
        // add mouse in listener
        nav.addEventListener('mouseenter', e => {
            // set visible
            e.target.querySelector('p').style.opacity = 1;
        })
        // add mouse out listener
        nav.addEventListener('mouseleave', e => {
            // hide and collapse
            e.target.querySelector('p').style.opacity = 0;
            e.target.querySelector('p').style.width = '0px';
        })
    })
})()